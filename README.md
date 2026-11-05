# ⚽ Peloteros: red social de fútbol barrial (CRUD + Login con MVC)

![Node.js](https://img.shields.io/badge/Node.js-20.12%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Estado](https://img.shields.io/badge/Estado-Funcional-brightgreen)

Aplicación web de **fútbol barrial** con datos reales de la Liga Barrial de Pomasqui. Un usuario inicia sesión y, desde una sección protegida, administra jugadores y streams de partidos, publica, comenta y sigue equipos. Sin sesión, ni la página ni la API son accesibles.

🌐 **App desplegada:** <https://peloteros-srny.onrender.com> (plan gratuito de Render: la primera carga puede tardar unos 50 segundos).

Proyecto académico que aplica el patrón **MVC**, operaciones **CRUD** y **autenticación** con contraseña encriptada.

## Índice

- [Estado del proyecto](#estado-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Arquitectura MVC](#arquitectura-mvc)
- [Tecnologías](#tecnologías)
- [Cómo abrir y ejecutar](#cómo-abrir-y-ejecutar)
- [Deploy en Render](#deploy-en-render)
- [Autenticación](#autenticación)
- [API REST](#api-rest)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Limitaciones y próximos pasos](#limitaciones-y-próximos-pasos)
- [Autor](#autor)

## Estado del proyecto

✅ **Funcional.** Login, protección de rutas y CRUD de streams con base de datos **PostgreSQL**.

## Funcionalidades

- **Login y logout** con sesión por cookie.
- **Rutas protegidas:** la página principal y la API responden solo a usuarios autenticados.
  - Páginas: redirigen a `/login.html`.
  - API: responden `401 No autenticado`.
- **CRUD de streams:** crear, leer, actualizar y eliminar partidos (título, país, liga, estado y URL de transmisión).
- **Interfaz "Peloteros":** red social de fútbol barrial con perfil, tarjetas doradas de jugadores, publicaciones con marcador, buscador y menú lateral.
  - **Red social funcional:** publicar, borrar tus publicaciones, me gusta, comentarios, seguir equipos y guardar jugadores (todo en PostgreSQL).
  - **Explorar:** tabla de posiciones, goleadores y equipos reales de la Liga Barrial de Pomasqui.
  - **Admin:** CRUD de jugadores (dropdowns en cascada País → Liga → Equipo) y de streams.
- **Validación en Back-End de la cédula (dato sensible):** al crear o editar un jugador, el servidor valida la **cédula ecuatoriana** (10 dígitos, provincia 01-24, tercer dígito 0-5 y dígito verificador con el algoritmo módulo 10) antes de grabar en la base ([`controllers/cedula.js`](controllers/cedula.js)). El formulario no la valida a propósito: el navegador puede saltarse el JavaScript, el servidor no. Además la cédula es única y se muestra enmascarada en la tabla (`17••••••65`).
- **Código de jugador autogenerado** (`IDENTITY` de PostgreSQL): no se escribe a mano. Nombre, posición, edad, valoraciones y equipo también se validan en el servidor.
- **Dropdowns en cascada:** al elegir el **país** se cargan solo las **ligas** de ese país (no se escribe ninguna clave foránea a mano).
- **Validación en Back-End de la URL del stream:** debe ser `https://` y única; título, estado y liga también se validan en el servidor antes de grabar. Las restricciones `UNIQUE`, `FOREIGN KEY` y `CHECK` de la BD son la última barrera.
- **Contraseña encriptada** con hash MD5.
- **Credenciales fuera del código:** se configuran en un archivo `.env` que no se sube a Git.

## Arquitectura MVC

| Componente | Archivo | Responsabilidad |
|-----------|---------|-----------------|
| **Model** | `models/db.js`, `models/streams.js` | Conexión y consultas SQL parametrizadas (PostgreSQL) |
| **View** | `views/index.html` y `public/login.html` | Interfaz (HTML + CSS + JS) |
| **Controller** | `controllers/streams.js`, `server.js` | Validación, lógica del CRUD, rutas y autenticación |

La vista y el servidor se comunican con **JSON** mediante la **Fetch API**.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express.js (API REST) |
| Base de datos | PostgreSQL (`pg`), administrada con pgAdmin 4 |
| Frontend | JavaScript puro (Vanilla JS) + HTML + CSS |
| Comunicación | REST con JSON y Fetch API |
| Sesiones | `express-session` (cookie de sesión) |
| Contraseñas | Hash **MD5** con el módulo `crypto` de Node |

## Cómo abrir y ejecutar

**Requisitos:** [Node.js](https://nodejs.org/) 20.12 o superior y [Git](https://git-scm.com/).

1. Clonar el repositorio e instalar dependencias:

```bash
git clone https://github.com/Fe14lipe/Crud-Login.git
cd Crud-Login
npm install
```

2. Crear la base de datos en **pgAdmin 4**: clic derecho en *Databases → Create → Database* con el nombre `pomasqui_stream`; luego abrir *Query Tool*, cargar [`db/schema.sql`](db/schema.sql) y ejecutarlo (F5). Crea las tablas `paises`, `ligas`, `streams` y datos de ejemplo. Después ejecuta, en este orden, [`db/liga.sql`](db/liga.sql) y [`db/peloteros.sql`](db/peloteros.sql) (jugadores, publicaciones, me gusta, comentarios, equipos seguidos y guardados). El primero: carga los equipos, la tabla de posiciones y los goleadores reales de la categoría MAXIMA de la [Liga Barrial de Pomasqui](https://pomasqui.sadcaftorneos.com/maxima/inicio).

3. Crear el archivo de configuración a partir de la plantilla:

```bash
cp .env.example .env
```

4. Completar `.env` con tu usuario, el **hash MD5** de tu contraseña, un secreto de sesión y los datos de conexión a PostgreSQL (`DB_*`). Los comandos para generar el hash y el secreto están dentro de `.env.example`.

5. Iniciar el servidor:

```bash
npm start
```

6. Abrir <http://localhost:3000> en el navegador. Sin sesión, te redirige al login.

> El archivo `.env` está en `.gitignore` y nunca se sube al repositorio.

## Deploy en Render

1. Subir el repositorio a GitHub.
2. En [Render](https://render.com): **New → PostgreSQL** (plan gratuito). Copiar la *External Database URL*.
3. Cargar los datos desde pgAdmin: *Register → Server* con los datos de la base de Render (SSL en *require*) y ejecutar `db/schema.sql`, `db/liga.sql` y `db/peloteros.sql` en ese orden.
4. **New → Web Service**, conectar el repositorio y configurar:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Variables de entorno: `NODE_ENV=production`, `DATABASE_URL` (la de Render; se prefiere la *Internal Database URL*), `ADMIN_USER`, `ADMIN_PASSWORD_HASH` y `SESSION_SECRET`.
5. Al terminar el deploy, abrir la URL `https://<tu-servicio>.onrender.com`.

> En el plan gratuito el servicio se duerme tras unos minutos sin uso y la primera visita tarda en responder.

## Autenticación

1. `POST /api/login` calcula el MD5 de la contraseña recibida y lo compara con el hash configurado. Si coincide, crea la sesión.
2. `POST /api/logout` destruye la sesión.
3. El middleware `requireAuth` protege la página `/` y todas las rutas `/api/streams`.

> MD5 se usa porque lo exige la actividad. En un proyecto real se recomienda `bcrypt`.

## API REST

| Método | Ruta | Acción | Protegida |
|--------|------|--------|-----------|
| POST | `/api/login` | Iniciar sesión | No |
| POST | `/api/logout` | Cerrar sesión | No |
| GET | `/api/liga` | Posiciones y goleadores de la liga | Sí |
| GET | `/api/yo` | Perfil y contadores del usuario | Sí |
| GET/POST | `/api/publicaciones` | Listar / publicar | Sí |
| DELETE | `/api/publicaciones/:id` | Borrar una publicación propia | Sí |
| POST | `/api/publicaciones/:id/like` | Me gusta (alterna) | Sí |
| GET/POST | `/api/publicaciones/:id/comentarios` | Comentarios | Sí |
| GET | `/api/equipos` | Equipos y si los sigues | Sí |
| POST | `/api/equipos/:id/seguir` | Seguir / dejar de seguir (alterna) | Sí |
| GET | `/api/ligas/:id/equipos` | Equipos de una liga (dropdown en cascada) | Sí |
| GET/POST | `/api/jugadores` | Listar / crear jugadores | Sí |
| PUT/DELETE | `/api/jugadores/:id` | Editar / eliminar jugador | Sí |
| POST | `/api/jugadores/:id/guardar` | Guardar jugador (alterna) | Sí |
| GET | `/api/paises` | Listar países | Sí |
| GET | `/api/paises/:id/ligas` | Ligas de un país (dropdown en cascada) | Sí |
| GET | `/api/streams` | Listar streams | Sí |
| POST | `/api/streams` | Crear stream | Sí |
| PUT | `/api/streams/:id` | Actualizar stream | Sí |
| DELETE | `/api/streams/:id` | Eliminar stream | Sí |

> Los jugadores de demostración (Mateo Ruiz, Johan Mina…) y sus valoraciones son ilustrativos, no personas reales. Los resultados de las publicaciones de ejemplo sí son reales (segunda etapa, fecha 7).

Cuerpo de un stream:

```json
{ "titulo": "Boca vs River", "liga_id": 4, "estado": "EN VIVO", "url": "https://stream.example.com/boca-river" }
```

## Estructura del proyecto

```
Crud-Login/
├── server.js          # Rutas, sesión y arranque
├── controllers/       # Validación y lógica del CRUD
├── models/            # Conexión y consultas a PostgreSQL
├── db/schema.sql      # Tablas y datos de ejemplo
├── db/peloteros.sql   # Jugadores y red social
├── db/liga.sql        # Datos de la liga (generado por el script)
├── scripts/scrape-liga.js  # Descarga los datos de la liga y genera db/liga.sql
├── views/index.html   # Vista protegida (CRUD)
├── public/login.html  # Vista pública (login)
├── .env.example       # Plantilla de configuración (sin datos reales)
├── package.json
└── README.md
```

## Limitaciones y próximos pasos

- Hay un único usuario, definido en `.env`.

Ideas para escalar:

- Actualizar los datos de la liga: `node scripts/scrape-liga.js` y volver a ejecutar `db/liga.sql`. Solo se importan equipos, posiciones y goleadores (no sanciones disciplinarias).
- CRUD de países y ligas desde la interfaz.
- Reemplazar MD5 por `bcrypt`, agregar registro de usuarios y roles.

## Autor

**Fe14lipe** · [github.com/Fe14lipe](https://github.com/Fe14lipe)
