/*
 * crm-bridge.js - Puente CRM <-> tour 3DVista (Lomas de Yanamayo I)
 *
 * Se carga despues de script.js (lo inyecta tools/sync_tour.py) y se engancha al
 * tour global SIN editar script.js ni script_general.js.
 *
 * Plan A (actual): cada lote es un overlay con data.label = L<Mz><N>-V (p.ej. LA1-V).
 *   El estado se pinta cambiando la imagen del poligono en vivo:
 *     disponible -> <img>.webp (verde, original)
 *     reservado  -> <img>_reservado.webp (amarillo)
 *     vendido    -> <img>_vendido.webp (rojo)
 * Plan B (compatibilidad): overlays con tags lote_x_{disponible,reservado,vendido};
 *   solo se muestra el overlay que coincide con el estado.
 *
 * Mensajes (siempre restringidos a location.origin):
 *   CRM -> tour : update_lots {lots:[{id,status,...}]}, update_layers {visibility:{tag:bool}}
 *   tour -> CRM : 3dvista_loaded, sync_lots {lotIds}, layers_info {layers}, select_polygon {lotId}
 */
(function () {
    'use strict';

    var ORIGIN = window.location.origin;
    var CHECK_ORIGIN = !!ORIGIN && ORIGIN !== 'null'; // file:// no tiene origen util
    var TARGET = CHECK_ORIGIN ? ORIGIN : '*';

    var LABEL_RE = /^L([A-Z])(\d+)-V$/;
    var STATUS_SUFFIXES = ['_disponible', '_reservado', '_vendido', '_adjudicado'];
    var IGNORED_TAGS = ['begin', 'tourLoaded'];
    var HOVER_OPACITY = 0.5;
    var TAG_MODE_OPACITY = 0.75;
    var TAG_MODE_HOVER_OPACITY = 0.25;
    var CLICK_DEDUPE_MS = 300;
    var POLL_MS = 250;
    var POLL_MAX_MS = 90000;

    var lotsMap = null;          // label -> {id, base, reservado, vendido}
    var lotsMapState = 'loading'; // loading | ready | failed
    var lotsById = {};           // id normalizado -> lote del CRM
    var layersVisibility = {};
    var initialized = false;
    var labelEntries = [];       // plan A
    var tagEntries = [];         // plan B
    var layerEntries = [];       // overlays con tags que no son de lote (capas)
    var extraLayers = [];
    var foundLotIds = [];
    var lastSentLayers = [];
    var lastSentLots = [];
    var lastClick = { id: '', at: 0 };

    // ---------- utilidades ----------
    function pad2(n) { return n < 10 ? '0' + n : '' + n; }

    // 'LA1-V' -> 'mza-01'; 'lote_mza_1' / 'mza01' / 'a-1' -> 'mza-01'
    function normalizeLotId(raw) {
        if (!raw) return '';
        var s = String(raw).toLowerCase().trim().replace(/^lote[-_\s]*/, '').replace(/[_\s]+/g, '-');
        var m = s.match(/^(?:mz)?-?([a-z])-?(\d+)$/);
        if (m) return 'mz' + m[1] + '-' + pad2(parseInt(m[2], 10));
        return s;
    }

    function idFromLabel(label) {
        var m = LABEL_RE.exec(label);
        return m ? 'mz' + m[1].toLowerCase() + '-' + pad2(parseInt(m[2], 10)) : '';
    }

    function postToParent(message) {
        try { window.parent.postMessage(message, TARGET); } catch (e) { /* sin padre */ }
    }

    function urlFor(baseUrl, state) {
        var q = baseUrl.indexOf('?');
        var path = q >= 0 ? baseUrl.slice(0, q) : baseUrl;
        var query = q >= 0 ? baseUrl.slice(q) : '';
        if (state === 'reservado' || state === 'vendido') path = path.replace(/\.webp$/, '_' + state + '.webp');
        return path + query;
    }

    function stripStateFromUrl(url) {
        return url.replace(/_(reservado|vendido)\.webp(\?|$)/, '.webp$2');
    }

    function statusOf(lotId) {
        var lot = lotsById[lotId];
        return lot ? String(lot.status || 'disponible').toLowerCase().trim() : 'disponible';
    }

    function splitStatusTag(tag) {
        for (var i = 0; i < STATUS_SUFFIXES.length; i++) {
            var idx = tag.indexOf(STATUS_SUFFIXES[i]);
            if (idx > 0) return { base: tag.slice(0, idx), status: STATUS_SUFFIXES[i].slice(1) };
        }
        return null;
    }

    function safeGet(obj, key) {
        try { return obj && obj.get ? obj.get(key) : undefined; } catch (e) { return undefined; }
    }

    // ---------- clic / hover ----------
    function bindInteractions(overlay, lotId, onEnter, onLeave) {
        var onClick = function () {
            var now = new Date().getTime();
            if (lastClick.id === lotId && now - lastClick.at < CLICK_DEDUPE_MS) return;
            lastClick = { id: lotId, at: now };
            postToParent({ type: 'select_polygon', lotId: lotId });
        };
        var targets = [overlay];
        var areas = safeGet(overlay, 'areas');
        var items = safeGet(overlay, 'items');
        var i;
        if (areas && areas.length) for (i = 0; i < areas.length; i++) if (areas[i]) targets.push(areas[i]);
        if (items && items.length) for (i = 0; i < items.length; i++) if (items[i]) targets.push(items[i]);

        targets.forEach(function (el) {
            try {
                if (el.set) el.set('useHandCursor', true);
                if (!el.bind) return;
                el.bind('click', onClick);
                el.bind('pointerClick', onClick);
                ['rollOver', 'mouseEnter', 'pointerOver'].forEach(function (ev) { el.bind(ev, onEnter); });
                ['rollOut', 'mouseLeave', 'pointerOut'].forEach(function (ev) { el.bind(ev, onLeave); });
            } catch (e) { /* un elemento sin eventos no debe romper el resto */ }
        });
    }

    // ---------- descubrimiento de overlays ----------
    function collect() {
        var overlays;
        try { overlays = tour.player.getByClassName('HotspotPanoramaOverlay') || []; } catch (e) { return 0; }

        labelEntries = []; tagEntries = []; layerEntries = []; extraLayers = []; foundLotIds = [];

        overlays.forEach(function (overlay) {
            var data = safeGet(overlay, 'data') || {};
            var label = data.label;
            var tags = (data.tags || []).filter(function (t) { return IGNORED_TAGS.indexOf(t) === -1; });

            // Plan A: overlay de lote por etiqueta
            if (typeof label === 'string' && LABEL_RE.test(label)) {
                var items = safeGet(overlay, 'items');
                var item = items && items[0];
                var image = safeGet(item, 'image');
                var levels = safeGet(image, 'levels');
                var level = levels && levels[0];
                var current = safeGet(level, 'url');
                if (!level || typeof current !== 'string') return;
                var lotId = (lotsMap && lotsMap[label] && lotsMap[label].id) || idFromLabel(label);
                var entry = {
                    overlay: overlay, item: item, level: level, lotId: lotId,
                    baseUrl: stripStateFromUrl(current), applied: 'disponible',
                    baseOpacity: safeGet(item, 'opacity')
                };
                if (typeof entry.baseOpacity !== 'number') entry.baseOpacity = 1;
                if (current !== entry.baseUrl) entry.applied = /_vendido\.webp/.test(current) ? 'vendido' : 'reservado';
                bindInteractions(overlay, lotId,
                    function () { try { item.set('opacity', HOVER_OPACITY); } catch (e) {} },
                    function () { try { item.set('opacity', entry.baseOpacity); } catch (e) {} });
                labelEntries.push(entry);
                if (foundLotIds.indexOf(lotId) === -1) foundLotIds.push(lotId);
                return;
            }

            if (!tags.length) return;

            // Plan B: overlays con tag lote_x_<estado>
            var stateTag = null, layerTags = [];
            tags.forEach(function (t) {
                var parsed = splitStatusTag(t);
                if (parsed && !stateTag) stateTag = parsed; else layerTags.push(t);
            });
            layerTags.forEach(function (t) { if (extraLayers.indexOf(t) === -1) extraLayers.push(t); });

            if (stateTag) {
                var tItems = safeGet(overlay, 'items');
                var tItem = tItems && tItems[0];
                var tLotId = normalizeLotId(stateTag.base);
                var tEntry = { overlay: overlay, item: tItem, lotId: tLotId, state: stateTag.status, layerTags: layerTags };
                bindInteractions(overlay, tLotId,
                    function () { try { if (tItem) tItem.set('opacity', TAG_MODE_HOVER_OPACITY); } catch (e) {} },
                    function () { try { if (tItem) tItem.set('opacity', tEntry.visibleOpacity); } catch (e) {} });
                tagEntries.push(tEntry);
                if (tLotId && foundLotIds.indexOf(tLotId) === -1) foundLotIds.push(tLotId);
            } else {
                layerEntries.push({ overlay: overlay, layerTags: layerTags, hidden: false });
            }
        });

        return labelEntries.length + tagEntries.length;
    }

    function isHiddenByLayer(layerTags) {
        for (var i = 0; i < layerTags.length; i++) if (layersVisibility[layerTags[i]] === false) return true;
        return false;
    }

    // ---------- aplicar estado ----------
    function refreshTourState() {
        labelEntries.forEach(function (entry) {
            var status = statusOf(entry.lotId);
            var state = (status === 'reservado' || status === 'vendido') ? status : 'disponible';
            if (entry.applied === state) return;
            try {
                entry.level.set('url', urlFor(entry.baseUrl, state));
                entry.applied = state;
            } catch (e) { /* se reintenta en el proximo refresh */ }
        });

        tagEntries.forEach(function (entry) {
            var match = statusOf(entry.lotId) === entry.state;
            var visible = match && !isHiddenByLayer(entry.layerTags);
            entry.visibleOpacity = visible ? TAG_MODE_OPACITY : 0;
            try {
                entry.overlay.set('visible', visible);
                entry.overlay.set('enabled', visible);
                if (entry.item) entry.item.set('opacity', entry.visibleOpacity);
            } catch (e) {}
        });

        layerEntries.forEach(function (entry) {
            var hidden = isHiddenByLayer(entry.layerTags);
            if (hidden === entry.hidden) return;
            entry.hidden = hidden;
            try {
                entry.overlay.set('visible', !hidden);
                entry.overlay.set('enabled', !hidden);
            } catch (e) {}
        });
    }

    function sameList(a, b) {
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
    }

    function reportToParent() {
        if (extraLayers.length > 0 && !sameList(extraLayers, lastSentLayers)) {
            postToParent({ type: 'layers_info', layers: extraLayers.slice() });
            lastSentLayers = extraLayers.slice();
        }
        if (foundLotIds.length > 0 && !sameList(foundLotIds, lastSentLots)) {
            postToParent({ type: 'sync_lots', lotIds: foundLotIds.slice() });
            lastSentLots = foundLotIds.slice();
        }
    }

    // ---------- arranque ----------
    function tryInit() {
        if (initialized) return;
        if (lotsMapState === 'loading') return;
        if (!(window.tour && window.tour.player)) return;
        if (collect() === 0) return; // el tour aun no cargo los overlays
        initialized = true;
        refreshTourState();
        reportToParent();
        postToParent({ type: '3dvista_loaded' });
    }

    function loadLotsMap() {
        if (!window.fetch) { lotsMapState = 'failed'; return; }
        fetch('lots-map.json', { credentials: 'same-origin' })
            .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(function (json) { lotsMap = json; lotsMapState = 'ready'; })
            .catch(function () { lotsMapState = 'failed'; }) // se deriva el id desde la etiqueta
            .then(tryInit);
    }

    function hookTour() {
        try {
            if (window.tour && window.TDV && TDV.Tour && TDV.Tour.EVENT_TOUR_LOADED) {
                window.tour.bind(TDV.Tour.EVENT_TOUR_LOADED, tryInit);
            }
        } catch (e) {}
        tryInit();
    }

    window.addEventListener('message', function (event) {
        if (CHECK_ORIGIN && event.origin !== ORIGIN) return;
        if (event.source !== window.parent && event.source !== window) return;
        var msg = event.data;
        if (!msg || typeof msg !== 'object') return;

        if (msg.type === 'update_lots') {
            var list = msg.lots || msg.data || [];
            lotsById = {};
            for (var i = 0; i < list.length; i++) {
                if (list[i] && list[i].id) lotsById[normalizeLotId(list[i].id)] = list[i];
            }
            if (initialized) refreshTourState();
        } else if (msg.type === 'update_layers') {
            layersVisibility = msg.visibility || {};
            if (initialized) refreshTourState();
        }
    });

    // script.js registro su DOMContentLoaded antes que este: aqui `tour` ya existe.
    document.addEventListener('DOMContentLoaded', hookTour);
    loadLotsMap();

    var waited = 0;
    var poll = setInterval(function () {
        waited += POLL_MS;
        tryInit();
        if (initialized || waited >= POLL_MAX_MS) clearInterval(poll);
    }, POLL_MS);

    // Solo lectura, util para diagnostico desde la consola.
    window.__crmBridge = {
        stats: function () {
            return {
                initialized: initialized, lots: labelEntries.length, tagOverlays: tagEntries.length,
                layers: extraLayers.slice(), lotsFromCrm: Object.keys(lotsById).length
            };
        },
        applied: function () {
            return labelEntries.map(function (e) { return { id: e.lotId, state: e.applied }; });
        }
    };
})();
