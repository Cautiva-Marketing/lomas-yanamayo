import React, { useState, useEffect, useRef, useMemo } from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";
import { Map, Users, Edit3, DollarSign, Maximize, User, CheckCircle, Lock, X, Menu, LogOut, Power, MessageCircle, Phone, ArrowUpDown, FileText, Download, Upload, AlertTriangle, Settings, Save, Clock, Sun, Moon, Eye, EyeOff, Calendar, Filter, BarChart3, Plus, Trash2, ChevronLeft, ChevronRight, Globe, Search, Layers, Navigation, Shield, Key, UserCheck, UserPlus, Palette, Crown, Briefcase } from "https://esm.sh/lucide-react@0.292.0";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, LabelList } from "https://esm.sh/recharts@2.12.7";
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, setDoc, onSnapshot, updateDoc, writeBatch, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { LOTS } from "./lots.js";
const GLOBAL_COPYRIGHT_TEXT = "\xA9 POWERED BY CAUTIVA MARKETING";
const ASESOR_COLORS = [
  "#3b82f6",
  // Azul
  "#8b5cf6",
  // Morado
  "#ec4899",
  // Rosa
  "#f59e0b",
  // Ámbar
  "#10b981",
  // Esmeralda
  "#06b6d4",
  // Cian
  "#6366f1",
  // Índigo
  "#f43f5e",
  // Rosa Intenso
  "#14b8a6",
  // Turquesa
  "#f97316"
  // Naranja
];
window.onclick = () => {
};
window.onerror = function(message, source, lineno, colno, error) {
  console.error("\u274C ERROR CR\xCDTICO DETECTADO:", message, "en l\xEDnea", lineno);
  const root2 = document.getElementById("root");
  if (root2) {
    root2.innerHTML = `<div style="padding: 40px; text-align: center; font-family: sans-serif; background: #fff1f2; color: #9f1239; border: 2px solid #fda4af; border-radius: 20px; margin: 20px;">
                    <h1 style="font-weight: 900; margin-bottom: 10px;">\xA1Ups! Error al Cargar</h1>
                    <p style="font-size: 14px; margin-bottom: 20px;">${message}</p>
                    <p style="font-size: 11px; opacity: 0.7;">Intenta recargar con Shift + F5</p>
                </div>`;
  }
  return false;
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
const getLotsCollection = () => collection(db, "lotes");
const getLotDoc = (id) => doc(db, "lotes", id);
const getConfigDoc = () => doc(db, "config", "public");
const getUsersCollection = () => collection(db, "usuarios");
const getUserDoc = (uid) => doc(db, "usuarios", uid);
const authErrorMessage = (err) => {
  const code = err && err.code || "";
  const map = {
    "auth/invalid-credential": "Correo o contrase\xF1a incorrectos.",
    "auth/wrong-password": "Correo o contrase\xF1a incorrectos.",
    "auth/user-not-found": "Correo o contrase\xF1a incorrectos.",
    "auth/invalid-email": "El correo no es v\xE1lido.",
    "auth/user-disabled": "Esta cuenta est\xE1 deshabilitada.",
    "auth/too-many-requests": "Demasiados intentos. Espera unos minutos e int\xE9ntalo de nuevo.",
    "auth/network-request-failed": "Sin conexi\xF3n. Revisa tu internet.",
    "auth/email-already-in-use": "Ese correo ya tiene una cuenta. Si es un usuario desactivado, react\xEDvalo desde la lista de usuarios.",
    "auth/weak-password": "La contrase\xF1a debe tener al menos 6 caracteres.",
    "auth/operation-not-allowed": "El acceso con correo y contrase\xF1a no est\xE1 activado en Firebase Authentication.",
    "permission-denied": "No tienes permiso para realizar esta acci\xF3n."
  };
  return map[code] || err && err.message || "Ocurri\xF3 un error inesperado.";
};
const USE_REAL_3DVISTA = true;
const TOUR_URL = "./tour/index.htm?skip-loading=true";
const TOUR_ORIGIN = window.location.origin;
const LOT_INDEX = LOTS.reduce((acc, l, i) => {
  acc[l.id] = i;
  return acc;
}, {});
const isKnownLotId = (id) => Object.prototype.hasOwnProperty.call(LOT_INDEX, id);
const getCanonicalLotId = (rawId) => {
  if (!rawId) return "";
  const lower = String(rawId).toLowerCase().trim();
  const pad = (n) => String(parseInt(n, 10)).padStart(2, "0");
  let m = lower.match(/^l([a-z])(\d+)-v$/);
  if (m) return `mz${m[1]}-${pad(m[2])}`;
  m = lower.match(/^mz\s*([a-z])\s*[-–]?\s*lote\s*0*(\d+)$/);
  if (m) return `mz${m[1]}-${pad(m[2])}`;
  const s = lower.replace(/^lote[-_\s]*/, "").replace(/[_\s]+/g, "-");
  m = s.match(/^(?:mz)?-?([a-z])-?(\d+)$/);
  if (m) return `mz${m[1]}-${pad(m[2])}`;
  return s;
};
const getAutoLotName = (rawId) => {
  const id = getCanonicalLotId(rawId);
  const m = id.match(/^mz([a-z])-(\d+)$/);
  return m ? `Mz ${m[1].toUpperCase()} - Lote ${m[2]}` : String(rawId || "");
};
const isCleanLotId = (id) => !!id;
const LotesIniciales = LOTS.map((l) => ({ id: l.id, name: l.name, price: 0, status: "disponible", color: "#10b981", area: 0, asesor: "", asesorUid: null }));
const getLotRank = (item) => {
  const id = getCanonicalLotId(item && item.id !== void 0 ? item.id : item);
  return isKnownLotId(id) ? LOT_INDEX[id] : 1e5;
};
const sortLotsNaturally = (list) => {
  return [...list].sort((a, b) => {
    const rankA = getLotRank(a);
    const rankB = getLotRank(b);
    if (rankA !== rankB) return rankA - rankB;
    return String(a.id || "").localeCompare(String(b.id || ""), void 0, { numeric: true, sensitivity: "base" });
  });
};
const DEFAULT_STATUSES = {
  disponible: { id: "disponible", label: "Disponible", color: "#10b981", isBlocked: false },
  reservado: { id: "reservado", label: "Reservado", color: "#f59e0b", isBlocked: false },
  vendido: { id: "vendido", label: "Vendido", color: "#ef4444", isBlocked: false }
};
function App() {
  const [user, setUser] = useState(null);
  const [lots, setLots] = useState([]);
  const [showBanner, setShowBanner] = useState(false);
  const [hasDismissedBanner, setHasDismissedBanner] = useState(() => localStorage.getItem("crm_dismissed_banner") === "true");
  const [config, setConfig] = useState(null);
  const [firebaseError, setFirebaseError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("crm_theme");
    if (savedTheme === "dark") return true;
    return false;
  });
  const [isTourLoaded, setIsTourLoaded] = useState(false);
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
    });
  }, []);
  useEffect(() => {
    const appTitle = config?.appName || "Plano 360\xB0 - Lomas de Yanamayo I";
    const appIcon = config?.appIcon || "img/icon-512.png";
    const iconUrl = new URL(appIcon, window.location.href).href;
    const manifest = {
      name: appTitle,
      short_name: "Lomas Yanamayo I",
      display: "standalone",
      start_url: new URL(".", window.location.href).href,
      background_color: "#111111",
      theme_color: "#111111",
      icons: [
        { src: iconUrl, sizes: "512x512", type: "image/png", purpose: "any maskable" },
        { src: iconUrl, sizes: "192x192", type: "image/png" }
      ]
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
    const manifestURL = URL.createObjectURL(blob);
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) manifestLink.href = manifestURL;
    [{ rel: "apple-touch-icon" }, { rel: "icon" }].forEach((tag) => {
      const el = document.querySelector(`link[rel="${tag.rel}"]`);
      if (el) el.href = appIcon;
    });
    document.title = appTitle;
    try {
      Object.defineProperty(document, "title", {
        set: function() {
        },
        get: function() {
          return appTitle;
        }
      });
    } catch (e) {
    }
  }, [config?.appName, config?.appIcon]);
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("crm_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("crm_theme", "light");
    }
  }, [isDarkMode]);
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [view, setView] = useState("map");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editForm, setEditForm] = useState({});
  const [isStatusSelectorOpen, setIsStatusSelectorOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const isAgent = !!currentUser;
  const isAdmin = currentUser?.role === "admin";
  const welcomeRef = useRef(false);
  const [userInput, setUserInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [lastViewedLot, setLastViewedLot] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsesorFilter, setSelectedAsesorFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [showClientMenu, setShowClientMenu] = useState(false);
  const [extraLayers, setExtraLayers] = useState([]);
  const lastProcessedLayersRef = useRef([]);
  const [layerVisibility, setLayerVisibility] = useState({});
  const activeStatuses = useMemo(() => {
    const saved = config?.statusConfig || {};
    const merged = {};
    Object.keys(DEFAULT_STATUSES).forEach((id) => {
      merged[id] = { ...DEFAULT_STATUSES[id], ...saved[id] || {}, id, color: DEFAULT_STATUSES[id].color };
    });
    return merged;
  }, [config?.statusConfig]);
  const activeStatusesRef = useRef(activeStatuses);
  useEffect(() => {
    activeStatusesRef.current = activeStatuses;
  }, [activeStatuses]);
  const [usersList, setUsersList] = useState([]);
  const asesoresList = useMemo(() => {
    const fromUsers = usersList.filter((u) => u.role === "asesor").map((u) => u.name);
    const fromLots = lots.map((l) => l.asesor).filter(Boolean);
    return Array.from(/* @__PURE__ */ new Set([...fromUsers, ...fromLots])).filter((n) => typeof n === "string" && n.trim().length > 0);
  }, [usersList, lots]);
  const getAsesorColor = (name) => {
    if (!name || name === "Sin Asesor Asignado") return "#9ca3af";
    const u = usersList.find((x) => x.name === name && x.color);
    if (u) return u.color;
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return ASESOR_COLORS[Math.abs(hash) % ASESOR_COLORS.length];
  };
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "asesor", color: "" });
  const [userFormError, setUserFormError] = useState("");
  const [userSaving, setUserSaving] = useState(false);
  const handleSaveUser = async (e) => {
    if (e) e.preventDefault();
    if (!isAdmin || userSaving) return;
    const cleanN = (userForm.name || "").trim();
    const cleanE = (userForm.email || "").trim().toLowerCase();
    const cleanP = userForm.password || "";
    if (!cleanN) {
      setUserFormError("El nombre es obligatorio.");
      return;
    }
    if (!editingUser) {
      if (!cleanE) {
        setUserFormError("El correo es obligatorio.");
        return;
      }
      if (cleanP.length < 6) {
        setUserFormError("La contrase\xF1a inicial debe tener al menos 6 caracteres.");
        return;
      }
    }
    if (editingUser && editingUser.id === currentUser.id && userForm.role !== "admin") {
      setUserFormError("No puedes quitarte el rol de administrador a ti mismo.");
      return;
    }
    setUserSaving(true);
    try {
      const color = userForm.color || "";
      if (editingUser) {
        await updateDoc(getUserDoc(editingUser.id), { name: cleanN, role: userForm.role, color });
        if (cleanN !== editingUser.name) {
          const batch = writeBatch(db);
          let changed = 0;
          lots.forEach((l) => {
            if (l.asesorUid === editingUser.id) {
              batch.update(getLotDoc(l.id), { asesor: cleanN });
              changed++;
            }
          });
          if (changed > 0) await batch.commit();
        }
      } else {
        const secondary = initializeApp(firebaseConfig, "crear-usuario-" + Date.now());
        try {
          const secAuth = getAuth(secondary);
          const cred = await createUserWithEmailAndPassword(secAuth, cleanE, cleanP);
          await setDoc(getUserDoc(cred.user.uid), { name: cleanN, email: cleanE, role: userForm.role, color, active: true, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
          await signOut(secAuth);
        } finally {
          await deleteApp(secondary);
        }
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ name: "", email: "", password: "", role: "asesor", color: "" });
      setUserFormError("");
      setToastMessage({ type: "success", text: editingUser ? "Usuario actualizado con \xE9xito." : "Usuario creado. Entr\xE9gale su correo y su contrase\xF1a inicial." });
    } catch (err) {
      console.error("Error guardando usuario:", err);
      setUserFormError(authErrorMessage(err));
    } finally {
      setUserSaving(false);
    }
  };
  const handleToggleUserActive = async (usr) => {
    if (!isAdmin) return;
    if (usr.id === currentUser.id) {
      setToastMessage({ type: "error", text: "No puedes desactivar tu propia cuenta." });
      return;
    }
    const nextActive = usr.active === false;
    try {
      await updateDoc(getUserDoc(usr.id), { active: nextActive });
      setToastMessage({ type: "success", text: nextActive ? `Acceso de ${usr.name} reactivado.` : `Acceso de ${usr.name} desactivado. Sus lotes conservan el registro.` });
    } catch (err) {
      console.error("Error cambiando el acceso:", err);
      setToastMessage({ type: "error", text: authErrorMessage(err) });
    }
  };
  const toggleLayer = (layerId, isVisible) => {
    setLayerVisibility((prev) => ({ ...prev, [layerId]: isVisible }));
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: "toggle_visibility",
        overlayId: layerId,
        visible: isVisible
      }, TOUR_ORIGIN);
    }
  };
  const lotsRef = useRef([]);
  const iframeRef = useRef(null);
  const bottomSheetRef = useRef(null);
  useEffect(() => {
    lotsRef.current = lots;
  }, [lots]);
  useEffect(() => {
    let showTimer;
    let hideTimer;
    if (view === "map" && !hasDismissedBanner) {
      showTimer = setTimeout(() => {
        if (!hasDismissedBanner) {
          setShowBanner(true);
          hideTimer = setTimeout(() => {
            setShowBanner(false);
          }, 5e3);
        }
      }, 2e3);
    } else {
      setShowBanner(false);
    }
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [view, hasDismissedBanner]);
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && lots.length > 0) {
      iframeRef.current.contentWindow.postMessage({ type: "update_lots", lots }, TOUR_ORIGIN);
    }
  }, [lots]);
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "SET_IS_AGENT", isAgent }, TOUR_ORIGIN);
    }
  }, [isAgent]);
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "update_layers", visibility: layerVisibility }, TOUR_ORIGIN);
    }
  }, [layerVisibility]);
  const handleIframeLoad = () => {
    setIsTourLoaded(true);
    const win = iframeRef.current?.contentWindow;
    if (win && lots.length > 0) {
      win.postMessage({ type: "update_lots", lots: lotsRef.current }, TOUR_ORIGIN);
    }
    if (win) {
      win.postMessage({ type: "SET_IS_AGENT", isAgent }, TOUR_ORIGIN);
      win.postMessage({ type: "update_layers", visibility: layerVisibility }, TOUR_ORIGIN);
    }
    try {
      if (win && win.document) {
        win.addEventListener("contextmenu", function(e) {
          e.stopPropagation();
          e.preventDefault();
        }, true);
      }
    } catch (err) {
      console.error("No se pudo bloquear el clic derecho", err);
    }
  };
  useEffect(() => {
    let unsubProfile = null;
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }
      setUser(fbUser);
      if (!fbUser) {
        setCurrentUser(null);
        setAuthReady(true);
        return;
      }
      unsubProfile = onSnapshot(getUserDoc(fbUser.uid), (snap) => {
        if (!snap.exists() && snap.metadata.fromCache) return;
        const data = snap.exists() ? snap.data() : null;
        if (!data || data.active === false || data.role !== "admin" && data.role !== "asesor") {
          setCurrentUser(null);
          setAuthReady(true);
          signOut(auth).catch(() => {
          });
          setToastMessage({ type: "error", text: "Tu cuenta no tiene acceso al CRM. Contacta al administrador." });
          return;
        }
        setCurrentUser({
          id: fbUser.uid,
          name: data.name || fbUser.email,
          email: data.email || fbUser.email,
          role: data.role,
          color: data.color || ""
        });
        setAuthReady(true);
        if (welcomeRef.current) {
          welcomeRef.current = false;
          setToastMessage({ type: "success", text: `\xA1Bienvenido(a), ${data.name || fbUser.email}!` });
        }
      }, (error) => {
        console.error("Error leyendo el perfil del usuario:", error);
        setCurrentUser(null);
        setAuthReady(true);
      });
    });
    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);
  useEffect(() => {
    if (currentUser?.role !== "admin") {
      setUsersList([]);
      return;
    }
    return onSnapshot(getUsersCollection(), (snap) => {
      setUsersList(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))));
    }, (error) => console.error("Error leyendo usuarios:", error));
  }, [currentUser?.role]);
  useEffect(() => {
    console.log("\u{1F4E1} Suscribiendo a cambios en Firestore...");
    const unsubLots = onSnapshot(getLotsCollection(), (snapshot) => {
      const source = snapshot.metadata.fromCache ? "\u{1F7E2} CACH\xC9" : "\u2601\uFE0F SERVIDOR";
      console.log(`[Firestore] ${snapshot.docs.length} lotes recibidos desde ${source}`);
      const loadedLots = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLots(sortLotsNaturally(loadedLots.filter((l) => isCleanLotId(l.id))));
    }, (error) => {
      console.error("\u274C Error en Snapshot:", error);
      setFirebaseError("Error al sincronizar los lotes con la base de datos.");
    });
    const unsubConfig = onSnapshot(getConfigDoc(), (snap) => {
      if (snap.exists()) setConfig((prev) => ({ ...prev, ...snap.data() }));
    }, (error) => console.error("\u274C Error leyendo la configuraci\xF3n:", error));
    return () => {
      console.log("\u{1F50C} Desconectando de Firestore...");
      unsubLots();
      unsubConfig();
    };
  }, []);
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) return;
      let payload = event.data;
      const win = event.source;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
        }
      }
      if (payload && payload.type === "layers_info" && Array.isArray(payload.layers)) {
        const layersStr = JSON.stringify(payload.layers);
        if (layersStr !== JSON.stringify(lastProcessedLayersRef.current)) {
          console.log("Capas detectadas (nuevas):", payload.layers);
          lastProcessedLayersRef.current = payload.layers;
          setExtraLayers(payload.layers);
          const initialVis = {};
          payload.layers.forEach((layer) => {
            initialVis[layer] = true;
          });
          setLayerVisibility((prev) => ({ ...initialVis, ...prev }));
        }
      }
      if (payload && (payload.type === "3dvista_loaded" || payload === "tourLoaded")) {
        console.log("Tour detectado. Sincronizando lotes...");
        setIsTourLoaded(true);
        if (win && win.postMessage && lotsRef.current && lotsRef.current.length > 0) {
          win.postMessage({ type: "update_lots", lots: lotsRef.current }, TOUR_ORIGIN);
        }
      }
      if (payload && payload.type === "sync_lots" && Array.isArray(payload.lotIds)) {
        if (win && win.postMessage && lotsRef.current && lotsRef.current.length > 0) {
          win.postMessage({ type: "update_lots", lots: lotsRef.current }, TOUR_ORIGIN);
        }
      }
      if (payload && payload.type === "select_polygon" && payload.lotId) {
        const rawLotId = String(payload.lotId).trim();
        if (rawLotId === "begin" || rawLotId === "tourLoaded" || rawLotId === "undefined" || rawLotId === "") return;
        const lotId = getCanonicalLotId(rawLotId);
        setSelectedLotId(lotId);
        setView("map");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isAgent]);
  const canEditLot = (lot) => {
    if (!currentUser || !lot) return false;
    if (currentUser.role === "admin") return true;
    return (lot.status || "disponible") === "disponible" || lot.asesorUid === currentUser.id;
  };
  const handleUpdateLot = async (lotId, field, value) => {
    if (!isAgent) return;
    const lot = lots.find((l) => l.id === lotId);
    const catalogLot = !lot && isKnownLotId(lotId) ? LotesIniciales.find((l) => l.id === lotId) : null;
    if (!lot && !(isAdmin && catalogLot)) {
      setToastMessage({ type: "error", text: 'Este lote a\xFAn no existe en la base de datos. Pide al administrador que pulse "Sincronizar" en la lista de lotes.' });
      return;
    }
    const targetLot = lot || catalogLot;
    if (!canEditLot(targetLot)) {
      setToastMessage({ type: "error", text: `Este lote est\xE1 asignado a ${targetLot.asesor || "otro asesor"}. Solo ese asesor o el administrador pueden modificarlo.` });
      return;
    }
    if (!isAdmin && field !== "status") return;
    try {
      const updates = { [field]: value };
      if (field === "status") {
        if (activeStatuses[value]) updates.color = activeStatuses[value].color;
        updates.statusDate = (/* @__PURE__ */ new Date()).toISOString();
        if (value === "disponible") {
          updates.asesor = "";
          updates.asesorUid = null;
        } else if (!isAdmin) {
          updates.asesor = currentUser.name;
          updates.asesorUid = currentUser.id;
        }
      }
      if (lot) {
        await updateDoc(getLotDoc(lotId), updates);
      } else {
        await setDoc(getLotDoc(lotId), { ...catalogLot, ...updates }, { merge: true });
      }
    } catch (error) {
      console.error("Error actualizando:", error);
      setToastMessage({ type: "error", text: error.code === "permission-denied" ? "No se pudo guardar: otro asesor tom\xF3 este lote o no tienes permiso." : "No se pudo guardar el cambio. Int\xE9ntalo de nuevo." });
    }
  };
  const handleAssignAsesor = async (lotId, uid) => {
    if (!isAdmin) return;
    const u = usersList.find((x) => x.id === uid);
    try {
      await updateDoc(getLotDoc(lotId), { asesorUid: uid || null, asesor: u ? u.name : "" });
    } catch (error) {
      console.error("Error asignando asesor:", error);
      setToastMessage({ type: "error", text: "No se pudo asignar el asesor." });
    }
  };
  const handleSyncColors = async () => {
    if (!isAdmin) return;
    try {
      const batch = writeBatch(db);
      let colorCount = 0;
      let newLotCount = 0;
      LotesIniciales.forEach((initLot) => {
        const exists = lots.find((l) => getCanonicalLotId(l.id) === initLot.id);
        if (!exists) {
          batch.set(getLotDoc(initLot.id), initLot);
          newLotCount++;
        }
      });
      lots.forEach((lot) => {
        const correctColor = activeStatuses[lot.status]?.color || "#10b981";
        if (lot.color !== correctColor) {
          batch.update(getLotDoc(lot.id), { color: correctColor });
          colorCount++;
        }
      });
      if (newLotCount > 0 || colorCount > 0) {
        await batch.commit();
        setToastMessage({ type: "success", text: `\xA1Sincronizaci\xF3n completa! ${newLotCount > 0 ? `Se crearon ${newLotCount} lotes nuevos. ` : ""}${colorCount > 0 ? `Se actualizaron ${colorCount} colores.` : ""}` });
      } else {
        setToastMessage({ type: "success", text: `Los ${LOTS.length} lotes y sus colores ya est\xE1n sincronizados.` });
      }
    } catch (error) {
      console.error("Error sincronizando:", error);
      setToastMessage({ type: "error", text: "Error al sincronizar los lotes." });
    }
  };
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const email = (userInput || "").trim();
    const pass = passwordInput || "";
    if (!email || !pass) {
      setLoginError("Por favor ingresa tu correo y contrase\xF1a.");
      return;
    }
    setLoginBusy(true);
    setLoginError("");
    try {
      welcomeRef.current = true;
      await signInWithEmailAndPassword(auth, email, pass);
      setSelectedAsesorFilter("all");
      setShowLogin(false);
      setUserInput("");
      setPasswordInput("");
    } catch (err) {
      welcomeRef.current = false;
      setLoginError(authErrorMessage(err));
    } finally {
      setLoginBusy(false);
    }
  };
  const handleForgotPassword = async () => {
    const email = (userInput || "").trim();
    if (!email) {
      setLoginError('Escribe tu correo arriba y vuelve a pulsar "\xBFOlvidaste tu contrase\xF1a?".');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setLoginError("");
      setToastMessage({ type: "success", text: "Si el correo est\xE1 registrado, te enviamos un enlace para restablecer la contrase\xF1a." });
    } catch (err) {
      setLoginError(authErrorMessage(err));
    }
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error cerrando sesi\xF3n:", err);
    }
    setSelectedAsesorFilter("all");
    setView("map");
    setIsMenuOpen(false);
  };
  useEffect(() => {
    if (!authReady) return;
    if (view === "config" && !isAdmin || view === "charts" && !isAgent) setView("map");
  }, [view, isAdmin, isAgent, authReady]);
  const saveConfigToFirebase = async () => {
    if (!isAdmin) return;
    try {
      const dataToSave = {
        whatsapp: config?.whatsapp || "",
        phone: config?.phone || "",
        currency: config?.currency ?? "$",
        hidePrice: config?.hidePrice ?? false,
        statusConfig: activeStatuses,
        appName: config?.appName || "",
        appIcon: config?.appIcon || "",
        layerNames: config?.layerNames || {}
      };
      await setDoc(getConfigDoc(), dataToSave);
      setToastMessage({ type: "success", text: "Configuraci\xF3n guardada correctamente." });
    } catch (error) {
      console.error("Error guardando config:", error);
      setToastMessage({ type: "error", text: "No se pudo guardar la configuraci\xF3n: " + authErrorMessage(error) });
    }
  };
  const handleSort = (column) => {
    if (sortColumn === column) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };
  const filteredLots = useMemo(() => {
    let baseLots = lots;
    if (!isAgent) {
      baseLots = lots.filter((l) => !activeStatuses[l.status]?.isBlocked);
    }
    if (selectedAsesorFilter !== "all") {
      if (selectedAsesorFilter === "__sin_asesor__") {
        baseLots = baseLots.filter((l) => !l.asesor);
      } else {
        baseLots = baseLots.filter((l) => l.asesor === selectedAsesorFilter);
      }
    }
    const term = searchTerm.toLowerCase().trim();
    if (!term) return baseLots;
    const normalize = (s) => s.toLowerCase().replace(/\s+/g, " ").replace(/\b0+(\d+)/g, "$1");
    const keywords = normalize(term).split(" ").filter((k) => k.length > 0);
    return baseLots.filter((l) => {
      const textToSearch = normalize(`${l.name} ${l.area} ${l.price} ${isAgent ? l.asesor || "" : ""}`);
      return keywords.every((k) => {
        if (/^\d+$/.test(k)) {
          const regex = new RegExp(`\\b${k}\\b`);
          return regex.test(textToSearch);
        }
        return textToSearch.includes(k);
      });
    });
  }, [lots, searchTerm, isAgent, activeStatuses, selectedAsesorFilter]);
  const sortedLots = useMemo(() => {
    return [...filteredLots].sort((a, b) => {
      if (sortColumn === "name" || sortColumn === "id") {
        const rankA = getLotRank(a);
        const rankB = getLotRank(b);
        if (rankA !== rankB) {
          return sortOrder === "asc" ? rankA - rankB : rankB - rankA;
        }
        return sortOrder === "asc" ? String(a.id).localeCompare(String(b.id), void 0, { numeric: true, sensitivity: "base" }) : String(b.id).localeCompare(String(a.id), void 0, { numeric: true, sensitivity: "base" });
      }
      let valA = sortColumn === "asesor" ? a.asesor || "" : a[sortColumn] ?? "";
      let valB = sortColumn === "asesor" ? b.asesor || "" : b[sortColumn] ?? "";
      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
      return sortOrder === "asc" ? String(valA).localeCompare(String(valB), void 0, { numeric: true, sensitivity: "base" }) : String(valB).localeCompare(String(valA), void 0, { numeric: true, sensitivity: "base" });
    });
  }, [filteredLots, sortColumn, sortOrder]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedAsesorFilter, sortColumn, sortOrder]);
  const paginatedLots = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedLots.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedLots, currentPage]);
  const totalPages = Math.ceil(sortedLots.length / ITEMS_PER_PAGE);
  const [chartFilter, setChartFilter] = useState("all");
  const getConsistentDate = (idStr) => {
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    const daysAgo = Math.abs(hash) % 180;
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - daysAgo);
    return d;
  };
  const salesStats = useMemo(() => {
    const totalLots = lots.length;
    const soldLots = lots.filter((l) => l.status === "vendido");
    const soldCount = soldLots.length;
    const soldAmount = soldLots.reduce((acc, l) => acc + (Number(l.price) || 0), 0);
    const soldArea = soldLots.reduce((acc, l) => acc + (Number(l.area) || 0), 0);
    const reservedLots = lots.filter((l) => l.status === "reservado");
    const reservedCount = reservedLots.length;
    const reservedAmount = reservedLots.reduce((acc, l) => acc + (Number(l.price) || 0), 0);
    const reservedArea = reservedLots.reduce((acc, l) => acc + (Number(l.area) || 0), 0);
    const availableLots = lots.filter((l) => l.status === "disponible");
    const availableCount = availableLots.length;
    const availableAmount = availableLots.reduce((acc, l) => acc + (Number(l.price) || 0), 0);
    const availableArea = availableLots.reduce((acc, l) => acc + (Number(l.area) || 0), 0);
    const totalRevenue = lots.reduce((acc, l) => acc + (Number(l.price) || 0), 0);
    const totalArea = lots.reduce((acc, l) => acc + (Number(l.area) || 0), 0);
    const conversionRate = totalLots > 0 ? (soldCount / totalLots * 100).toFixed(1) : "0";
    return {
      totalLots,
      soldCount,
      soldAmount,
      soldArea,
      reservedCount,
      reservedAmount,
      reservedArea,
      availableCount,
      availableAmount,
      availableArea,
      totalRevenue,
      totalArea,
      conversionRate
    };
  }, [lots]);
  const chartDataStatus = useMemo(() => {
    if (!lots || lots.length === 0) return [];
    const counts = {};
    Object.keys(activeStatuses).forEach((k) => {
      counts[k] = { id: k, name: activeStatuses[k].label, color: activeStatuses[k].color, count: 0, totalPrice: 0, totalArea: 0 };
    });
    lots.forEach((l) => {
      const st = l.status || "disponible";
      if (!counts[st]) {
        counts[st] = { id: st, name: activeStatuses[st]?.label || st, color: activeStatuses[st]?.color || "#9ca3af", count: 0, totalPrice: 0, totalArea: 0 };
      }
      counts[st].count++;
      counts[st].totalPrice += Number(l.price) || 0;
      counts[st].totalArea += Number(l.area) || 0;
    });
    return Object.values(counts);
  }, [lots, activeStatuses]);
  const filteredLotsForCharts = useMemo(() => {
    if (!lots || lots.length === 0) return [];
    const now = /* @__PURE__ */ new Date();
    const pastMonth = /* @__PURE__ */ new Date();
    pastMonth.setMonth(now.getMonth() - 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const past90Days = /* @__PURE__ */ new Date();
    past90Days.setDate(now.getDate() - 90);
    return lots.filter((lot) => {
      if (!activeStatuses[lot.status]) return false;
      if (lot.status === "disponible") return false;
      let date = lot.statusDate ? new Date(lot.statusDate) : getConsistentDate(lot.id);
      if (chartFilter === "month" && date < pastMonth) return false;
      if (chartFilter === "year" && date < startOfYear) return false;
      if (chartFilter === "thisMonth" && date < startOfMonth) return false;
      if (chartFilter === "today" && date < today) return false;
      if (chartFilter === "quarter" && date < past90Days) return false;
      return true;
    });
  }, [lots, chartFilter, activeStatuses]);
  const chartData = useMemo(() => {
    const grouped = {};
    filteredLotsForCharts.forEach((lot) => {
      let date = lot.statusDate ? new Date(lot.statusDate) : getConsistentDate(lot.id);
      const monthYear = date.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
      if (!grouped[monthYear]) {
        grouped[monthYear] = { name: monthYear, sortDate: new Date(date.getFullYear(), date.getMonth(), 1).getTime() };
        Object.keys(activeStatuses).forEach((k) => grouped[monthYear][k] = 0);
      }
      if (grouped[monthYear][lot.status] !== void 0) {
        grouped[monthYear][lot.status]++;
      }
    });
    return Object.values(grouped).sort((a, b) => a.sortDate - b.sortDate);
  }, [filteredLotsForCharts, activeStatuses]);
  const chartDataAsesores = useMemo(() => {
    if (!lots || lots.length === 0) return { data: [], totalLots: 0, max: 0, totalArea: 0 };
    const grouped = {};
    let totalProjectArea = 0;
    asesoresList.forEach((d) => {
      grouped[d] = {
        name: d,
        color: getAsesorColor(d),
        total: 0,
        totalArea: 0,
        totalPrice: 0,
        isRegistered: true
      };
      Object.keys(activeStatuses).forEach((k) => grouped[d][k] = 0);
    });
    lots.forEach((lot) => {
      const asesorName = (lot.asesor || "").trim();
      const key = asesorName || "Sin Asesor Asignado";
      const lotArea = Number(lot.area) || 0;
      const lotPrice = Number(lot.price) || 0;
      totalProjectArea += lotArea;
      if (!grouped[key]) {
        grouped[key] = {
          name: key,
          color: getAsesorColor(key),
          total: 0,
          totalArea: 0,
          totalPrice: 0,
          isRegistered: asesoresList.includes(key)
        };
        Object.keys(activeStatuses).forEach((k) => grouped[key][k] = 0);
      }
      grouped[key].total++;
      grouped[key].totalArea += lotArea;
      grouped[key].totalPrice += lotPrice;
      if (grouped[key][lot.status] !== void 0) {
        grouped[key][lot.status]++;
      }
    });
    const sorted = Object.values(grouped).sort((a, b) => b.total - a.total);
    const maxTotal = Math.max(...sorted.map((d) => d.total), 1);
    return {
      data: sorted,
      totalLots: lots.length,
      max: maxTotal,
      totalArea: totalProjectArea
    };
  }, [lots, asesoresList, activeStatuses, usersList]);
  const currentSelectedLot = useMemo(() => {
    if (!selectedLotId) return null;
    const fromDb = lots.find((l) => l.id === selectedLotId);
    if (fromDb) return fromDb;
    const fromCatalog = LotesIniciales.find((l) => l.id === selectedLotId);
    return fromCatalog || {
      id: selectedLotId,
      name: getAutoLotName(selectedLotId) || `Lote ${selectedLotId}`,
      price: 0,
      area: 0,
      status: "disponible",
      color: activeStatuses["disponible"]?.color || "#10b981"
    };
  }, [selectedLotId, lots, activeStatuses]);
  useEffect(() => {
    if (currentSelectedLot) setLastViewedLot(currentSelectedLot);
  }, [currentSelectedLot]);
  const selectedLot = currentSelectedLot || lastViewedLot;
  useEffect(() => {
    if (selectedLot) {
      setEditForm({ price: selectedLot.price, area: selectedLot.area, name: selectedLot.name || "" });
    }
  }, [selectedLotId, lots]);
  useEffect(() => {
    const handleBlur = () => {
      if (document.activeElement === iframeRef.current) {
        setSelectedLotId(null);
        window.focus();
      }
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);
  const exportCSV = () => {
    const headers = ["ID", "Lote/Mz", "Area (m2)", `Precio (${config?.currency ?? "$"})`, "Estado", "Asesor"];
    const exportData = sortLotsNaturally([...filteredLots]);
    const rows = exportData.map((l) => [
      `"${String(l.id || "").replace(/"/g, '""')}"`,
      `"${String(l.name || "").replace(/"/g, '""')}"`,
      Number(l.area) || 0,
      Number(l.price) || 0,
      `"${String(activeStatuses[l.status]?.label || l.status || "disponible").replace(/"/g, '""')}"`,
      `"${String(l.asesor || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    const d = /* @__PURE__ */ new Date();
    const dStr = d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
    const tStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).replace(":", "-").replace(" ", "");
    const dateStr = `${dStr}_${tStr}`;
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Inventario_Lotes_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleImportCSV = (event) => {
    if (!isAdmin) return;
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data;
          if (!data || data.length < 2) throw new Error("Archivo vac\xEDo o sin datos v\xE1lidos.");
          const firstRow = data[0].map((c) => String(c || "").toLowerCase().trim());
          let idIdx = 0;
          let nameIdx = 1;
          let areaIdx = 2;
          let priceIdx = 3;
          let statusIdx = 4;
          let asesorIdx = 5;
          const isHeader = firstRow.some((c) => c.includes("id") || c.includes("lote") || c.includes("area") || c.includes("precio") || c.includes("estado") || c.includes("asesor") || c.includes("vendedor"));
          const startIndex = isHeader ? 1 : 0;
          if (isHeader) {
            firstRow.forEach((col, idx) => {
              if (col === "id" || col.startsWith("id_") || col.startsWith("id ")) idIdx = idx;
              else if (col.includes("lote") || col.includes("mz") || col.includes("nombre") || col.includes("name")) nameIdx = idx;
              else if (col.includes("area") || col.includes("\xE1rea") || col.includes("m2")) areaIdx = idx;
              else if (col.includes("precio") || col.includes("price") || col.includes("monto") || col.includes("$") || col.includes("s/")) priceIdx = idx;
              else if (col.includes("estado") || col.includes("status")) statusIdx = idx;
              else if (col.includes("asesor") || col.includes("vendedor")) asesorIdx = idx;
            });
          }
          const batch = writeBatch(db);
          let count = 0;
          let skipped = 0;
          for (let i = startIndex; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length < 1 || !row[idIdx]) continue;
            const rawId = String(row[idIdx]).trim();
            if (!rawId) continue;
            const canonicalId = getCanonicalLotId(rawId);
            if (!isKnownLotId(canonicalId)) {
              skipped++;
              continue;
            }
            const importedName = nameIdx !== -1 && row[nameIdx] !== void 0 && row[nameIdx] !== null ? String(row[nameIdx]).trim() : "";
            const name = importedName !== "" ? importedName : getAutoLotName(canonicalId);
            const areaRaw = areaIdx !== -1 && row[areaIdx] ? String(row[areaIdx]).replace(/[^0-9.-]+/g, "") : "0";
            const priceRaw = priceIdx !== -1 && row[priceIdx] ? String(row[priceIdx]).replace(/[^0-9.-]+/g, "") : "0";
            const area = Number(areaRaw) || 0;
            const price = Number(priceRaw) || 0;
            let statusRaw = statusIdx !== -1 && row[statusIdx] ? String(row[statusIdx]).toLowerCase().trim() : "disponible";
            let matchedStatusId = "disponible";
            Object.values(activeStatuses).forEach((st) => {
              if (st.id.toLowerCase() === statusRaw || st.label.toLowerCase() === statusRaw) {
                matchedStatusId = st.id;
              }
            });
            const lotRef = getLotDoc(canonicalId);
            const color = activeStatuses[matchedStatusId]?.color || "#10b981";
            const updateData = {
              id: canonicalId,
              name,
              area,
              price,
              status: matchedStatusId,
              color
            };
            if (matchedStatusId === "disponible") {
              updateData.asesor = "";
              updateData.asesorUid = null;
            } else if (asesorIdx !== -1 && row.length > asesorIdx && row[asesorIdx] !== void 0 && row[asesorIdx] !== null) {
              const asesorVal = String(row[asesorIdx]).trim();
              const match = asesorVal ? usersList.find((u) => (u.name || "").trim().toLowerCase() === asesorVal.toLowerCase()) : null;
              updateData.asesor = asesorVal;
              updateData.asesorUid = match ? match.id : null;
            }
            batch.set(lotRef, updateData, { merge: true });
            count++;
          }
          if (count > 0) {
            await batch.commit();
            setToastMessage({ type: "success", text: `\xA1Importaci\xF3n exitosa! Se actualizaron ${count} lotes correctamente.${skipped > 0 ? ` Se omitieron ${skipped} filas con un ID de lote desconocido.` : ""}` });
          } else {
            setToastMessage({ type: "error", text: "No se encontr\xF3 ning\xFAn ID v\xE1lido en el archivo para actualizar." });
          }
        } catch (err) {
          console.error("Error importando CSV:", err);
          setToastMessage({ type: "error", text: "Archivo CSV importado mal configurado o error en archivo, revise nuevamente el archivo CSV antes de importar." });
        }
        event.target.value = null;
      },
      error: (err) => {
        setToastMessage({ type: "error", text: "Archivo CSV importado mal configurado o error en archivo." });
      }
    });
  };
  const exportPDF = () => {
    const docPdf = new jspdf.jsPDF();
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const fullDate = `${dateStr} ${timeStr}`;
    docPdf.setFontSize(9);
    docPdf.setTextColor(150);
    docPdf.setFont(void 0, "normal");
    docPdf.text(`Exportado el: ${fullDate}`, 196, 12, null, null, "right");
    docPdf.setFontSize(22);
    docPdf.setTextColor(107, 33, 168);
    docPdf.setFont(void 0, "bold");
    docPdf.text("REPORTE DE INVENTARIO - LOMAS DE YANAMAYO I", 105, 25, null, null, "center");
    const didDrawFooter = (data) => {
      docPdf.setFontSize(8);
      docPdf.setTextColor(120);
      docPdf.setFont(void 0, "normal");
      const pageWidth = docPdf.internal.pageSize.width;
      const pageHeight = docPdf.internal.pageSize.height;
      docPdf.text(GLOBAL_COPYRIGHT_TEXT, pageWidth / 2, pageHeight - 10, null, null, "center");
    };
    docPdf.autoTable({
      startY: 35,
      head: [["Estado", "Cantidad"]],
      body: Object.values(activeStatuses).map((st) => [st.label, lots.filter((l) => l.status === st.id).length]),
      theme: "grid",
      headStyles: { fillColor: [107, 33, 168], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      didDrawPage: didDrawFooter
    });
    const exportData = sortLotsNaturally([...filteredLots]);
    const tableData = exportData.map((l) => [l.name, l.area, (l.price || 0).toLocaleString(), l.status, l.asesor || "-"]);
    docPdf.autoTable({
      startY: docPdf.lastAutoTable.finalY + 12,
      head: [["Lote", "\xC1rea", "Precio", "Estado", "Asesor"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [107, 33, 168], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      didDrawPage: didDrawFooter,
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });
    const fileDate = now.toISOString().split("T")[0];
    const fileTime = now.getHours().toString().padStart(2, "0") + "-" + now.getMinutes().toString().padStart(2, "0");
    docPdf.save(`Inventario_${fileDate}_${fileTime}.pdf`);
  };
  const exportChartsPDF = () => {
    const docPdf = new jspdf.jsPDF();
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const fullDate = `${dateStr} ${timeStr}`;
    docPdf.setFontSize(9);
    docPdf.setTextColor(150);
    docPdf.text(`Exportado el: ${fullDate}`, 196, 12, null, null, "right");
    docPdf.setFontSize(18);
    docPdf.setTextColor(107, 33, 168);
    docPdf.setFont(void 0, "bold");
    docPdf.text("REPORTE EJECUTIVO DE VENTAS Y ASESORES", 105, 22, null, null, "center");
    const pdfSummaryBody = [
      ["Total Lotes del Proyecto", String(salesStats.totalLots)],
      ["Lotes Vendidos", `${salesStats.soldCount} (${salesStats.conversionRate}%)`],
      ["Lotes Reservados", String(salesStats.reservedCount)],
      ["Lotes Disponibles", String(salesStats.availableCount)],
      ["Total Valorizado Vendido", `S/ ${salesStats.soldAmount.toLocaleString()}`],
      ["Total Asesores Registrados", String(asesoresList.length)]
    ];
    const didDrawFooter = (data) => {
      docPdf.setFontSize(8);
      docPdf.setTextColor(120);
      docPdf.setFont(void 0, "normal");
      const pageWidth = docPdf.internal.pageSize.width;
      const pageHeight = docPdf.internal.pageSize.height;
      docPdf.text(GLOBAL_COPYRIGHT_TEXT, pageWidth / 2, pageHeight - 10, null, null, "center");
    };
    docPdf.autoTable({
      startY: 30,
      head: [["Indicador de Ventas e Inventario", "Valor"]],
      body: pdfSummaryBody,
      theme: "grid",
      headStyles: { fillColor: [107, 33, 168], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      didDrawPage: didDrawFooter
    });
    docPdf.setFontSize(13);
    docPdf.setTextColor(107, 33, 168);
    docPdf.setFont(void 0, "bold");
    docPdf.text("Distribuci\xF3n de Lotes por Asesor", 14, docPdf.lastAutoTable.finalY + 12);
    const statusHeaders = Object.values(activeStatuses).map((st) => st.label);
    const asesoresTableData = chartDataAsesores.data.map((d) => {
      const row = [d.name, d.total, `${d.totalArea.toLocaleString()} m\xB2`];
      Object.values(activeStatuses).forEach((st) => {
        row.push(d[st.id] || 0);
      });
      const pct = chartDataAsesores.totalLots > 0 ? (d.total / chartDataAsesores.totalLots * 100).toFixed(1) + "%" : "0%";
      row.push(pct);
      return row;
    });
    docPdf.autoTable({
      startY: docPdf.lastAutoTable.finalY + 16,
      head: [["Asesor", "Total Lotes", "\xC1rea Total", ...statusHeaders, "% Proyecto"]],
      body: asesoresTableData.length > 0 ? asesoresTableData : [["Sin datos", 0, "0 m\xB2", ...statusHeaders.map(() => 0), "0%"]],
      theme: "striped",
      headStyles: { fillColor: [107, 33, 168], textColor: [255, 255, 255], halign: "center", fontStyle: "bold" },
      bodyStyles: { halign: "center" },
      didDrawPage: didDrawFooter
    });
    const fileDate = now.toISOString().split("T")[0];
    const fileTime = now.getHours().toString().padStart(2, "0") + "-" + now.getMinutes().toString().padStart(2, "0");
    docPdf.save(`Reporte_Ventas_Y_Asesores_${fileDate}_${fileTime}.pdf`);
  };
  const exportChartsExcel = () => {
    const statusHeaders = Object.values(activeStatuses).map((st) => st.label);
    const rows = [
      ["REPORTE EJECUTIVO DE VENTAS Y ASESORES"],
      ["Fecha de generaci\xF3n:", (/* @__PURE__ */ new Date()).toLocaleString()],
      [""],
      ["RESUMEN GENERAL DE VENTAS"],
      ["Indicador", "Valor"],
      ["Total Lotes del Proyecto", salesStats.totalLots],
      ["Lotes Vendidos", salesStats.soldCount],
      ["Tasa de Conversi\xF3n (% Vendido)", `${salesStats.conversionRate}%`],
      ["Lotes Reservados", salesStats.reservedCount],
      ["Lotes Disponibles", salesStats.availableCount],
      ["Monto Total Vendido", salesStats.soldAmount],
      ["Total Asesores Registrados", asesoresList.length],
      [""],
      ["DISTRIBUCI\xD3N POR ASESOR"],
      ["Asesor", "Total Lotes", "\xC1rea Total (m2)", ...statusHeaders, "% del Proyecto"]
    ];
    chartDataAsesores.data.forEach((d2) => {
      const pct = chartDataAsesores.totalLots > 0 ? (d2.total / chartDataAsesores.totalLots * 100).toFixed(1) + "%" : "0%";
      const row = [d2.name, d2.total, d2.totalArea];
      Object.values(activeStatuses).forEach((st) => {
        row.push(d2[st.id] || 0);
      });
      row.push(pct);
      rows.push(row);
    });
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const d = /* @__PURE__ */ new Date();
    const dStr = d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Ventas_Y_Asesores_${dStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if (firebaseError) {
    return /* @__PURE__ */ React.createElement("div", { className: "flex h-[100dvh] items-center justify-center bg-gray-50 p-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100 text-center" }, /* @__PURE__ */ React.createElement(AlertTriangle, { size: 48, className: "text-red-500 mx-auto mb-4" }), /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold text-gray-800 mb-2" }, "No se pudo conectar"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600 mb-6" }, firebaseError), /* @__PURE__ */ React.createElement("div", { className: "text-left bg-gray-50 p-4 rounded-lg text-[11px] text-gray-700 leading-relaxed space-y-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "1."), " Revisa tu conexi\xF3n a internet y recarga la p\xE1gina."), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "2."), " Si eres el administrador: confirma que las reglas de Firestore (", /* @__PURE__ */ React.createElement("code", { className: "bg-gray-200 px-1 font-mono" }, "firestore.rules"), ') est\xE9n publicadas y que Authentication tenga activado "Correo electr\xF3nico y contrase\xF1a".'), /* @__PURE__ */ React.createElement("div", { className: "text-red-600 italic" }, "* Una vez corregido, recarga la p\xE1gina con Shift + F5."))));
  }
  const isSidebarFixed = view !== "map";
  return /* @__PURE__ */ React.createElement("div", { className: "flex fixed inset-0 w-full bg-gray-50 text-gray-900 font-sans overflow-hidden" }, showLogin && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black/20 dark:bg-black/40 z-[170] flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] w-full max-w-sm relative border border-gray-100 dark:border-gray-800 animate-[scale-up_0.2s_ease-out]" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setShowLogin(false), className: "absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" }, /* @__PURE__ */ React.createElement(X, { size: 20 })), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mb-5" }, /* @__PURE__ */ React.createElement("div", { className: "w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner" }, /* @__PURE__ */ React.createElement(Lock, { size: 30 }))), /* @__PURE__ */ React.createElement("h2", { className: "text-xl sm:text-2xl font-bold text-center mb-1 text-gray-800 dark:text-white" }, "Acceso al CRM"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-500 dark:text-gray-400 text-center text-xs mb-6" }, "Ingresa con el correo y la contrase\xF1a que te dio el administrador."), /* @__PURE__ */ React.createElement("form", { onSubmit: handleLoginSubmit, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase" }, "Correo electr\xF3nico"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: userInput,
      onChange: (e) => setUserInput(e.target.value),
      placeholder: "correo@ejemplo.com",
      autoComplete: "username",
      inputMode: "email",
      className: "w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium",
      autoFocus: true
    }
  ), /* @__PURE__ */ React.createElement(User, { size: 18, className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase" }, "Contrase\xF1a"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: showLoginPassword ? "text" : "password",
      value: passwordInput,
      onChange: (e) => setPasswordInput(e.target.value),
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      autoComplete: "current-password",
      className: "w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
    }
  ), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setShowLoginPassword(!showLoginPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors", tabIndex: "-1" }, showLoginPassword ? /* @__PURE__ */ React.createElement(EyeOff, { size: 18 }) : /* @__PURE__ */ React.createElement(Eye, { size: 18 })))), loginError && /* @__PURE__ */ React.createElement("p", { className: "text-red-500 text-xs font-semibold text-center bg-red-50 dark:bg-red-900/20 p-2.5 rounded-xl border border-red-100 dark:border-red-900/40" }, loginError), /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: loginBusy, className: "w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all active:scale-95" }, loginBusy ? "Ingresando..." : "Ingresar al Sistema"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: handleForgotPassword, className: "w-full text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" }, "\xBFOlvidaste tu contrase\xF1a?")))), toastMessage && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black/20 dark:bg-black/40 z-[200] flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 sm:p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] w-full max-w-sm text-center transform transition-all animate-[scale-up_0.2s_ease-out]" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setToastMessage(null), className: "absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" }, /* @__PURE__ */ React.createElement(X, { size: 20 })), toastMessage.type === "success" ? /* @__PURE__ */ React.createElement("div", { className: "w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4" }, /* @__PURE__ */ React.createElement(CheckCircle, { size: 40, className: "text-green-500 dark:text-green-400" })) : /* @__PURE__ */ React.createElement("div", { className: "w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4" }, /* @__PURE__ */ React.createElement(AlertTriangle, { size: 40, className: "text-red-500 dark:text-red-400" })), /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold text-gray-800 dark:text-white mb-2 " }, toastMessage.type === "success" ? "\xA1\xC9xito!" : "Operaci\xF3n Denegada"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed max-w-[250px] mx-auto" }, toastMessage.text), /* @__PURE__ */ React.createElement("button", { onClick: () => setToastMessage(null), className: `w-full font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 ${toastMessage.type === "success" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}` }, "Entendido"))), /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 pointer-events-none z-[120]" }, /* @__PURE__ */ React.createElement("header", { className: "absolute top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6 flex justify-between items-start pointer-events-none" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setIsMenuOpen(!isMenuOpen), className: `p-3 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-gray-800 pointer-events-auto active:scale-95 ${isSidebarFixed ? "lg:hidden" : ""}` }, isMenuOpen ? /* @__PURE__ */ React.createElement(X, { size: 24, className: "text-gray-600 dark:text-gray-200" }) : /* @__PURE__ */ React.createElement(Menu, { size: 24, className: "text-gray-600 dark:text-gray-200" }))), isAgent && /* @__PURE__ */ React.createElement("div", { className: "absolute top-4 right-4 sm:top-6 sm:right-6 pointer-events-auto flex items-center gap-2" }, currentUser ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg border border-purple-200 dark:border-purple-800/60" }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full animate-pulse", style: { backgroundColor: currentUser.role === "admin" ? "#a855f7" : getAsesorColor(currentUser.name) } }), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] sm:text-xs font-bold text-gray-800 dark:text-gray-100 uppercase flex items-center gap-1.5" }, currentUser.role === "admin" && /* @__PURE__ */ React.createElement(Shield, { size: 13, className: "text-purple-500" }), currentUser.role === "asesor" && /* @__PURE__ */ React.createElement(Briefcase, { size: 13, className: "text-blue-500" }), /* @__PURE__ */ React.createElement("span", null, currentUser.name), /* @__PURE__ */ React.createElement("span", { className: "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase", style: {
    backgroundColor: currentUser.role === "admin" ? "rgba(168,85,247,0.15)" : "rgba(59,130,246,0.15)",
    color: currentUser.role === "admin" ? "#9333ea" : "#2563eb"
  } }, currentUser.role === "admin" ? "Admin" : "Asesor"))) : /* @__PURE__ */ React.createElement("span", { className: "text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-lg bg-purple-600 dark:bg-purple-900/80 text-white border border-purple-400 dark:border-purple-600" }, "SESI\xD3N ACTIVA")), !isAgent && view === "map" && /* @__PURE__ */ React.createElement("div", { className: "absolute top-4 right-4 sm:top-5 sm:right-5 flex flex-col items-end" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowClientMenu(true),
      className: `absolute top-0 right-0 p-3 bg-white dark:bg-gray-900 rounded-[50%] shadow-lg border border-gray-100 dark:border-gray-800 flex items-center justify-center transition-all duration-300 pointer-events-auto ${showClientMenu ? "scale-0 opacity-0 invisible" : "scale-100 opacity-100 visible cursor-pointer hover:bg-white dark:hover:bg-gray-800"}`
    },
    /* @__PURE__ */ React.createElement(Eye, { size: 20, className: "text-purple-600 dark:text-gray-200" })
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-[200px] sm:w-64 origin-top-right transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${showClientMenu ? "scale-100 opacity-100 pointer-events-auto visible" : "scale-50 opacity-0 pointer-events-none invisible hidden"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: "p-3 sm:p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-3 sm:mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5 whitespace-nowrap overflow-hidden" }, /* @__PURE__ */ React.createElement(Eye, { size: 14, className: "text-purple-500 shrink-0" }), " Visibilidad de Capas"), /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
      e.stopPropagation();
      setShowClientMenu(false);
    }, className: "text-purple-600 hover:text-purple-800 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60 p-1.5 rounded-full transition-all active:scale-95 flex items-center justify-center relative z-[60]" }, /* @__PURE__ */ React.createElement(X, { size: 14, strokeWidth: 3 }))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar" }, extraLayers.length > 0 ? extraLayers.map((layerId) => {
      const defaultFormattedName = layerId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      const formattedName = config?.layerNames?.[layerId] && config.layerNames[layerId].trim() !== "" ? config.layerNames[layerId] : defaultFormattedName;
      const isChecked = layerVisibility[layerId] !== false;
      return /* @__PURE__ */ React.createElement("label", { key: layerId, className: "flex items-center justify-between py-2 sm:py-2.5 px-2.5 sm:px-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 rounded-xl cursor-pointer transition-colors active:scale-[0.98] select-none" }, /* @__PURE__ */ React.createElement("span", { className: "text-[12px] sm:text-[13px] font-bold text-gray-700 dark:text-gray-200 truncate max-w-[130px]" }, formattedName), /* @__PURE__ */ React.createElement("div", { className: "relative inline-flex items-center cursor-pointer shrink-0" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", className: "sr-only peer", checked: isChecked, onChange: (e) => toggleLayer(layerId, e.target.checked) }), /* @__PURE__ */ React.createElement("div", { className: "w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-purple-500 shadow-sm" })));
    }) : /* @__PURE__ */ React.createElement("div", { className: "text-xs text-gray-400 p-2 text-center" }, "No hay otras capas")), /* @__PURE__ */ React.createElement("div", { className: "mt-2 pt-3 border-t border-gray-200 dark:border-gray-700" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-500 dark:text-gray-400 text-center font-medium" }, "Los cambios se restablecen al recargar la p\xE1gina")))
  ))), /* @__PURE__ */ React.createElement("div", { className: `fixed inset-0 bg-gray-900/40 z-[45] cursor-pointer transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} ${isSidebarFixed ? "lg:hidden" : ""}`, onClick: () => setIsMenuOpen(false) }), /* @__PURE__ */ React.createElement("div", { className: `fixed top-0 left-0 h-[100dvh] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col pt-20 sm:pt-24 pb-6 px-4 z-[100] transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none cursor-default overflow-y-auto will-change-transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} ${isSidebarFixed ? "lg:translate-x-0" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-center pb-6 mb-6 border-b border-gray-100 dark:border-gray-800 shrink-0 w-full px-2" }, /* @__PURE__ */ React.createElement("img", { src: config?.appIcon || "img/icon-512.png", alt: "Logo Lomas de Yanamayo I", className: "w-auto h-auto max-w-[95%] max-h-28 sm:max-h-32 object-contain transition-all duration-300" })), /* @__PURE__ */ React.createElement("nav", { className: "flex flex-col gap-2 shrink-0" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setView("map");
        setIsMenuOpen(false);
      },
      className: `p-3 rounded-xl flex items-center gap-3 transition-colors duration-150 font-semibold active:scale-[0.98] ${view === "map" ? "bg-purple-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`
    },
    /* @__PURE__ */ React.createElement(Map, { size: 20, className: view === "map" ? "text-white" : "" }),
    " Plano 360\xB0"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setView("list");
        setIsMenuOpen(false);
      },
      className: `p-3 rounded-xl flex items-center gap-3 transition-colors duration-150 font-semibold active:scale-[0.98] ${view === "list" ? "bg-purple-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`
    },
    /* @__PURE__ */ React.createElement(Users, { size: 20, className: view === "list" ? "text-white" : "" }),
    " ",
    isAgent ? "Gesti\xF3n CRM" : "Lista de Lotes"
  ), isAgent && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setView("charts");
        setIsMenuOpen(false);
      },
      className: `p-3 rounded-xl flex items-center gap-3 transition-colors duration-150 font-semibold active:scale-[0.98] ${view === "charts" ? "bg-purple-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`
    },
    /* @__PURE__ */ React.createElement(BarChart3, { size: 20, className: view === "charts" ? "text-white" : "" }),
    " Gr\xE1ficos"
  ), isAdmin && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setView("config");
        setIsMenuOpen(false);
      },
      className: `p-3 rounded-xl flex items-center gap-3 transition-colors duration-150 font-semibold active:scale-[0.98] ${view === "config" ? "bg-purple-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`
    },
    /* @__PURE__ */ React.createElement(Settings, { size: 20, className: view === "config" ? "text-white" : "" }),
    " Configuraci\xF3n"
  )), /* @__PURE__ */ React.createElement("div", { className: "mt-auto pt-8 shrink-0 w-full" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setIsDarkMode(!isDarkMode), className: "p-3 w-full rounded-xl flex items-center justify-between transition-all font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, isDarkMode ? /* @__PURE__ */ React.createElement(Sun, { size: 20, className: "text-amber-500" }) : /* @__PURE__ */ React.createElement(Moon, { size: 20 }), /* @__PURE__ */ React.createElement("span", null, isDarkMode ? "Modo Claro" : "Modo Oscuro")), /* @__PURE__ */ React.createElement("div", { className: `relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${isDarkMode ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-700"}` }, /* @__PURE__ */ React.createElement("div", { className: `absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${isDarkMode ? "translate-x-5" : "translate-x-0"}` }))), /* @__PURE__ */ React.createElement("div", { className: "my-4 border-t border-gray-100 dark:border-gray-800" }), /* @__PURE__ */ React.createElement("div", { className: "pb-4" }, !isAgent ? /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setShowLogin(true);
    setIsMenuOpen(false);
  }, className: "w-full p-3 rounded-xl flex justify-center items-center gap-3 transition-all font-bold text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-100 dark:border-purple-900/50 shadow-sm active:scale-95" }, /* @__PURE__ */ React.createElement(Lock, { size: 18 }), " Iniciar Sesi\xF3n CRM") : /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm", style: { backgroundColor: currentUser?.role === "admin" ? "#a855f7" : getAsesorColor(currentUser?.name) } }, (currentUser?.name || "A").substring(0, 2).toUpperCase()), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs font-bold text-gray-800 dark:text-gray-100 truncate" }, currentUser?.name || "Administrador"), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-gray-400 capitalize flex items-center gap-1" }, currentUser?.role === "admin" ? "Administrador" : "Asesor de Ventas"))), /* @__PURE__ */ React.createElement("button", { onClick: handleLogout, className: "w-full py-2 px-3 rounded-xl flex justify-center items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-100 dark:border-red-900/40 transition-colors" }, /* @__PURE__ */ React.createElement(Power, { size: 14 }), " Cerrar Sesi\xF3n"))), /* @__PURE__ */ React.createElement("div", { className: "text-center pb-6" }, /* @__PURE__ */ React.createElement("a", { href: "https://cautivamarketing.com", target: "_blank", rel: "noreferrer", className: "text-[10px] font-bold text-gray-500 dark:text-gray-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors inline-block" }, GLOBAL_COPYRIGHT_TEXT)))), selectedLotId && /* @__PURE__ */ React.createElement("div", { className: "sm:hidden absolute inset-0 bg-gray-900/70 z-[125] transition-opacity", onClick: () => setSelectedLotId(null) }), /* @__PURE__ */ React.createElement("div", { ref: bottomSheetRef, className: `fixed sm:absolute bottom-0 sm:top-0 left-0 sm:left-auto sm:right-0 sm:h-[100dvh] w-full sm:w-[400px] bg-white dark:bg-gray-900 sm:border-l sm:border-r-0 border-t sm:border-t-0 border-gray-200 dark:border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] sm:shadow-2xl dark:shadow-none flex flex-col z-[130] transition-transform duration-300 ease-in-out ${selectedLotId ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"} max-h-[75vh] sm:max-h-full rounded-t-3xl sm:rounded-none` }, selectedLot && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "pt-5 sm:pt-14 pb-3 sm:pb-4 px-5 sm:px-6 border-b border-gray-200 dark:border-gray-800 flex flex-col justify-center bg-white dark:bg-gray-900 shrink-0 sm:rounded-none rounded-t-3xl cursor-grab active:cursor-grabbing",
      onTouchStart: (e) => {
        window.__dragStartY = e.touches[0].clientY;
        if (bottomSheetRef.current) bottomSheetRef.current.style.transition = "none";
      },
      onTouchMove: (e) => {
        if (!window.__dragStartY) return;
        const diff = e.touches[0].clientY - window.__dragStartY;
        if (diff > 0 && bottomSheetRef.current) {
          bottomSheetRef.current.style.transform = `translateY(${diff}px)`;
        }
      },
      onTouchEnd: (e) => {
        if (!window.__dragStartY) return;
        const diff = e.changedTouches[0].clientY - window.__dragStartY;
        if (bottomSheetRef.current) {
          bottomSheetRef.current.style.transition = "transform 300ms ease-in-out";
          bottomSheetRef.current.style.transform = "";
        }
        if (diff > 60) setSelectedLotId(null);
        window.__dragStartY = null;
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "sm:hidden w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full absolute top-2 left-1/2 -translate-x-1/2" }),
    /* @__PURE__ */ React.createElement("div", { className: "text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-1 sm:mb-1.5 mt-2 sm:mt-0" }, "Detalles del Lote"),
    /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start w-full" }, /* @__PURE__ */ React.createElement("h2", { className: "text-lg sm:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 sm:gap-3 w-full overflow-hidden pointer-events-none" }, /* @__PURE__ */ React.createElement("div", { className: "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shadow-sm shrink-0", style: { backgroundColor: selectedLot.color } }), isAdmin ? /* @__PURE__ */ React.createElement("input", { type: "text", value: editForm.name ?? "", onChange: (e) => setEditForm({ ...editForm, name: e.target.value }), onBlur: (e) => handleUpdateLot(selectedLot.id, "name", e.target.value), className: "bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none w-full text-lg sm:text-xl font-bold focus:border-purple-400 dark:focus:border-purple-500 dark:text-white pointer-events-auto" }) : /* @__PURE__ */ React.createElement("span", { className: "truncate pointer-events-auto" }, selectedLot.name)), /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
      e.stopPropagation();
      setSelectedLotId(null);
    }, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 sm:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shrink-0 ml-2 -mt-2 relative z-[100] pointer-events-auto flex items-center justify-center" }, /* @__PURE__ */ React.createElement(X, { size: 20, className: "sm:w-6 sm:h-6", strokeWidth: 3 })))
  ), /* @__PURE__ */ React.createElement("div", { onClick: (e) => {
    if (e.target === e.currentTarget) setSelectedLotId(null);
  }, className: "p-4 sm:p-6 flex-1 overflow-y-auto space-y-3 sm:space-y-5 bg-white dark:bg-gray-900 cursor-default" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 dark:bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-sm" }, (!config?.hidePrice || isAgent) && /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-3 sm:mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs font-semibold uppercase" }, "Precio Actual"), /* @__PURE__ */ React.createElement("span", { className: "text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 " }, config?.currency ?? "$", " ", (selectedLot.price || 0).toLocaleString())), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2 sm:gap-3 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-800 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700" }, /* @__PURE__ */ React.createElement("div", { className: "text-gray-400 dark:text-gray-500 text-[10px] sm:text-[11px] font-bold uppercase mb-1 flex items-center justify-center gap-1" }, /* @__PURE__ */ React.createElement(Maximize, { size: 11, className: "sm:w-3 sm:h-3" }), " \xC1rea"), /* @__PURE__ */ React.createElement("div", { className: "text-gray-800 dark:text-gray-200 font-bold text-sm sm:text-base" }, selectedLot.area, " m\xB2")), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-800 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700" }, /* @__PURE__ */ React.createElement("div", { className: "text-gray-400 dark:text-gray-500 text-[10px] sm:text-[11px] font-bold uppercase mb-1 flex items-center justify-center gap-1" }, /* @__PURE__ */ React.createElement(CheckCircle, { size: 11, className: "sm:w-3 sm:h-3" }), " Estado"), /* @__PURE__ */ React.createElement("div", { className: "font-bold uppercase shadow-xs px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] mx-auto max-w-fit border", style: { backgroundColor: `${activeStatuses[selectedLot.status]?.color || "#a8a29e"}22`, color: activeStatuses[selectedLot.status]?.color || "#a8a29e", borderColor: `${activeStatuses[selectedLot.status]?.color || "#a8a29e"}40` } }, activeStatuses[selectedLot.status]?.label || selectedLot.status))), isAgent && selectedLot.asesor && /* @__PURE__ */ React.createElement("div", { className: "mt-3 pt-3 border-t border-gray-200/70 dark:border-gray-700/50 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-gray-400 uppercase" }, "Asesor:"), /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border", style: {
    backgroundColor: `${getAsesorColor(selectedLot.asesor)}18`,
    color: getAsesorColor(selectedLot.asesor),
    borderColor: `${getAsesorColor(selectedLot.asesor)}40`
  } }, /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full", style: { backgroundColor: getAsesorColor(selectedLot.asesor) } }), /* @__PURE__ */ React.createElement("span", null, selectedLot.asesor)))), selectedLot.status === "disponible" ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-row gap-2 sm:gap-3" }, /* @__PURE__ */ React.createElement("a", { href: `https://wa.me/${config?.whatsapp ? String(config.whatsapp).replace(/[^0-9]/g, "") : "1234567890"}?text=Hola, estoy interesado en el ${selectedLot.name}`, target: "_blank", rel: "noreferrer", className: "flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex justify-center items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold shadow-md active:scale-95 transition-transform text-center" }, /* @__PURE__ */ React.createElement(MessageCircle, { size: 16, className: "sm:w-5 sm:h-5 mr-0 sm:-ml-1" }), " Consultar"), /* @__PURE__ */ React.createElement("a", { href: `tel:${config?.phone ? String(config.phone).replace(/[^0-9+]/g, "") : "+1234567890"}`, className: "flex-1 bg-[#007AFF] hover:bg-[#005bb5] text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex justify-center items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold shadow-md active:scale-95 transition-transform text-center" }, /* @__PURE__ */ React.createElement(Phone, { size: 16, className: "sm:w-5 sm:h-5 mr-0 sm:-ml-1" }), " Llamar")) : /* @__PURE__ */ React.createElement("div", { className: "border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center bg-gray-50/50 dark:bg-gray-800/20", style: { color: activeStatuses[selectedLot.status]?.color || "#a8a29e", borderColor: `${activeStatuses[selectedLot.status]?.color || "#a8a29e"}50` } }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-sm" }, "Este lote ya no est\xE1 disponible.")), isAgent && /* @__PURE__ */ React.createElement("div", { className: "space-y-3 sm:space-y-4 bg-white dark:bg-gray-800/80 p-4 sm:p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm relative overflow-visible" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-2xl" }), /* @__PURE__ */ React.createElement("h3", { className: "text-[10px] sm:text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase mb-2.5 sm:mb-3" }, "Modificar informaci\xF3n"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1" }, "Estado del Lote"), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setIsStatusSelectorOpen(!isStatusSelectorOpen),
      disabled: !canEditLot(selectedLot),
      className: "w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-xl p-3 text-sm flex items-center justify-between outline-none transition-all hover:bg-white dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm", style: { backgroundColor: activeStatuses[selectedLot.status]?.color || "#a8a29e" } }), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-gray-800 dark:text-gray-100" }, activeStatuses[selectedLot.status]?.label || selectedLot.status)),
    /* @__PURE__ */ React.createElement(ArrowUpDown, { size: 14, className: `text-gray-400 transition-transform duration-300 ${isStatusSelectorOpen ? "rotate-180" : ""}` })
  ), isStatusSelectorOpen && canEditLot(selectedLot) && /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50/50 dark:bg-gray-950/30 rounded-2xl p-1.5 border-2 border-purple-100/30 dark:border-purple-900/20 grid grid-cols-1 gap-1 animate-expand" }, Object.values(activeStatuses).map((st) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: st.id,
      type: "button",
      onClick: () => {
        handleUpdateLot(selectedLot.id, "status", st.id);
        setIsStatusSelectorOpen(false);
      },
      className: `w-full flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm transition-all group ${selectedLot.status === st.id ? "bg-white dark:bg-gray-800 shadow-sm ring-1 ring-purple-100/50 dark:ring-purple-900/40" : "hover:bg-white dark:hover:bg-gray-800"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-3.5 h-3.5 rounded-full shadow-md border-2 border-white dark:border-gray-800 transition-transform group-hover:scale-110 shrink-0", style: { backgroundColor: st.color } }), /* @__PURE__ */ React.createElement("span", { className: `font-bold ${selectedLot.status === st.id ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"}` }, st.label)),
    selectedLot.status === st.id && /* @__PURE__ */ React.createElement("div", { className: "w-5 h-5 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg animate-[scaleIn_0.2s_ease-out]" }, /* @__PURE__ */ React.createElement(CheckCircle, { size: 10, strokeWidth: 3 }))
  ))))), isAdmin ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2.5 sm:gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1" }, "Precio (", config?.currency ?? "$", ")"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("input", { type: "number", value: editForm.price ?? "", onChange: (e) => setEditForm({ ...editForm, price: e.target.value }), onBlur: (e) => handleUpdateLot(selectedLot.id, "price", Number(e.target.value)), className: "w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm dark:text-white outline-none focus:ring-1 focus:ring-purple-500 font-medium" }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1" }, "\xC1rea (m\xB2)"), /* @__PURE__ */ React.createElement("input", { type: "number", value: editForm.area ?? "", onChange: (e) => setEditForm({ ...editForm, area: e.target.value }), onBlur: (e) => handleUpdateLot(selectedLot.id, "area", Number(e.target.value)), className: "w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm dark:text-white outline-none focus:ring-1 focus:ring-purple-500 font-medium" }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "Asesor responsable"), selectedLot.asesor && /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1 text-[10px] font-bold", style: { color: getAsesorColor(selectedLot.asesor) } }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 rounded-full", style: { backgroundColor: getAsesorColor(selectedLot.asesor) } }), "Color asignado")), /* @__PURE__ */ React.createElement("select", { value: selectedLot.asesorUid || "", disabled: selectedLot.status === "disponible", onChange: (e) => handleAssignAsesor(selectedLot.id, e.target.value), className: "w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm dark:text-white outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer font-medium disabled:opacity-60 disabled:cursor-not-allowed" }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Sin asesor asignado"), usersList.filter((u) => u.active !== false).map((u) => /* @__PURE__ */ React.createElement("option", { key: u.id, value: u.id }, u.name, u.role === "admin" ? " (Admin)" : "")), selectedLot.asesorUid && !usersList.some((u) => u.id === selectedLot.asesorUid && u.active !== false) && /* @__PURE__ */ React.createElement("option", { value: selectedLot.asesorUid }, selectedLot.asesor || "Usuario", " (inactivo)")), selectedLot.status === "disponible" && /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-[10px] text-gray-400 italic" }, "El asesor queda registrado al reservar o vender el lote.")))) : /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-gray-500 dark:text-gray-400 italic leading-relaxed" }, canEditLot(selectedLot) ? "Al reservar o vender este lote quedar\xE1 registrado a tu nombre." : `Este lote est\xE1 asignado a ${selectedLot.asesor || "otro asesor"}. Solo ese asesor o el administrador pueden modificarlo.`)), /* @__PURE__ */ React.createElement("div", { className: "text-center mt-3 pt-2" }, /* @__PURE__ */ React.createElement("a", { href: "https://cautivamarketing.com", target: "_blank", rel: "noreferrer", className: "text-[9px] font-bold text-gray-500 hover:text-purple-600 transition-colors inline-block pb-4" }, GLOBAL_COPYRIGHT_TEXT))))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 w-full h-full relative z-10 bg-gray-100" }, /* @__PURE__ */ React.createElement("div", { className: `absolute inset-0 w-full h-full bg-[#f8fafc] overflow-hidden ${view === "map" ? "block" : "hidden"}` }, showBanner && /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-[4rem] sm:bottom-[5rem] left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 pl-4 sm:pl-6 pr-1 py-1 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-30 flex items-center justify-between gap-2 sm:gap-4 border border-white/60 dark:border-gray-700 w-[92%] sm:w-auto max-w-[340px] sm:max-w-none animate-blur-fade" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-800 dark:text-gray-200 text-[9px] sm:text-xs font-medium flex-1 text-center leading-tight" }, "Encuentra tu lote ideal, haz clic y conoce los detalles"), /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
    e.stopPropagation();
    setShowBanner(false);
    setHasDismissedBanner(true);
    localStorage.setItem("crm_dismissed_banner", "true");
  }, className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-900/5 dark:bg-white/10 p-2 rounded-full transition-all shrink-0 border border-gray-900/10 dark:border-white/10 active:scale-95 flex items-center justify-center relative z-[45]" }, /* @__PURE__ */ React.createElement(X, { size: 14, strokeWidth: 3 }))), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 px-3 sm:px-6 py-1.5 sm:py-3 rounded-full border border-gray-200 dark:border-gray-800 shadow-lg z-20 flex items-center gap-2 sm:gap-6 pointer-events-none w-max max-w-[95%]" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-row gap-2.5 sm:gap-5 text-[9px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 flex-wrap justify-center overflow-hidden" }, Object.values(activeStatuses).map((st) => /* @__PURE__ */ React.createElement("div", { key: st.id, className: "flex items-center gap-1 sm:gap-1.5 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-inner shrink-0", style: { backgroundColor: st.color } }), /* @__PURE__ */ React.createElement("span", { className: "truncate" }, st.label))))), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 w-full h-full bg-gray-100 dark:bg-gray-950" }, USE_REAL_3DVISTA ? /* @__PURE__ */ React.createElement("iframe", { ref: iframeRef, src: TOUR_URL, onLoad: handleIframeLoad, className: "w-full h-full border-0 absolute inset-0 z-10 bg-transparent opacity-100", title: "Visor 3DVista", allow: "fullscreen" }) : /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex flex-col items-center justify-center text-white p-10 text-center gap-4" }, /* @__PURE__ */ React.createElement(Map, { size: 60, className: "text-blue-500" }), /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold" }, "Simulaci\xF3n 3DVista"), /* @__PURE__ */ React.createElement("p", { className: "max-w-md text-gray-400" }, "Sube tu tour a ", /* @__PURE__ */ React.createElement("strong", null, TOUR_URL), " para verlo aqu\xED ocupando el 100% de la pantalla."), /* @__PURE__ */ React.createElement("button", { onClick: () => window.postMessage({ type: "select_polygon", lotId: "lote_01" }, TOUR_ORIGIN), className: "mt-4 bg-blue-600 px-6 py-2 rounded-full font-bold" }, "Simular Clic Lote 01")))), /* @__PURE__ */ React.createElement("div", { className: `absolute inset-0 w-full h-full bg-gray-50 dark:bg-gray-900 pt-20 sm:pt-24 px-4 sm:px-8 pb-8 overflow-y-auto ${view === "list" ? "block" : "hidden"} ${isSidebarFixed ? "lg:pl-72" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "w-full mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl sm:text-2xl font-bold text-gray-800 dark:text-white tracking-normal" }, isAgent ? "Gesti\xF3n de Lotes y Asesores" : "Disponibilidad de Lotes")), isAgent && /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-purple-100 dark:border-purple-900/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group" }, /* @__PURE__ */ React.createElement("div", { className: "absolute -right-6 -bottom-6 text-purple-50 dark:text-purple-900/10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none" }, /* @__PURE__ */ React.createElement(Map, { size: 100, strokeWidth: 1.5 })), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-2 relative" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase " }, "Total Lotes"), /* @__PURE__ */ React.createElement("div", { className: "p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400" }, /* @__PURE__ */ React.createElement(Map, { size: 16, className: "sm:w-[18px] sm:h-[18px]", strokeWidth: 2.5 }))), /* @__PURE__ */ React.createElement("div", { className: "text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white relative" }, lots.length)), Object.values(activeStatuses).map((st) => /* @__PURE__ */ React.createElement("div", { key: st.id, className: "bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group", style: { borderColor: `${st.color}40`, borderWidth: "1px" } }, /* @__PURE__ */ React.createElement("div", { className: "absolute -right-6 -bottom-6 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none", style: { color: `${st.color}10` } }, /* @__PURE__ */ React.createElement(CheckCircle, { size: 100, strokeWidth: 1.5 })), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-2 relative" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase truncate max-w-[70%]" }, st.label), /* @__PURE__ */ React.createElement("div", { className: "p-1.5 sm:p-2 rounded-lg", style: { backgroundColor: `${st.color}20`, color: st.color } }, /* @__PURE__ */ React.createElement(CheckCircle, { size: 16, className: "sm:w-[18px] sm:h-[18px]", strokeWidth: 2.5 }))), /* @__PURE__ */ React.createElement("div", { className: "text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white relative" }, lots.filter((l) => l.status === st.id).length)))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" }, /* @__PURE__ */ React.createElement(Search, { size: 18, className: "text-gray-400" })), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: isAgent ? "Buscar por lote, \xE1rea, precio o asesor..." : "Buscar por lote, \xE1rea o precio...",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      className: "block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-white transition-all shadow-sm"
    }
  )), isAgent && asesoresList.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide pt-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-gray-400 uppercase shrink-0 mr-1 flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Filter, { size: 12 }), " Asesores:"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSelectedAsesorFilter("all"),
      className: `px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${selectedAsesorFilter === "all" ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900 shadow-sm border-transparent" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300"}`
    },
    "Todos (",
    lots.length,
    ")"
  ), asesoresList.map((asesorName) => {
    const dColor = getAsesorColor(asesorName);
    const count = lots.filter((l) => l.asesor === asesorName).length;
    const isSelected = selectedAsesorFilter === asesorName;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: asesorName,
        onClick: () => setSelectedAsesorFilter(isSelected ? "all" : asesorName),
        className: `px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${isSelected ? "shadow-sm ring-2 ring-offset-1 dark:ring-offset-gray-900" : "hover:opacity-90"}`,
        style: {
          backgroundColor: isSelected ? dColor : `${dColor}15`,
          color: isSelected ? "#ffffff" : dColor,
          borderColor: `${dColor}40`,
          "--tw-ring-color": dColor
        }
      },
      /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 rounded-full", style: { backgroundColor: isSelected ? "#ffffff" : dColor } }),
      /* @__PURE__ */ React.createElement("span", null, asesorName),
      /* @__PURE__ */ React.createElement("span", { className: `text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/25 text-white" : "bg-black/5 dark:bg-white/10"}` }, count)
    );
  }), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSelectedAsesorFilter(selectedAsesorFilter === "__sin_asesor__" ? "all" : "__sin_asesor__"),
      className: `px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${selectedAsesorFilter === "__sin_asesor__" ? "bg-gray-600 text-white shadow-sm border-transparent" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"}`
    },
    "Sin Asignar (",
    lots.filter((l) => !l.asesor).length,
    ")"
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden" }, isAgent && /* @__PURE__ */ React.createElement("div", { className: "p-4 sm:px-6 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden sm:inline-block" }, "Exportar Reportes:"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 w-full sm:w-auto justify-end" }, isAdmin && /* @__PURE__ */ React.createElement("input", { type: "file", id: "csv-upload", accept: ".csv", className: "hidden", onChange: handleImportCSV }), isAdmin && /* @__PURE__ */ React.createElement("label", { htmlFor: "csv-upload", title: "Importar actualizaciones desde CSV", className: "cursor-pointer flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors" }, /* @__PURE__ */ React.createElement(Upload, { size: 16 }), " ", /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "IMPORTAR")), isAdmin && /* @__PURE__ */ React.createElement("button", { onClick: handleSyncColors, title: "Sincronizar colores con el estado actual", className: "flex items-center gap-2 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-lg text-xs font-bold border border-purple-100 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/30 shadow-sm transition-colors" }, /* @__PURE__ */ React.createElement(ArrowUpDown, { size: 16 }), " ", /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "SINCRONIZAR")), /* @__PURE__ */ React.createElement("button", { onClick: exportPDF, className: "flex items-center gap-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-xs font-bold border border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm transition-colors" }, /* @__PURE__ */ React.createElement(FileText, { size: 16 }), " PDF"), /* @__PURE__ */ React.createElement("button", { onClick: exportCSV, className: "flex items-center gap-2 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 px-4 py-2 rounded-lg text-xs font-bold border border-green-100 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/30 shadow-sm transition-colors" }, /* @__PURE__ */ React.createElement(Download, { size: 16 }), " EXCEL"))), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto w-full" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-center border-collapse min-w-[580px] sm:min-w-[700px] whitespace-nowrap" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-gray-50/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold uppercase border-b border-gray-200 dark:border-gray-800" }, /* @__PURE__ */ React.createElement("th", { className: "px-5 py-4 sm:p-5 text-left cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50", onClick: () => handleSort("name") }, "Lote / Mz ", /* @__PURE__ */ React.createElement(ArrowUpDown, { size: 12, className: "inline ml-1" })), /* @__PURE__ */ React.createElement("th", { className: "px-5 py-4 sm:p-5 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50", onClick: () => handleSort("area") }, "\xC1rea ", /* @__PURE__ */ React.createElement(ArrowUpDown, { size: 12, className: "inline ml-1" })), (!config?.hidePrice || isAgent) && /* @__PURE__ */ React.createElement("th", { className: "px-5 py-4 sm:p-5 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50", onClick: () => handleSort("price") }, "Precio ", /* @__PURE__ */ React.createElement(ArrowUpDown, { size: 12, className: "inline ml-1" })), /* @__PURE__ */ React.createElement("th", { className: "px-5 py-4 sm:p-5 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50", onClick: () => handleSort("status") }, "Estado ", /* @__PURE__ */ React.createElement(ArrowUpDown, { size: 12, className: "inline ml-1" })), isAgent && /* @__PURE__ */ React.createElement("th", { className: "px-5 py-4 sm:p-5 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50", onClick: () => handleSort("asesor") }, "Asesor ", /* @__PURE__ */ React.createElement(ArrowUpDown, { size: 12, className: "inline ml-1" })), /* @__PURE__ */ React.createElement("th", { className: "px-5 py-4 sm:p-5" }, "Acci\xF3n"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-gray-100 dark:divide-gray-800" }, paginatedLots.map((lot) => {
    const asesorName = lot.asesor;
    const asesorColor = getAsesorColor(asesorName);
    return /* @__PURE__ */ React.createElement(
      "tr",
      {
        key: lot.id,
        className: "hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors text-sm cursor-pointer",
        onClick: () => {
          setSelectedLotId(lot.id);
        }
      },
      /* @__PURE__ */ React.createElement("td", { className: "px-5 py-5 sm:p-5 text-left" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 sm:gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-4 h-4 rounded shadow-sm shrink-0", style: { backgroundColor: lot.color } }), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-gray-800 dark:text-gray-200 text-sm sm:text-base" }, lot.name))),
      /* @__PURE__ */ React.createElement("td", { className: "px-5 py-5 sm:p-5 text-gray-600 dark:text-gray-300 font-semibold text-sm sm:text-base" }, lot.area, " m\xB2"),
      (!config?.hidePrice || isAgent) && /* @__PURE__ */ React.createElement("td", { className: "px-5 py-5 sm:p-5 text-gray-800 dark:text-gray-200 font-bold text-sm sm:text-base" }, config?.currency ?? "$", " ", (lot.price || 0).toLocaleString()),
      /* @__PURE__ */ React.createElement("td", { className: "px-5 py-5 sm:p-5" }, /* @__PURE__ */ React.createElement("span", { className: "px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase inline-flex items-center justify-center border shadow-xs", style: { backgroundColor: `${activeStatuses[lot.status]?.color || "#a8a29e"}22`, color: activeStatuses[lot.status]?.color || "#a8a29e", borderColor: `${activeStatuses[lot.status]?.color || "#a8a29e"}40` } }, activeStatuses[lot.status]?.label || lot.status)),
      isAgent && /* @__PURE__ */ React.createElement("td", { className: "px-5 py-5 sm:p-5 text-center" }, asesorName ? /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs", style: {
        backgroundColor: `${asesorColor}18`,
        color: asesorColor,
        borderColor: `${asesorColor}40`
      } }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 rounded-full shrink-0 shadow-xs", style: { backgroundColor: asesorColor } }), /* @__PURE__ */ React.createElement("span", { className: "truncate max-w-[120px]" }, asesorName)) : /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 dark:text-gray-500 italic text-xs" }, "Sin asignar")),
      /* @__PURE__ */ React.createElement("td", { className: "px-5 py-5 sm:p-5 text-center" }, isAgent ? /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
        e.stopPropagation();
        setSelectedLotId(lot.id);
      }, className: "text-purple-600 dark:text-purple-400 font-bold text-xs sm:text-sm uppercase bg-purple-50 dark:bg-purple-900/20 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-purple-100 dark:border-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors" }, /* @__PURE__ */ React.createElement(Edit3, { size: 15, className: "inline mr-1" }), " ", canEditLot(lot) ? "Editar" : "Ver") : lot.status === "disponible" ? /* @__PURE__ */ React.createElement("a", { href: `https://wa.me/${config?.whatsapp ? String(config.whatsapp).replace(/[^0-9]/g, "") : "1234567890"}?text=Hola, estoy interesado en el ${lot.name}`, target: "_blank", rel: "noreferrer", className: "text-white font-bold text-xs sm:text-sm uppercase bg-[#25D366] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md hover:scale-105 transition-transform flex items-center justify-center", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(MessageCircle, { size: 15, className: "mr-1" }), " Consultar") : /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 dark:text-gray-500 italic text-xs" }, "No disp."))
    );
  }), paginatedLots.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: isAgent ? 6 : config?.hidePrice ? 4 : 5, className: "p-10 text-center text-gray-500 dark:text-gray-400 italic" }, "No se encontraron lotes que coincidan con la b\xFAsqueda."))))), totalPages > 1 && /* @__PURE__ */ React.createElement("div", { className: "p-4 sm:px-6 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-gray-500 dark:text-gray-400 font-medium order-2 sm:order-1" }, "Mostrando ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-gray-700 dark:text-gray-200" }, Math.min(sortedLots.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)), " a ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-gray-700 dark:text-gray-200" }, Math.min(sortedLots.length, currentPage * ITEMS_PER_PAGE)), " de ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-gray-700 dark:text-gray-200" }, sortedLots.length), " lotes"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 order-1 sm:order-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentPage((prev) => Math.max(1, prev - 1)),
      disabled: currentPage === 1,
      className: "p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-bold"
    },
    /* @__PURE__ */ React.createElement(ChevronLeft, { size: 16 })
  ), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, [...Array(totalPages)].map((_, i) => {
    const page = i + 1;
    if (totalPages > 5 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
      if (Math.abs(page - currentPage) === 2) return /* @__PURE__ */ React.createElement("span", { key: page, className: "px-1 text-gray-400" }, "...");
      return null;
    }
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: page,
        onClick: () => setCurrentPage(page),
        className: `w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? "bg-purple-600 text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`
      },
      page
    );
  })), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentPage((prev) => Math.min(totalPages, prev + 1)),
      disabled: currentPage === totalPages,
      className: "p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-bold"
    },
    /* @__PURE__ */ React.createElement(ChevronRight, { size: 16 })
  )))))), /* @__PURE__ */ React.createElement("div", { className: `absolute inset-0 w-full h-full bg-gray-50 dark:bg-gray-900 pt-20 sm:pt-24 px-4 sm:px-8 pb-8 overflow-y-auto ${view === "charts" ? "block" : "hidden"} ${isSidebarFixed ? "lg:pl-72" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "w-full mx-auto space-y-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3" }, /* @__PURE__ */ React.createElement(BarChart3, { className: "text-purple-600 dark:text-purple-400", size: 28 }), " M\xE9tricas y Rendimiento"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm" }, "Estad\xEDsticas de ventas, estados de lotes del proyecto y distribuci\xF3n por asesor.")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 w-full sm:w-auto" }, /* @__PURE__ */ React.createElement("button", { onClick: exportChartsPDF, className: "flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-xs font-bold border border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm transition-colors min-h-[40px]" }, /* @__PURE__ */ React.createElement(FileText, { size: 16 }), /* @__PURE__ */ React.createElement("span", { className: "sm:inline" }, "PDF")), /* @__PURE__ */ React.createElement("button", { onClick: exportChartsExcel, className: "flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 px-4 py-2 rounded-xl text-xs font-bold border border-green-100 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/30 shadow-sm transition-colors min-h-[40px]" }, /* @__PURE__ */ React.createElement(Download, { size: 16 }), /* @__PURE__ */ React.createElement("span", { className: "sm:inline" }, "EXCEL")))), /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-2.5 h-2.5 rounded-full bg-blue-600" }), /* @__PURE__ */ React.createElement("h3", { className: "text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider" }, "Estado de Lotes y Ventas")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-blue-100 dark:border-blue-900/40 shadow-sm flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "Total Lotes"), /* @__PURE__ */ React.createElement("div", { className: "p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400" }, /* @__PURE__ */ React.createElement(Map, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white" }, salesStats.totalLots), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-gray-400 mt-1" }, salesStats.totalArea.toLocaleString(), " m\xB2 totales")), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-red-100 dark:border-red-900/40 shadow-sm flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "Lotes Vendidos"), /* @__PURE__ */ React.createElement("div", { className: "p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400" }, /* @__PURE__ */ React.createElement(CheckCircle, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400" }, salesStats.soldCount), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-red-500 font-bold mt-1" }, salesStats.conversionRate, "% del total")), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-amber-100 dark:border-amber-900/40 shadow-sm flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "Reservados"), /* @__PURE__ */ React.createElement("div", { className: "p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400" }, /* @__PURE__ */ React.createElement(Clock, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400" }, salesStats.reservedCount), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-amber-500 font-medium mt-1" }, salesStats.reservedArea.toLocaleString(), " m\xB2")), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "Disponibles"), /* @__PURE__ */ React.createElement("div", { className: "p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400" }, /* @__PURE__ */ React.createElement(CheckCircle, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400" }, salesStats.availableCount), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-emerald-500 font-medium mt-1" }, salesStats.availableArea.toLocaleString(), " m\xB2")), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-purple-100 dark:border-purple-900/40 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "Monto Vendido"), /* @__PURE__ */ React.createElement("div", { className: "p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400" }, /* @__PURE__ */ React.createElement(DollarSign, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate" }, "S/ ", salesStats.soldAmount.toLocaleString()), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-gray-400 mt-1" }, "Recaudaci\xF3n"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-4" }, /* @__PURE__ */ React.createElement("h4", { className: "text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase flex items-center gap-2" }, /* @__PURE__ */ React.createElement(BarChart3, { size: 16, className: "text-purple-600 dark:text-purple-400" }), " Cantidad de Lotes por Estado"), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-gray-400 font-medium" }, chartDataStatus.length, " estados")), /* @__PURE__ */ React.createElement("div", { className: "w-full h-64 sm:h-72 min-h-0" }, chartDataStatus.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center h-full text-gray-400 text-sm" }, "No hay datos de lotes registrados.") : /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement(BarChart, { data: chartDataStatus, margin: { top: 20, right: 15, left: -20, bottom: 15 } }, /* @__PURE__ */ React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: isDarkMode ? "#374151" : "#f3f4f6" }), /* @__PURE__ */ React.createElement(XAxis, { dataKey: "name", axisLine: false, tickLine: false, tick: { fontSize: 11, fill: isDarkMode ? "#9ca3af" : "#6b7280" }, dy: 8 }), /* @__PURE__ */ React.createElement(YAxis, { allowDecimals: false, axisLine: false, tickLine: false, tick: { fontSize: 11, fill: isDarkMode ? "#9ca3af" : "#6b7280" } }), /* @__PURE__ */ React.createElement(
    RechartsTooltip,
    {
      cursor: { fill: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" },
      content: ({ active, payload }) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          const pct = salesStats.totalLots > 0 ? (data.count / salesStats.totalLots * 100).toFixed(1) : 0;
          return /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-950 p-3.5 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 text-xs space-y-1.5" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: data.color } }), /* @__PURE__ */ React.createElement("span", null, data.name)), /* @__PURE__ */ React.createElement("div", { className: "font-bold text-xs", style: { color: data.color } }, "Total: ", data.count, " lotes (", pct, "%)"), /* @__PURE__ */ React.createElement("div", { className: "text-gray-500 dark:text-gray-400" }, "\xC1rea total: ", data.totalArea.toLocaleString(), " m\xB2"), /* @__PURE__ */ React.createElement("div", { className: "text-gray-500 dark:text-gray-400" }, "Monto total: S/ ", data.totalPrice.toLocaleString()));
        }
        return null;
      }
    }
  ), /* @__PURE__ */ React.createElement(Bar, { dataKey: "count", fill: "#9333ea", radius: [8, 8, 0, 0], maxBarSize: 45 }, /* @__PURE__ */ React.createElement(LabelList, { dataKey: "count", position: "top", offset: 8, style: { fontSize: "12px", fontWeight: "800", fill: isDarkMode ? "#e5e7eb" : "#374151" } })))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4" }, /* @__PURE__ */ React.createElement("h4", { className: "text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Calendar, { size: 16, className: "text-emerald-600 dark:text-emerald-400" }), " Historial de Lotes por Periodo"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl" }, [
    { id: "all", label: "Todo" },
    { id: "month", label: "30 D\xEDas" },
    { id: "quarter", label: "90 D\xEDas" },
    { id: "year", label: "A\xF1o" }
  ].map((f) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: f.id,
      onClick: () => setChartFilter(f.id),
      className: `px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${chartFilter === f.id ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"}`
    },
    f.label
  )))), /* @__PURE__ */ React.createElement("div", { className: "w-full h-64 sm:h-72 min-h-0" }, chartData.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center h-full text-gray-400 text-sm" }, "No hay registros para este periodo.") : /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement(BarChart, { data: chartData, margin: { top: 20, right: 15, left: -20, bottom: 15 } }, /* @__PURE__ */ React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: isDarkMode ? "#374151" : "#f3f4f6" }), /* @__PURE__ */ React.createElement(XAxis, { dataKey: "name", axisLine: false, tickLine: false, tick: { fontSize: 11, fill: isDarkMode ? "#9ca3af" : "#6b7280" }, dy: 8 }), /* @__PURE__ */ React.createElement(YAxis, { allowDecimals: false, axisLine: false, tickLine: false, tick: { fontSize: 11, fill: isDarkMode ? "#9ca3af" : "#6b7280" } }), /* @__PURE__ */ React.createElement(
    RechartsTooltip,
    {
      cursor: { fill: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" },
      content: ({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-950 p-3.5 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 text-xs space-y-1.5" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-gray-900 dark:text-white text-sm mb-1" }, label), payload.map((entry, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "flex justify-between items-center gap-4 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "font-medium", style: { color: entry.color } }, activeStatuses[entry.dataKey]?.label || entry.dataKey, ":"), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-gray-800 dark:text-gray-200" }, entry.value, " lotes"))));
        }
        return null;
      }
    }
  ), /* @__PURE__ */ React.createElement(Legend, { wrapperStyle: { fontSize: "11px", paddingTop: "10px" } }), Object.values(activeStatuses).map((st) => st.id !== "disponible" && /* @__PURE__ */ React.createElement(Bar, { key: st.id, dataKey: st.id, name: st.label, fill: st.color, radius: [6, 6, 0, 0], maxBarSize: 30 })))))))), /* @__PURE__ */ React.createElement("div", { className: "border-t border-gray-200 dark:border-gray-800 my-4" }), /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-2.5 h-2.5 rounded-full bg-purple-600" }), /* @__PURE__ */ React.createElement("h3", { className: "text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider" }, "Distribuci\xF3n de Lotes por Asesor")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-purple-100 dark:border-purple-900/40 shadow-sm flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "Asesores Registrados"), /* @__PURE__ */ React.createElement("div", { className: "p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400" }, /* @__PURE__ */ React.createElement(Users, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white" }, asesoresList.length)), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "Lotes Asignados"), /* @__PURE__ */ React.createElement("div", { className: "p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400" }, /* @__PURE__ */ React.createElement(CheckCircle, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white" }, lots.filter((l) => l.asesor).length)), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-amber-100 dark:border-amber-900/40 shadow-sm flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "Lotes Sin Asesor"), /* @__PURE__ */ React.createElement("div", { className: "p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400" }, /* @__PURE__ */ React.createElement(AlertTriangle, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white" }, lots.filter((l) => !l.asesor).length)), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-blue-100 dark:border-blue-900/40 shadow-sm flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "Total Lotes Proyecto"), /* @__PURE__ */ React.createElement("div", { className: "p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400" }, /* @__PURE__ */ React.createElement(Map, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white" }, lots.length))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col" }, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-bold text-gray-800 dark:text-gray-200 mb-6 uppercase flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Users, { size: 18, className: "text-purple-500 shrink-0" }), /* @__PURE__ */ React.createElement("span", null, "Detalle de Lotes y \xC1reas por Asesor")), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, chartDataAsesores.data.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-8 text-gray-400 text-sm" }, "No hay asesores registrados en el sistema.") : chartDataAsesores.data.map((row, idx) => {
    const pct = chartDataAsesores.totalLots > 0 ? row.total / chartDataAsesores.totalLots * 100 : 0;
    const isUnassigned = row.name === "Sin Asesor Asignado";
    const initials = isUnassigned ? "SD" : row.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    const dColor = row.color || "#9ca3af";
    return /* @__PURE__ */ React.createElement("div", { key: idx, className: "p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 hover:border-purple-200 dark:hover:border-purple-900/50 transition-all" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm ring-2 ring-white dark:ring-gray-800", style: { backgroundColor: dColor } }, initials), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, row.name), !isUnassigned && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase", style: { backgroundColor: `${dColor}15`, color: dColor, borderColor: `${dColor}35` } }, "Asesor")), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-gray-500 dark:text-gray-400 font-medium" }, "\xC1rea acumulada: ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-gray-700 dark:text-gray-300" }, row.totalArea.toLocaleString(), " m\xB2")))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 self-end sm:self-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: "text-lg sm:text-xl font-bold text-gray-800 dark:text-white leading-tight" }, row.total, " ", /* @__PURE__ */ React.createElement("span", { className: "text-xs font-normal text-gray-500 dark:text-gray-400" }, row.total === 1 ? "lote" : "lotes")), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-bold", style: { color: dColor } }, pct.toFixed(1), "% del proyecto")))), /* @__PURE__ */ React.createElement("div", { className: "w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "h-full rounded-full transition-all duration-700 ease-out", style: { width: `${pct}%`, backgroundColor: dColor } })), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 pt-1" }, Object.values(activeStatuses).map((st) => /* @__PURE__ */ React.createElement("div", { key: st.id, className: "text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5", style: { backgroundColor: `${st.color}15`, borderColor: `${st.color}35`, color: st.color } }, /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full", style: { backgroundColor: st.color } }), /* @__PURE__ */ React.createElement("span", null, row[st.id] || 0, " ", st.label)))));
  })))))), /* @__PURE__ */ React.createElement("div", { className: `absolute inset-0 w-full h-full bg-gray-50 dark:bg-gray-900 pt-20 sm:pt-24 px-4 sm:px-8 pb-8 overflow-y-auto ${view === "config" ? "block" : "hidden"} ${isSidebarFixed ? "lg:pl-72" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "w-full mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "mb-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3" }, /* @__PURE__ */ React.createElement(Settings, { className: "text-purple-600 dark:text-purple-400", size: 28 }), " Configuraci\xF3n del Sistema"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-500 dark:text-gray-400 mt-2 text-sm" }, "Gestiona los accesos de usuarios, n\xFAmeros de contacto y estados de lotes.")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 shrink-0 md:col-span-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gray-100 dark:border-gray-800 gap-3" }, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-gray-800 dark:text-gray-200 uppercase flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Key, { size: 18, className: "text-purple-500 dark:text-purple-400" }), " Gesti\xF3n de Accesos y Usuarios del CRM"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setEditingUser(null);
        setUserForm({ name: "", email: "", password: "", role: "asesor", color: "" });
        setUserFormError("");
        setShowUserModal(true);
      },
      className: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all self-start sm:self-auto"
    },
    /* @__PURE__ */ React.createElement(UserPlus, { size: 16 }),
    " Crear Nuevo Acceso"
  )), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-gray-500 dark:text-gray-400 mb-5 italic leading-relaxed" }, "Crea cuentas para los asesores y administradores. Cada usuario ingresa al CRM con su correo y contrase\xF1a (gestionados por Firebase Authentication). El asesor queda registrado autom\xE1ticamente en cada lote que reserva o vende."), usersList.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "h-32 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400 gap-2" }, /* @__PURE__ */ React.createElement(Shield, { size: 24, className: "text-gray-300 dark:text-gray-600" }), /* @__PURE__ */ React.createElement("span", null, 'No hay usuarios creados todav\xEDa. Haz clic en "Crear Nuevo Acceso".')) : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" }, usersList.map((usr) => {
    const roleColor = usr.role === "admin" ? "#9333ea" : getAsesorColor(usr.name);
    const isActive = usr.active !== false;
    const lotCount = lots.filter((l) => l.asesorUid === usr.id).length;
    return /* @__PURE__ */ React.createElement("div", { key: usr.id, className: `bg-gray-50 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between gap-3 group hover:border-purple-200 dark:hover:border-purple-900 transition-all ${isActive ? "" : "opacity-60"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm", style: { backgroundColor: roleColor } }, (usr.name || "?").substring(0, 2).toUpperCase()), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-sm text-gray-800 dark:text-white truncate" }, usr.name), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate" }, usr.email))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 opacity-80 group-hover:opacity-100" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setEditingUser(usr);
          setUserForm({ name: usr.name || "", email: usr.email || "", password: "", role: usr.role || "asesor", color: usr.color || "" });
          setUserFormError("");
          setShowUserModal(true);
        },
        className: "text-gray-400 hover:text-purple-600 p-1.5 transition-colors",
        title: "Editar usuario"
      },
      /* @__PURE__ */ React.createElement(Edit3, { size: 15 })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleToggleUserActive(usr),
        className: `text-gray-400 p-1.5 transition-colors ${isActive ? "hover:text-red-500" : "hover:text-green-600"}`,
        title: isActive ? "Desactivar acceso" : "Reactivar acceso"
      },
      /* @__PURE__ */ React.createElement(Power, { size: 15 })
    ))), /* @__PURE__ */ React.createElement("div", { className: "pt-2 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border", style: { backgroundColor: `${roleColor}15`, color: roleColor, borderColor: `${roleColor}35` } }, usr.role === "admin" ? "Admin" : "Asesor", isActive ? "" : " \xB7 Inactivo"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-gray-500 dark:text-gray-400 font-medium" }, lotCount, " ", lotCount === 1 ? "lote" : "lotes")));
  }))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 flex flex-col" }, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-gray-800 dark:text-gray-200 uppercase flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 mb-6" }, /* @__PURE__ */ React.createElement(MessageCircle, { size: 18, className: "text-green-500 dark:text-green-400" }), " Configuraci\xF3n de Contacto"), /* @__PURE__ */ React.createElement("div", { className: "space-y-6 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase " }, "WhatsApp Principal"), /* @__PURE__ */ React.createElement("input", { type: "text", value: config?.whatsapp || "", onChange: (e) => setConfig({ ...config, whatsapp: e.target.value }), className: "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-bold", placeholder: "51987654321" }), /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-[10px] italic text-gray-400 dark:text-gray-500" }, "Nota: Para contacto por WhatsApp en los detalles del lote. Usar c\xF3digo de pa\xEDs.")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase " }, "Tel\xE9fono de Llamadas"), /* @__PURE__ */ React.createElement("input", { type: "text", value: config?.phone || "", onChange: (e) => setConfig({ ...config, phone: e.target.value }), className: "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all", placeholder: "+51 987 654 321" }), /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-[10px] italic text-gray-400 dark:text-gray-500" }, "Nota: Para bot\xF3n de llamadas directas."))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 flex flex-col" }, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-gray-800 dark:text-gray-200 uppercase flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 mb-6" }, /* @__PURE__ */ React.createElement(DollarSign, { size: 18, className: "text-amber-500 dark:text-amber-400" }), " Moneda y Visibilidad de Precios"), /* @__PURE__ */ React.createElement("div", { className: "space-y-5 flex-1" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase" }, "S\xEDmbolo Visual de Moneda"), /* @__PURE__ */ React.createElement("input", { type: "text", value: config?.currency ?? "$", onChange: (e) => setConfig({ ...config, currency: e.target.value }), className: "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold", placeholder: "Ej. $, S/.", maxLength: "5" })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase" }, "Ocultar precios a clientes"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-500 dark:text-gray-400 mt-1" }, "Los precios solo ser\xE1n visibles para usuarios autorizados del CRM.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setConfig({ ...config, hidePrice: !config?.hidePrice }),
      className: `relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0 ${config?.hidePrice ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: `absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${config?.hidePrice ? "translate-x-6" : "translate-x-0"}` })
  )))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 shrink-0 md:col-span-2" }, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-gray-800 dark:text-gray-200 uppercase flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 mb-6" }, /* @__PURE__ */ React.createElement(CheckCircle, { size: 18, className: "text-emerald-500 dark:text-emerald-400" }), " Configuraci\xF3n de Estados"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-gray-500 dark:text-gray-400 mb-4 italic leading-relaxed" }, "Puedes renombrar los estados y bloquear lotes para el p\xFAblico. Los colores del plano 360\xB0 son fijos: verde (disponible), amarillo (reservado) y rojo (vendido)."), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" }, Object.values(activeStatuses).map((st) => /* @__PURE__ */ React.createElement("div", { key: st.id, className: "bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase font-mono" }, "ID: ", st.id)), /* @__PURE__ */ React.createElement("input", { type: "text", value: st.label, onChange: (e) => {
    const val = e.target.value;
    setConfig((prev) => {
      const sc = { ...prev?.statusConfig || DEFAULT_STATUSES };
      sc[st.id] = { ...sc[st.id], label: val };
      return { ...prev, statusConfig: sc };
    });
  }, className: "w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500", placeholder: "Nombre a mostrar" }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-8 h-8 rounded border border-gray-200 dark:border-gray-700 shrink-0", style: { backgroundColor: st.color }, title: "Color fijo en el plano 360\xB0" }), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-gray-500 font-mono" }, st.color.toUpperCase())), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700 mt-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Lock, { size: 12, className: st.isBlocked ? "text-red-500" : "text-gray-300" }), " Bloquear Lote"), /* @__PURE__ */ React.createElement("label", { className: "relative inline-flex items-center cursor-pointer" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      className: "sr-only peer",
      checked: st.isBlocked || false,
      onChange: async (e) => {
        const checked = e.target.checked;
        setConfig((prev) => {
          const sc = { ...prev?.statusConfig || DEFAULT_STATUSES };
          sc[st.id] = { ...sc[st.id], isBlocked: checked };
          const configRef = getConfigDoc();
          setDoc(configRef, { statusConfig: sc }, { merge: true }).catch((err) => console.error("Error auto-saving blocked state:", err));
          return { ...prev, statusConfig: sc };
        });
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-red-500" }))))))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 shrink-0 md:col-span-2" }, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-gray-800 dark:text-gray-200 uppercase flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 mb-6" }, /* @__PURE__ */ React.createElement(Layers, { size: 18, className: "text-orange-500 dark:text-orange-400" }), " Nombres de Capas Extras"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-gray-500 dark:text-gray-400 mb-4 italic leading-relaxed" }, "Estas son las capas adicionales detectadas en el mapa 3D (v\xEDas, manzanas, etc.). Asigna un nombre visual para el panel de clientes."), extraLayers.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "h-24 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400" }, "No se encontraron capas detectadas. Entra al Plano 360\xB0 para detectarlas.") : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2" }, extraLayers.map((layerId) => {
    const defaultName = layerId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    const currentName = config?.layerNames?.[layerId] || "";
    return /* @__PURE__ */ React.createElement("div", { key: layerId }, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase font-mono truncate", title: layerId }, layerId), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: currentName,
        onChange: (e) => setConfig({ ...config, layerNames: { ...config?.layerNames || {}, [layerId]: e.target.value } }),
        className: "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400",
        placeholder: `Ej. ${defaultName}`
      }
    ));
  })))))), /* @__PURE__ */ React.createElement("div", { className: "mt-8 flex justify-end pb-12" }, /* @__PURE__ */ React.createElement("button", { onClick: saveConfigToFirebase, className: "w-full sm:w-auto bg-gray-900 dark:bg-purple-600 hover:bg-black dark:hover:bg-purple-700 text-white font-bold text-xs uppercase py-4 px-10 rounded-xl shadow-sm flex justify-center items-center gap-3 transition-all active:scale-95" }, /* @__PURE__ */ React.createElement(Save, { size: 18 }), " GUARDAR CONFIGURACI\xD3N")))), showUserModal && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 flex items-center justify-center z-[160] px-4" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-black/20 dark:bg-black/40", onClick: () => setShowUserModal(false) }), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-gray-900 w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] relative z-10 border border-gray-100 dark:border-gray-800 animate-[scale-up_0.2s_ease-out]" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setShowUserModal(false), className: "absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" }, /* @__PURE__ */ React.createElement(X, { size: 20 })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(UserPlus, { size: 20 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-gray-800 dark:text-gray-100" }, editingUser ? "Editar Usuario" : "Nuevo Usuario del CRM"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400" }, "El acceso lo gestiona Firebase Authentication (correo y contrase\xF1a)."))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveUser, className: "space-y-4 mt-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase" }, "Nombre Completo"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: userForm.name,
      onChange: (e) => {
        setUserForm({ ...userForm, name: e.target.value });
        setUserFormError("");
      },
      className: "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all",
      placeholder: "Ej. Juan Manuel Vargas",
      autoFocus: true
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase" }, "Correo electr\xF3nico"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      value: userForm.email,
      disabled: !!editingUser,
      onChange: (e) => {
        setUserForm({ ...userForm, email: e.target.value });
        setUserFormError("");
      },
      className: "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono disabled:opacity-60 disabled:cursor-not-allowed",
      placeholder: "asesor@ejemplo.com"
    }
  )), !editingUser && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase" }, "Contrase\xF1a inicial"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: userForm.password,
      onChange: (e) => {
        setUserForm({ ...userForm, password: e.target.value });
        setUserFormError("");
      },
      className: "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono",
      placeholder: "M\xEDnimo 6 caracteres",
      autoComplete: "new-password"
    }
  ), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 mt-1 italic" }, 'No se guarda en la base de datos. Entr\xE9gala por un canal seguro; el usuario puede cambiarla con "\xBFOlvidaste tu contrase\xF1a?".')), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase" }, "Rol de Acceso"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: userForm.role,
      onChange: (e) => setUserForm({ ...userForm, role: e.target.value }),
      className: "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium cursor-pointer"
    },
    /* @__PURE__ */ React.createElement("option", { value: "asesor" }, "Asesor de ventas"),
    /* @__PURE__ */ React.createElement("option", { value: "admin" }, "Administrador")
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase" }, "Color (opcional)"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "color",
      value: userForm.color || getAsesorColor(userForm.name),
      onChange: (e) => setUserForm({ ...userForm, color: e.target.value }),
      className: "w-10 h-10 rounded-lg cursor-pointer border-0 p-0 shrink-0",
      title: "Color del asesor en el CRM"
    }
  ), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setUserForm({ ...userForm, color: "" }), className: "text-xs font-semibold text-gray-500 hover:text-purple-600 transition-colors" }, "Usar color autom\xE1tico"))), userFormError && /* @__PURE__ */ React.createElement("p", { className: "text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-xl" }, userFormError), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 pt-3" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setShowUserModal(false), className: "flex-1 py-3 px-4 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: userSaving, className: "flex-1 py-3 px-4 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white shadow-md transition-colors" }, userSaving ? "Guardando..." : editingUser ? "Guardar Cambios" : "Crear Usuario")))))));
}
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(error);
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ React.createElement("div", { style: { padding: 20, background: "#fff1f2", color: "#9f1239", border: "2px solid #fda4af", margin: 20, borderRadius: 10 } }, /* @__PURE__ */ React.createElement("h2", { style: { fontWeight: "bold" } }, "Error Cr\xEDtico en React"), /* @__PURE__ */ React.createElement("pre", { style: { fontSize: 12 } }, this.state.error && this.state.error.toString()), /* @__PURE__ */ React.createElement("pre", { style: { fontSize: 10, marginTop: 10 } }, this.state.errorInfo && this.state.errorInfo.componentStack));
    }
    return this.props.children;
  }
}
const root = createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ React.createElement(ErrorBoundary, null, /* @__PURE__ */ React.createElement(App, null)));
