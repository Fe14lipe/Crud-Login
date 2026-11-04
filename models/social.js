// MODEL: publicaciones, me gusta, comentarios y equipos seguidos
const db = require('./db');

const q = async (sql, params) => (await db.query(sql, params)).rows;

exports.resumen = async (usuario) => (await q(
  `SELECT (SELECT count(*) FROM publicaciones WHERE autor = $1)::int AS publicaciones,
          (SELECT count(*) FROM likes l JOIN publicaciones p ON p.id = l.publicacion_id WHERE p.autor = $1)::int AS me_gusta,
          (SELECT count(*) FROM seguidos WHERE usuario = $1)::int AS seguidos,
          (SELECT count(*) FROM guardados WHERE usuario = $1)::int AS guardados`, [usuario]))[0];

exports.publicaciones = (usuario) => q(
  `SELECT p.id, p.autor, p.texto, p.local_nombre, p.local_goles, p.visita_nombre, p.visita_goles, p.pie, p.creado_en,
          p.equipo_id, e.sigla, l.nombre AS liga,
          (SELECT count(*) FROM likes WHERE publicacion_id = p.id)::int AS likes,
          (SELECT count(*) FROM comentarios WHERE publicacion_id = p.id)::int AS comentarios,
          EXISTS (SELECT 1 FROM likes WHERE publicacion_id = p.id AND usuario = $1) AS liked,
          EXISTS (SELECT 1 FROM seguidos s WHERE s.equipo_id = p.equipo_id AND s.usuario = $1) AS seguido
   FROM publicaciones p LEFT JOIN equipos e ON e.id = p.equipo_id LEFT JOIN ligas l ON l.id = e.liga_id
   ORDER BY p.creado_en DESC LIMIT 50`, [usuario]);

exports.crearPublicacion = async (usuario, texto) => (await q(
  'INSERT INTO publicaciones (autor, texto) VALUES ($1,$2) RETURNING id', [usuario, texto]))[0];

// Un usuario solo puede borrar sus propias publicaciones
exports.borrarPublicacion = (id, usuario) => q('DELETE FROM publicaciones WHERE id=$1 AND autor=$2 RETURNING 1', [id, usuario]);

exports.alternarLike = async (usuario, id) => {
  const borrados = await q('DELETE FROM likes WHERE usuario=$1 AND publicacion_id=$2 RETURNING 1', [usuario, id]);
  if (!borrados.length) await q('INSERT INTO likes (publicacion_id, usuario) VALUES ($2,$1)', [usuario, id]);
};

exports.comentarios = (id) => q('SELECT id, usuario, texto, creado_en FROM comentarios WHERE publicacion_id=$1 ORDER BY id', [id]);
exports.crearComentario = (id, usuario, texto) => q(
  'INSERT INTO comentarios (publicacion_id, usuario, texto) VALUES ($1,$2,$3)', [id, usuario, texto]);

exports.equipos = (usuario) => q(
  `SELECT e.id, e.nombre, e.sigla, e.fundado,
          EXISTS (SELECT 1 FROM seguidos s WHERE s.equipo_id = e.id AND s.usuario = $1) AS seguido
   FROM equipos e ORDER BY e.nombre`, [usuario]);

exports.alternarSeguir = async (usuario, equipoId) => {
  const borrados = await q('DELETE FROM seguidos WHERE usuario=$1 AND equipo_id=$2 RETURNING 1', [usuario, equipoId]);
  if (!borrados.length) await q('INSERT INTO seguidos (usuario, equipo_id) VALUES ($1,$2)', [usuario, equipoId]);
};
