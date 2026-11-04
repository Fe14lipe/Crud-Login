// CONTROLLER: rutas, autenticación y lógica del CRUD
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');

// Credenciales y secretos viven en .env (no se sube a Git). Ver .env.example
try { process.loadEnvFile(); } catch { /* sin .env: se usan variables del sistema */ }
const { ADMIN_USER, ADMIN_PASSWORD_HASH, SESSION_SECRET, PORT = 3000 } = process.env;
if (!ADMIN_USER || !ADMIN_PASSWORD_HASH || !SESSION_SECRET) {
  console.error('Faltan variables en .env (ADMIN_USER, ADMIN_PASSWORD_HASH, SESSION_SECRET). Copia .env.example a .env');
  process.exit(1);
}

const app = express();
const md5 = (texto) => crypto.createHash('md5').update(texto).digest('hex');

const Liga = require('./controllers/liga');
const Social = require('./controllers/social');
const Jugadores = require('./controllers/jugadores');
const Streams = require('./controllers/streams'); // los streams viven en PostgreSQL (models/)
const users = [{ username: ADMIN_USER, password: ADMIN_PASSWORD_HASH }]; // la contraseña se guarda encriptada (MD5)

// Middlewares 
app.use(express.json());
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));

// Protege rutas: sin sesión -> 401 (API) o redirige al login (páginas)
const requireAuth = (req, res, next) => {
  if (req.session.user) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'No autenticado' });
  res.redirect('/login.html');
};

// Auth 
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === md5(password || ''));
  if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  req.session.user = user.username;
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => req.session.destroy(() => res.json({ ok: true })));

// CRUD protegido (Express 4 no captura errores async: wrap -> 500 en vez de caer el servidor)
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => { console.error(e); res.status(500).json({ error: 'Error del servidor' }); });

app.get('/api/liga', requireAuth, wrap(Liga.resumen));

app.get('/api/yo', requireAuth, wrap(Social.yo));
app.get('/api/publicaciones', requireAuth, wrap(Social.publicaciones));
app.post('/api/publicaciones', requireAuth, wrap(Social.publicar));
app.delete('/api/publicaciones/:id', requireAuth, wrap(Social.borrar));
app.post('/api/publicaciones/:id/like', requireAuth, wrap(Social.like));
app.get('/api/publicaciones/:id/comentarios', requireAuth, wrap(Social.comentarios));
app.post('/api/publicaciones/:id/comentarios', requireAuth, wrap(Social.comentar));
app.get('/api/equipos', requireAuth, wrap(Social.equipos));
app.post('/api/equipos/:id/seguir', requireAuth, wrap(Social.seguir));
app.get('/api/ligas/:ligaId/equipos', requireAuth, wrap(Jugadores.equiposDeLiga)); // dropdown en cascada
app.get('/api/jugadores', requireAuth, wrap(Jugadores.listar));
app.post('/api/jugadores', requireAuth, wrap(Jugadores.crear));
app.put('/api/jugadores/:id', requireAuth, wrap(Jugadores.actualizar));
app.delete('/api/jugadores/:id', requireAuth, wrap(Jugadores.eliminar));
app.post('/api/jugadores/:id/guardar', requireAuth, wrap(Jugadores.guardar));

app.get('/api/paises', requireAuth, wrap(Streams.paises));
app.get('/api/paises/:paisId/ligas', requireAuth, wrap(Streams.ligas)); // dropdown en cascada
app.get('/api/streams', requireAuth, wrap(Streams.listar));
app.post('/api/streams', requireAuth, wrap(Streams.crear));
app.put('/api/streams/:id', requireAuth, wrap(Streams.actualizar));
app.delete('/api/streams/:id', requireAuth, wrap(Streams.eliminar));

// VIEWS
app.get('/', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/index.html', requireAuth, (req, res) => res.redirect('/'));
app.use(express.static(path.join(__dirname, 'public'), { index: false })); // solo login.html es público

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
