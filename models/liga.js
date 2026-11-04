// MODEL: datos importados de la Liga Barrial de Pomasqui (ver scripts/scrape-liga.js)
const db = require('./db');

const q = async (sql) => (await db.query(sql)).rows;

exports.posiciones = (etapa) => db.query(
  `SELECT e.nombre, e.sigla, p.pj, p.pg, p.pe, p.pp, p.gf, p.gc, p.gf - p.gc AS dg, p.pts
   FROM posiciones p JOIN equipos e ON e.id = p.equipo_id
   WHERE p.etapa = $1 ORDER BY p.pts DESC, dg DESC, p.gf DESC`, [etapa]).then((r) => r.rows);

exports.goleadores = () => q(
  `SELECT g.codigo, g.nombre, g.goles, e.nombre AS equipo, e.sigla
   FROM goleadores g JOIN equipos e ON e.id = g.equipo_id ORDER BY g.goles DESC, g.nombre`);
