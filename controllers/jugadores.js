// CONTROLLER: CRUD de jugadores con validación en BACK-END
const Jugador = require('../models/jugadores');

const POSICIONES = ['POR', 'DFC', 'LD', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DC'];
const entre = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;

// El código del jugador es el dato sensible: se valida aquí, no solo en el navegador.
// (El navegador puede saltarse con DevTools o curl; la BD además lo protege con UNIQUE y CHECK.)
function validar(b) {
  const d = {
    codigo: Number(b.codigo), nombre: String(b.nombre ?? '').trim(), posicion: b.posicion,
    edad: Number(b.edad), ritmo: Number(b.ritmo), tiro: Number(b.tiro), pase: Number(b.pase),
    equipo_id: Number(b.equipo_id), disponible: b.disponible === true || b.disponible === 'true',
  };
  if (!/^\d{3,7}$/.test(String(b.codigo ?? '').trim())) return { error: 'El código debe ser numérico, de 3 a 7 dígitos' };
  if (d.nombre.length < 3 || d.nombre.length > 80) return { error: 'El nombre debe tener entre 3 y 80 caracteres' };
  if (!POSICIONES.includes(d.posicion)) return { error: 'Posición inválida' };
  if (!entre(d.edad, 14, 60)) return { error: 'La edad debe estar entre 14 y 60' };
  for (const k of ['ritmo', 'tiro', 'pase']) if (!entre(d[k], 1, 99)) return { error: `${k} debe estar entre 1 y 99` };
  if (!entre(d.equipo_id, 1, 2147483647)) return { error: 'Selecciona un equipo válido' };
  return { datos: d };
}

const manejarError = (res, e) => {
  if (e.code === '23505') return res.status(409).json({ error: 'Ya existe un jugador con ese código' });
  if (e.code === '23503') return res.status(400).json({ error: 'El equipo seleccionado no existe' });
  throw e; // lo atrapa wrap() en server.js -> 500
};

const idValido = (req) => (/^\d+$/.test(req.params.id) ? Number(req.params.id) : null);

exports.listar = async (req, res) => res.json(await Jugador.listar(req.session.user));

exports.equiposDeLiga = async (req, res) => {
  const id = idValido({ params: { id: req.params.ligaId } });
  if (!id) return res.status(400).json({ error: 'Liga inválida' });
  res.json(await Jugador.equiposDeLiga(id));
};

exports.crear = async (req, res) => {
  const { error, datos } = validar(req.body);
  if (error) return res.status(400).json({ error });
  try { res.status(201).json(await Jugador.crear(datos, req.session.user)); } catch (e) { manejarError(res, e); }
};

exports.actualizar = async (req, res) => {
  const id = idValido(req);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  const { error, datos } = validar(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const j = await Jugador.actualizar(id, datos, req.session.user);
    j ? res.json(j) : res.status(404).json({ error: 'No existe' });
  } catch (e) { manejarError(res, e); }
};

exports.eliminar = async (req, res) => {
  const id = idValido(req);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  await Jugador.eliminar(id);
  res.json({ ok: true });
};

exports.guardar = async (req, res) => {
  const id = idValido(req);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  try { res.json(await Jugador.alternarGuardado(req.session.user, id)); } catch (e) { manejarError(res, e); }
};
