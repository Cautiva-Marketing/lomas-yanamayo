# Lomas de Yanamayo I - Plano 360° con estados de lotes

Plano 360° (tour de 3DVista) incrustado en un CRM con login. Cada lote se ve **verde** (disponible),
**amarillo** (reservado) o **rojo** (vendido) y lo controlan los asesores desde el CRM.

- Base de datos: proyecto Firebase **`sol-de-yanamayo`** (nuevo, solo para Lomas I). No se usan las bases de
  Jardines de Tacna ni la del sitio actual de El Sol de Yanamayo.
- Hosting: SiteGround (`/lomas1/`) y Vercel. Es el mismo código y la misma base de datos en los dos.

```
index.html, manifest.json, img/   shell del CRM (PWA)
crm/app.jsx  ->  crm/app.js       CRM (React). app.js es el compilado; app.jsx es el código fuente
crm/lots.js                       GENERADO: los 179 lotes (id mza-01, nombre "Mz A - Lote 01")
crm/firebase-config.js            config web del proyecto Firebase
tour/                             export de 3DVista + tour/crm-bridge.js (pinta los estados)
tools/sync_tour.py                copia el export de 3DVista y genera lotes e imágenes amarillas/rojas
tools/build_zip.py                genera dist/lomas1.zip para SiteGround
firestore.rules, firebase.json    reglas de seguridad de Firestore
```

## Cómo funciona el color de cada lote
Cada lote del tour es un polígono verde (`data.label` = `LA1-V`, `LJ21-V`...). `sync_tour.py` genera una copia
amarilla y otra roja de cada imagen. `tour/crm-bridge.js` recibe el estado desde el CRM (`update_lots`) y cambia la
imagen del polígono en vivo. **No se modifica `script.js` ni `script_general.js`** del export: lo único que se toca
del export es una línea en `tour/index.htm` que carga `crm-bridge.js`.

## Re-exportar desde 3DVista (cuando cambies el tour)
1. Exporta el tour **desde el 3DVista con licencia** (si sale la marca de agua "Created with 3DVista" o el aviso
   "Descargar el tour", ese export no tiene licencia: no lo publiques).
2. Deja el resultado en `3D Yanamayo/lomas1/web` (o pasa `--src`).
3. `python tools/sync_tour.py` (necesita Python y Pillow: `pip install pillow`). Es seguro repetirlo.
   Avisa de los lotes que no tienen polígono en el tour (hoy: Mz I 5-8, J 5-15, K 5-7, L 7-8).
4. Si cambió la lista de lotes, entra al CRM como admin y pulsa **Sincronizar** (crea los lotes nuevos).

## Compilar el CRM (tras editar `crm/app.jsx`)
```
npx esbuild crm/app.jsx --outfile=crm/app.js --target=es2020      (o: npm run build)
```

## Primera puesta en marcha de Firebase (una sola vez)
1. **Authentication** -> Sign-in method -> activar **Correo electrónico/contraseña**.
2. **Reglas:** publicar `firestore.rules` (consola -> Firestore -> Reglas, o `firebase deploy --only firestore:rules`).
3. **Primer administrador:** Authentication -> Usuarios -> *Agregar usuario* (correo + contraseña). Copia su **UID**.
   Luego Firestore -> colección **`usuarios`** -> documento con ese UID y estos campos (tipo string):
   `role` = `admin`, `name` = su nombre, `email` = su correo.
4. Entra al CRM con ese usuario -> Lista de lotes -> **SINCRONIZAR** (crea los 179 lotes como disponibles).
5. En **Configuración -> Usuarios** el admin crea a los asesores (rol `asesor`). Cada asesor entra con su correo y
   contraseña. Para quitar un acceso se **desactiva** (se puede reactivar; sus lotes conservan el historial).

### Quién puede qué
| | Público | Asesor | Admin |
|---|---|---|---|
| Ver plano y lista de lotes | sí | sí | sí |
| Reservar / vender un lote **disponible** | no | sí (queda registrado él y la fecha) | sí |
| Modificar un lote reservado/vendido | no | solo los suyos | todos |
| Volver un lote a disponible | no | solo los suyos (se borra el asesor) | todos |
| Precio, área, nombre, reasignar asesor, importar CSV, usuarios, configuración | no | no | sí |

Esto se exige en el servidor (`firestore.rules`), no solo en la pantalla. Las contraseñas viven solo en Firebase
Authentication; nunca se guardan en Firestore.

## Publicar en SiteGround (`/lomas1/`)
1. `python tools/build_zip.py` -> `dist/lomas1.zip`.
2. SiteGround -> Site Tools -> **File Manager** -> carpeta raíz del subdominio (la que tiene el `index.html` del
   sitio actual) -> **Upload** `lomas1.zip` -> clic derecho -> **Extract**. Queda `.../lomas1/`.
3. Borra el zip del servidor. Si ves contenido viejo: Site Tools -> Speed -> Caching -> **Flush Cache**.
4. Abre `https://elsoldeyanamayo.cautivamarketing.com/lomas1/`.
5. En Firebase -> Authentication -> Settings -> **Authorized domains**, agrega `elsoldeyanamayo.cautivamarketing.com`
   (y el dominio de Vercel). Sin esto el login falla en esos dominios.

## Publicar en Vercel
Proyecto estático independiente, sin build (`vercel.json` ya lo indica; `.vercelignore` deja fuera lo que no sirve).
```
npx vercel deploy --prod       (desde esta carpeta; la primera vez: npx vercel login)
```
El sitio pesa ~60 MB y ~900 archivos. Agrega el dominio de Vercel a *Authorized domains* de Firebase (paso 5 de arriba).

## Notas
- Los documentos de `lotes` son de lectura pública (así funciona el plano sin login): el nombre del asesor de un lote
  reservado/vendido es técnicamente legible por cualquiera que consulte la base. La interfaz pública no lo muestra.
- El plano solo puede colorear los lotes que tienen polígono en el tour (179 de 199 numerados).
