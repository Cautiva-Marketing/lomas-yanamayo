#!/usr/bin/env python3
"""Sincroniza el export de 3DVista de Lomas de Yanamayo I con el CRM.

Pasos (idempotente, se puede correr tras cada re-export):
  1. Copia  <3D Yanamayo>/lomas1/web/*  ->  tour/   (omite .DS_Store / __MACOSX).
  2. Inyecta <script src="crm-bridge.js"></script> despues de script.js en tour/index.htm
     (es la UNICA edicion al export; script.js y script_general.js no se tocan).
  3. Lee tour/script_general.js (solo lectura) y busca los overlays de lote:
     data.label == L<Manzana><Numero>-V   (ej. LA1-V, LJ21-V).
  4. Genera <imagen>_reservado.webp (#f59e0b) y <imagen>_vendido.webp (#ef4444)
     conservando el canal alfa del poligono verde original.
  5. Escribe crm/lots.js y tour/lots-map.json.

Uso:  python tools/sync_tour.py [--src RUTA_AL_EXPORT_WEB] [--skip-copy]
"""
import argparse
import json
import re
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SRC = ROOT.parent.parent / "3D Yanamayo" / "lomas1" / "web"
TOUR = ROOT / "tour"
LOTS_JS = ROOT / "crm" / "lots.js"
LOTS_MAP = TOUR / "lots-map.json"

BRIDGE_TAG = '<script src="crm-bridge.js"></script>'
SKIP_NAMES = {".DS_Store", "__MACOSX", "Thumbs.db"}
# Archivos propios del proyecto que viven en tour/ pero NO vienen del export.
OWN_FILES = {"crm-bridge.js", "lots-map.json"}

COLORS = {
    "reservado": (245, 158, 11),  # #f59e0b amarillo
    "vendido": (239, 68, 68),     # #ef4444 rojo
}

LABEL_RE = re.compile(r'"label":"(L([A-Z])(\d+)-V)"')
URL_RE = re.compile(r'"url":"(media/[^"]+\.webp)"')
OVERLAY_MARKER = '{"class":"HotspotPanoramaOverlay",'
OVERLAY_ID_MARKER = '"id":"overlay_'


def copy_export(src: Path) -> int:
    """Copia el export a tour/ sin borrar nada. Devuelve cuantos archivos copio."""
    if not src.is_dir():
        sys.exit(f"[ERROR] No existe la carpeta del export: {src}")
    copied = 0
    for path in src.rglob("*"):
        if any(part in SKIP_NAMES for part in path.relative_to(src).parts):
            continue
        dest = TOUR / path.relative_to(src)
        if path.is_dir():
            dest.mkdir(parents=True, exist_ok=True)
            continue
        if dest.exists():
            if path.name == "index.htm" and path.parent == src:
                # El index del tour lleva nuestra inyeccion: comparar sin ella.
                injected = dest.read_text(encoding="utf-8").replace("\n    " + BRIDGE_TAG, "")
                if injected == path.read_text(encoding="utf-8"):
                    continue
            else:
                s, d = path.stat(), dest.stat()
                if s.st_size == d.st_size and int(s.st_mtime) <= int(d.st_mtime):
                    continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)
        copied += 1
    return copied


def inject_bridge() -> str:
    """Agrega el script del puente a tour/index.htm (idempotente)."""
    index = TOUR / "index.htm"
    html = index.read_text(encoding="utf-8")
    if "crm-bridge.js" in html:
        return "ya estaba inyectado"
    pattern = re.compile(r'(<script\s+src="script\.js[^"]*"\s*>\s*</script>)')
    if not pattern.search(html):
        sys.exit("[ERROR] No encontre <script src=\"script.js...\"> en tour/index.htm")
    html = pattern.sub(lambda m: m.group(1) + "\n    " + BRIDGE_TAG, html, count=1)
    index.write_text(html, encoding="utf-8")
    return "inyectado"


def find_lot_overlays(script_text: str):
    """Devuelve [(label, manzana, numero, url_relativa)] leyendo script_general.js."""
    lots, no_image = [], []
    pos = 0
    while True:
        start = script_text.find(OVERLAY_MARKER, pos)
        if start < 0:
            break
        pos = start + len(OVERLAY_MARKER)
        end = script_text.find(OVERLAY_ID_MARKER, start)
        if end < 0:
            continue
        segment = script_text[start:end]  # los items vienen antes del id del overlay
        label = LABEL_RE.search(segment)
        if not label:
            continue
        url = URL_RE.search(segment)
        if not url:
            no_image.append(label.group(1))
            continue
        lots.append((label.group(1), label.group(2), int(label.group(3)), url.group(1)))
    return lots, no_image


