#!/usr/bin/env python3
"""Genera dist/lomas1.zip listo para subir a SiteGround (File Manager -> Extract).

El ZIP trae la carpeta `lomas1/` en la raíz, con index.html, manifest.json, .htaccess,
crm/ (app.js, lots.js, firebase-config.js), img/ y tour/. Se deja fuera lo que no sirve
en producción: tools/, *.jsx, node_modules, archivos de Firebase/Vercel, dist/, README.

Uso:  python tools/build_zip.py
"""
import os
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
STAGE = DIST / "_stage"
FOLDER = "lomas1"
OUT = DIST / "lomas1.zip"

EXCLUDE_DIRS = {"tools", "dist", "node_modules", ".claude", ".git", "__MACOSX"}
EXCLUDE_FILES = {
    "package.json", "package-lock.json", "firebase.json", "firestore.rules", ".firebaserc",
    "vercel.json", ".vercelignore", "README.md", ".DS_Store", "Thumbs.db",
}
EXCLUDE_SUFFIXES = {".jsx"}


def keep(rel: Path) -> bool:
    if any(part in EXCLUDE_DIRS for part in rel.parts):
        return False
    if rel.name in EXCLUDE_FILES or rel.suffix in EXCLUDE_SUFFIXES:
        return False
    return True


def find_bsdtar():
    """tar de Windows/macOS (bsdtar). El GNU tar de Git Bash no sirve: lee "D:" como un host remoto."""
    candidates = []
    system_root = os.environ.get("SystemRoot")
    if system_root:
        candidates.append(Path(system_root) / "System32" / "tar.exe")
    found = shutil.which("tar")
    if found:
        candidates.append(Path(found))
    for candidate in candidates:
        if candidate.is_file():
            try:
                version = subprocess.run([str(candidate), "--version"], capture_output=True, text=True).stdout
            except OSError:
                continue
            if "bsdtar" in version.lower():
                return str(candidate)
    return None


def main() -> None:
    app_jsx, app_js = ROOT / "crm" / "app.jsx", ROOT / "crm" / "app.js"
    if not app_js.is_file():
        sys.exit("[ERROR] Falta crm/app.js. Compila antes: npx esbuild crm/app.jsx --outfile=crm/app.js --target=es2020")
    if app_jsx.is_file() and app_jsx.stat().st_mtime > app_js.stat().st_mtime:
        sys.exit("[ERROR] crm/app.js está desactualizado respecto a crm/app.jsx. Vuelve a compilar (npm run build).")
    for needed in ("index.html", "crm/lots.js", "crm/firebase-config.js", "tour/index.htm", "tour/crm-bridge.js"):
        if not (ROOT / needed).is_file():
            sys.exit(f"[ERROR] Falta {needed}. Corre tools/sync_tour.py.")
    if "REEMPLAZAR" in (ROOT / "crm" / "firebase-config.js").read_text(encoding="utf-8"):
        sys.exit("[ERROR] crm/firebase-config.js todavía tiene valores REEMPLAZAR_...")

    if DIST.exists():
        shutil.rmtree(DIST)
    target = STAGE / FOLDER
    target.mkdir(parents=True)

    files = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT)
        if not keep(rel):
            continue
        dest = target / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)
        files.append(rel.as_posix())

    tar = find_bsdtar()
    if tar:
        # bsdtar (Windows 10+/macOS): -a elige el formato por la extensión (.zip) y usa "/" en las rutas
        subprocess.run([tar, "-a", "-c", "-f", str(OUT), "-C", str(STAGE), FOLDER], check=True)
    else:
        with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
            for rel in files:
                zf.write(target / rel, f"{FOLDER}/{rel}")

    shutil.rmtree(STAGE)
    size_mb = OUT.stat().st_size / (1024 * 1024)
    print(f"Listo: {OUT}")
    print(f"  {len(files)} archivos, {size_mb:.1f} MB (carpeta raíz del zip: {FOLDER}/)")


if __name__ == "__main__":
    main()
