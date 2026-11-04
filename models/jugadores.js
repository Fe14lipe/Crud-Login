// MODEL: jugadores (perfiles que se muestran como tarjetas)
const db = require('./db');

const q = async (sql, params) => (await db.query(sql, params)).rows;

const SELECT = `
  SELECT j.id, j.codigo, j.nombre, j.posicion, j.edad, j.ritmo, j.tiro, j.pase, j.disponible,
         ROUND((j.ritmo + j.tiro + j.pase) / 3.0)::int AS media,
         e.id AS equipo_id, e.nombre AS equipo, e.sigla, l.id AS liga_id, l.pais_id,
         EXISTS (SELECT 1 FROM guardados g WHERE g.jugador_id = j.id AND g.usuario = $1) AS guardado
  FROM jugadores j JOIN equipos e ON e.id = j.equipo_id JOIN ligas l ON l.id = e.liga_id`;

exports.listar = (usuario) => q(`${SELECT} ORDER BY media DESC, j.nombre`, [usuario]);
exports.obtener = async (id, usuario) => (await q(`${SELECT} WHERE j.id = $2`, [usuario, id]))[0];
exports.equiposDeLiga = (ligaId) => q('SELECT id, nombre FROM equipos WHERE liga_id = $1 ORDER BY nombre', [ligaId]);

const COLS = ['codigo', 'nombre', 'posicion', 'edad', 'ritmo', 'tiro', 'pase', 'equipo_id', 'disponible'];

exports.crear = async (d, usuario) => {
  const [{ id }] = await q(
    `INSERT INTO jugadores (${COLS}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`, COLS.map((c) => d[c]));
  return exports.obtener(id, usuario);
};

exports.actualizar = async (id, d, usuario) => {
  const rows = await q(
    `UPDATE jugadores SET ${COLS.map((c, i) => `${c}=$${i + 1}`)} WHERE id=$${COLS.length + 1} RETURNING id`, [...COLS.map((c) => d[c]), id]);
  return rows[0] && exports.obtener(id, usuario);
};

exports.eliminar = (id) => q('DELETE FROM jugadores WHERE id = $1', [id]);

// Guardar / quitar de "Jugadores guardados"
exports.alternarGuardado = async (usuario, id) => {
  const borrados = await q('DELETE FROM guardados WHERE usuario=$1 AND jugador_id=$2 RETURNING 1', [usuario, id]);
  if (!borrados.length) await q('INSERT INTO guardados (usuario, jugador_id) VALUES ($1,$2)', [usuario, id]);
  return { guardado: !borrados.length };
};
