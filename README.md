# ⚽ Pomasqui Stream: CRUD + Login con MVC

Aplicación sencilla de **streaming de partidos de fútbol**. Permite iniciar sesión y gestionar (crear, leer, actualizar y eliminar) los streams disponibles. Las rutas protegidas no son accesibles sin autenticación.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express.js (API REST) |
| Frontend | JavaScript puro (Vanilla JS) + HTML + CSS |
| Comunicación | REST con JSON y Fetch API |
| Sesiones | `express-session` (cookie de sesión) |
| Contraseñas | Hash **MD5** con el módulo `crypto` de Node |

## Arquitectura MVC

| Componente | Archivo | Qué hace |
|-----------|---------|----------|
| **Model** | Array `streams` y array `users` en `server.js` | Datos en memoria |
| **View** | `views/index.html` (CRUD) y `public/login.html` | Interfaz |
| **Controller** | `server.js` | Rutas, lógica del CRUD y autenticación |

```
crud_login/
├── server.js          # Controller (+ Model en memoria)
├── views/index.html   # Vista protegida (CRUD)
├── public/login.html  # Vista pública (login)
├── .env.example       # Plantilla de configuración (sin datos reales)
├── package.json
└── README.md
```

## Instalación y uso

Requiere Node.js 20.12 o superior.

1. Instalar dependencias:

```bash
npm install
```

2. Crear el archivo de configuración a partir de la plantilla:

```bash
cp .env.example .env
```

3. Completar `.env` (usuario, hash MD5 de la contraseña y secreto de sesión). Los comandos para generar el hash y el secreto están en `.env.example`.

4. Iniciar el servidor y abrir <http://localhost:3000>:

```bash
npm start
```

El archivo `.env` está en `.gitignore` y nunca se sube al repositorio.

## Autenticación

- `POST /api/login` compara el MD5 de la contraseña enviada con el hash guardado y crea la sesión.
- `POST /api/logout` destruye la sesión.
- El middleware `requireAuth` protege la página `/` y todas las rutas `/api/streams`:
  - Páginas: redirige a `/login.html`.
  - API: responde `401 No autenticado`.

> MD5 se usa porque lo pide la actividad. En un proyecto real se usaría `bcrypt`.

## API REST

| Método | Ruta | Acción | Protegida |
|--------|------|--------|-----------|
| POST | `/api/login` | Iniciar sesión | No |
| POST | `/api/logout` | Cerrar sesión | No |
| GET | `/api/streams` | Listar streams | Sí |
| POST | `/api/streams` | Crear stream | Sí |
| PUT | `/api/streams/:id` | Actualizar stream | Sí |
| DELETE | `/api/streams/:id` | Eliminar stream | Sí |

Cuerpo de un stream: `{ "title": "Boca vs River", "league": "Liga Profesional", "status": "EN VIVO" }`

## Limitaciones

Los datos viven en memoria: al reiniciar el servidor vuelven a los valores iniciales.
