// MODEL: consultas SQL (siempre parametrizadas -> sin inyección SQL)
const db = require('./db');

const SELECT = `
  SELECT s.id, s.titulo, s.estado, s.url, s.liga_id, l.nombre AS liga, p.id AS pais_id, p.nombre AS pais
  FROM streams s JOIN ligas l ON l.id = s.liga_id JOIN paises p ON p.id = l.pais_id`;

const q = async (sql, params) => (await db.query(sql, params)).rows;

exports.paises = () => q('SELECT id, nombre FROM paises ORDER BY nombre');
exports.ligasDePais = (paisId) => q('SELECT id, nombre FROM ligas WHERE pais_id = $1 ORDER BY nombre', [paisId]);
exports.listar = () => q(`${SELECT} ORDER BY s.id`);
exports.obtener = async (id) => (await q(`${SELECT} WHERE s.id = $1`, [id]))[0];

exports.crear = async ({ titulo, liga_id, estado, url }) => {
  const [{ id }] = await q(
    'INSERT INTO streams (titulo, liga_id, estado, url) VALUES ($1,$2,$3,$4) RETURNING id',
    [titulo, liga_id, estado, url]);
  return exports.obtener(id);
};

exports.actualizar = async (id, { titulo, liga_id, estado, url }) => {
  const rows = await q(
    'UPDATE streams SET titulo=$1, liga_id=$2, estado=$3, url=$4 WHERE id=$5 RETURNING id',
    [titulo, liga_id, estado, url, id]);
  return rows[0] && exports.obtener(id);
};

exports.eliminar = (id) => q('DELETE FROM streams WHERE id = $1', [id]);
