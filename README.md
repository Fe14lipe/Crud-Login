# ⚽ Pomasqui Stream: CRUD + Login con MVC

![Node.js](https://img.shields.io/badge/Node.js-20.12%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Estado](https://img.shields.io/badge/Estado-Funcional-brightgreen)

Aplicación web para gestionar los partidos de una plataforma de **streaming de fútbol**. Un usuario inicia sesión y, desde una sección protegida, crea, consulta, edita y elimina streams. Sin sesión, ni la página ni la API son accesibles.

Proyecto académico que aplica el patrón **MVC**, operaciones **CRUD** y **autenticación** con contraseña encriptada.

## Índice

- [Estado del proyecto](#estado-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Arquitectura MVC](#arquitectura-mvc)
- [Tecnologías](#tecnologías)
- [Cómo abrir y ejecutar](#cómo-abrir-y-ejecutar)
- [Autenticación](#autenticación)
- [API REST](#api-rest)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Limitaciones y próximos pasos](#limitaciones-y-próximos-pasos)
- [Autor](#autor)

## Estado del proyecto

✅ **Funcional.** Login, protección de rutas y CRUD de streams completos. Los datos viven en memoria (ver [Limitaciones](#limitaciones-y-próximos-pasos)).

## Funcionalidades

- **Login y logout** con sesión por cookie.
- **Rutas protegidas:** la página principal y la API responden solo a usuarios autenticados.
  - Páginas: redirigen a `/login.html`.
  - API: responden `401 No autenticado`.
- **CRUD de streams:** crear, leer, actualizar y eliminar partidos (título, liga y estado: EN VIVO, PRÓXIMO o FINALIZADO).
- **Contraseña encriptada** con hash MD5.
- **Credenciales fuera del código:** se configuran en un archivo `.env` que no se sube a Git.

## Arquitectura MVC

| Componente | Archivo | Responsabilidad |
|-----------|---------|-----------------|
| **Model** | Arrays `users` y `streams` en `server.js` | Datos en memoria |
| **View** | `views/index.html` y `public/login.html` | Interfaz (HTML + CSS + JS) |
| **Controller** | `server.js` | Rutas, lógica del CRUD y autenticación |

La vista y el servidor se comunican con **JSON** mediante la **Fetch API**.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express.js (API REST) |
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

2. Crear el archivo de configuración a partir de la plantilla:

```bash
cp .env.example .env
```

3. Completar `.env` con tu usuario, el **hash MD5** de tu contraseña y un secreto de sesión. Los comandos para generar el hash y el secreto están dentro de `.env.example`.

4. Iniciar el servidor:

```bash
npm start
```

5. Abrir <http://localhost:3000> en el navegador. Sin sesión, te redirige al login.

> El archivo `.env` está en `.gitignore` y nunca se sube al repositorio.

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
| GET | `/api/streams` | Listar streams | Sí |
| POST | `/api/streams` | Crear stream | Sí |
| PUT | `/api/streams/:id` | Actualizar stream | Sí |
| DELETE | `/api/streams/:id` | Eliminar stream | Sí |

Cuerpo de un stream:

```json
{ "title": "Boca vs River", "league": "Liga Profesional", "status": "EN VIVO" }
```

## Estructura del proyecto

```
Crud-Login/
├── server.js          # Controller (+ Model en memoria)
├── views/index.html   # Vista protegida (CRUD)
├── public/login.html  # Vista pública (login)
├── .env.example       # Plantilla de configuración (sin datos reales)
├── package.json
└── README.md
```

## Limitaciones y próximos pasos

- Los datos viven en memoria: al reiniciar el servidor vuelven a los valores iniciales.
- Hay un único usuario, definido en `.env`.

Ideas para escalar:

- Separar el controlador en carpetas (`models/`, `controllers/`, `routes/`).
- Persistir los datos en una base de datos (SQLite, MySQL o PostgreSQL).
- Reemplazar MD5 por `bcrypt`, agregar registro de usuarios y roles.

## Autor

**Fe14lipe** · [github.com/Fe14lipe](https://github.com/Fe14lipe)