def lot_id(manzana: str, number: int) -> str:
    return f"mz{manzana.lower()}-{number:02d}"


def lot_name(manzana: str, number: int) -> str:
    return f"Mz {manzana} - Lote {number:02d}"


def make_variant(src_png: Path, dst: Path, rgb) -> None:
    """Mismo poligono (alfa) pero relleno de un solo color."""
    base = Image.open(src_png).convert("RGBA")
    alpha = base.getchannel("A")
    out = Image.new("RGBA", base.size, rgb + (255,))
    out.putalpha(alpha)
    out.save(dst, "WEBP", lossless=True, quality=100, method=6)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--src", type=Path, default=DEFAULT_SRC, help="carpeta web/ exportada por 3DVista")
    parser.add_argument("--skip-copy", action="store_true", help="no copiar el export, solo regenerar datos e imagenes")
    args = parser.parse_args()

    print("== Paso 1: copiar export ==")
    if args.skip_copy:
        print("  (omitido)")
    else:
        print(f"  origen: {args.src}")
        print(f"  archivos copiados/actualizados: {copy_export(args.src)}")

    print("== Paso 2: puente en tour/index.htm ==")
    print(f"  {inject_bridge()}")

    print("== Paso 3: detectar lotes en script_general.js ==")
    script = (TOUR / "script_general.js").read_text(encoding="utf-8")
    found, no_image = find_lot_overlays(script)
    if no_image:
        print(f"  [AVISO] overlays de lote sin imagen .webp: {no_image}")

    by_label = {}
    for label, manzana, number, url in found:
        if label in by_label:
            print(f"  [AVISO] etiqueta duplicada {label}: se conserva la primera")
            continue
        by_label[label] = (manzana, number, url)

    rows = sorted(by_label.items(), key=lambda kv: (kv[1][0], kv[1][1]))
    if not rows:
        sys.exit("[ERROR] No se encontraron lotes con etiqueta L<Mz><N>-V")
    print(f"  lotes detectados: {len(rows)}")

    # Huecos de numeracion por manzana (lotes sin poligono en el export).
    nums = {}
    for _label, (manzana, number, _url) in rows:
        nums.setdefault(manzana, []).append(number)
    for manzana in sorted(nums):
        missing = [n for n in range(1, max(nums[manzana]) + 1) if n not in nums[manzana]]
        if missing:
            print(f"  [AVISO] Mz {manzana}: sin poligono para los lotes {missing}")

    print("== Paso 4: generar imagenes amarilla / roja ==")
    media = TOUR / "media"
    wanted = set()
    generated = 0
    for label, (_m, _n, url) in rows:
        base_path = TOUR / url
        if not base_path.is_file():
            sys.exit(f"[ERROR] Falta la imagen {base_path}")
        for state, rgb in COLORS.items():
            dst = base_path.with_name(base_path.stem + f"_{state}.webp")
            wanted.add(dst.name)
            if dst.exists() and dst.stat().st_mtime >= base_path.stat().st_mtime:
                continue
            make_variant(base_path, dst, rgb)
            generated += 1
    stale = [p for p in media.glob("*.webp") if re.search(r"_(reservado|vendido)\.webp$", p.name) and p.name not in wanted]
    for p in stale:
        p.unlink()
    print(f"  generadas: {generated}  | ya vigentes: {len(wanted) - generated}  | obsoletas borradas: {len(stale)}")

    print("== Paso 5: escribir crm/lots.js y tour/lots-map.json ==")
    lots, lots_map = [], {}
    for label, (manzana, number, url) in rows:
        base = Path(url)
        lots.append({"id": lot_id(manzana, number), "name": lot_name(manzana, number), "label": label})
        lots_map[label] = {
            "id": lot_id(manzana, number),
            "base": url,
            "reservado": f"{base.parent.as_posix()}/{base.stem}_reservado.webp",
            "vendido": f"{base.parent.as_posix()}/{base.stem}_vendido.webp",
        }
    LOTS_JS.parent.mkdir(parents=True, exist_ok=True)
    body = ",\n".join("  " + json.dumps(l, ensure_ascii=False) for l in lots)
    LOTS_JS.write_text(
        "// GENERADO por tools/sync_tour.py - no editar a mano.\n"
        f"// {len(lots)} lotes con poligono en el tour de Lomas de Yanamayo I.\n"
        f"export const LOTS = [\n{body}\n];\n",
        encoding="utf-8",
    )
    LOTS_MAP.write_text(json.dumps(lots_map, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"\nListo: {len(lots)} lotes -> crm/lots.js, tour/lots-map.json")


if __name__ == "__main__":
    main()
