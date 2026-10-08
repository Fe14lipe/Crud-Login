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

// ---------- MODEL (datos en memoria) ----------
const users = [{ username: ADMIN_USER, password: ADMIN_PASSWORD_HASH }]; // la contraseña se guarda encriptada (MD5)
let streams = [
  { id: 1, title: 'Real Madrid vs Barcelona', league: 'La Liga', status: 'EN VIVO' },
  { id: 2, title: 'Liverpool vs Man City', league: 'Premier League', status: 'PRÓXIMO' },
];
let nextId = 3;

// ---------- Middlewares ----------
app.use(express.json());
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));

// Protege rutas: sin sesión -> 401 (API) o redirige al login (páginas)
const requireAuth = (req, res, next) => {
  if (req.session.user) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'No autenticado' });
  res.redirect('/login.html');
};

// ---------- Auth ----------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === md5(password || ''));
  if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  req.session.user = user.username;
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => req.session.destroy(() => res.json({ ok: true })));

// ---------- CRUD protegido ----------
app.get('/api/streams', requireAuth, (req, res) => res.json(streams));

app.post('/api/streams', requireAuth, (req, res) => {
  const { title, league, status } = req.body;
  if (!title || !league || !status) return res.status(400).json({ error: 'Faltan datos' });
  const stream = { id: nextId++, title, league, status };
  streams.push(stream);
  res.status(201).json(stream);
});

app.put('/api/streams/:id', requireAuth, (req, res) => {
  const stream = streams.find((s) => s.id === Number(req.params.id));
  if (!stream) return res.status(404).json({ error: 'No existe' });
  const { title, league, status } = req.body;
  if (!title || !league || !status) return res.status(400).json({ error: 'Faltan datos' });
  Object.assign(stream, { title, league, status });
  res.json(stream);
});

app.delete('/api/streams/:id', requireAuth, (req, res) => {
  streams = streams.filter((s) => s.id !== Number(req.params.id));
  res.json({ ok: true });
});

// ---------- VIEWS ----------
app.get('/', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/index.html', requireAuth, (req, res) => res.redirect('/'));
app.use(express.static(path.join(__dirname, 'public'), { index: false })); // solo login.html es público

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
