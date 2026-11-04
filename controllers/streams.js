// CONTROLLER: validación en BACK-END + lógica del CRUD
const Stream = require('../models/streams');

const ESTADOS = ['EN VIVO', 'PRÓXIMO', 'FINALIZADO'];

// Dato sensible: la URL de transmisión. NO se confía en el JS del navegador;
// aquí se valida antes de grabar (protocolo https, longitud, formato).
function validar(body) {
  const titulo = String(body.titulo ?? '').trim();
  const url = String(body.url ?? '').trim();
  const liga_id = Number(body.liga_id);
  const estado = body.estado;

  if (titulo.length < 3 || titulo.length > 100) return { error: 'El título debe tener entre 3 y 100 caracteres' };
  if (!Number.isInteger(liga_id) || liga_id <= 0) return { error: 'Selecciona una liga válida' };
  if (!ESTADOS.includes(estado)) return { error: 'Estado inválido' };

  let parsed;
  try { parsed = new URL(url); } catch { return { error: 'La URL del stream no tiene un formato válido' }; }
  if (parsed.protocol !== 'https:') return { error: 'La URL del stream debe usar https://' };
  if (url.length > 500) return { error: 'La URL del stream es demasiado larga' };

  return { datos: { titulo, liga_id, estado, url: parsed.href } };
}

// Traduce errores de PostgreSQL (restricciones de la BD) a respuestas HTTP
const manejarError = (res, e) => {
  if (e.code === '23505') return res.status(409).json({ error: 'Ya existe un stream con esa URL' });
  if (e.code === '23503') return res.status(400).json({ error: 'La liga seleccionada no existe' });
  console.error(e);
  res.status(500).json({ error: 'Error del servidor' });
};

const idValido = (req) => (/^\d+$/.test(req.params.id) ? Number(req.params.id) : null);

exports.paises = async (req, res) => res.json(await Stream.paises());

exports.ligas = async (req, res) => {
  const paisId = Number(req.params.paisId);
  if (!Number.isInteger(paisId)) return res.status(400).json({ error: 'País inválido' });
  res.json(await Stream.ligasDePais(paisId));
};

exports.listar = async (req, res) => res.json(await Stream.listar());

exports.crear = async (req, res) => {
  const { error, datos } = validar(req.body);
  if (error) return res.status(400).json({ error });
  try { res.status(201).json(await Stream.crear(datos)); } catch (e) { manejarError(res, e); }
};

exports.actualizar = async (req, res) => {
  const id = idValido(req);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  const { error, datos } = validar(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const stream = await Stream.actualizar(id, datos);
    stream ? res.json(stream) : res.status(404).json({ error: 'No existe' });
  } catch (e) { manejarError(res, e); }
};

exports.eliminar = async (req, res) => {
  const id = idValido(req);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  await Stream.eliminar(id);
  res.json({ ok: true });
};
