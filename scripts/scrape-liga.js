// Descarga equipos, posiciones y goleadores de la Liga Barrial de Pomasqui (categoría MAXIMA)
// y genera db/liga.sql. Uso: node scripts/scrape-liga.js
const fs = require('fs');
const path = require('path');

const BASE = 'https://pomasqui.sadcaftorneos.com/maxima';
const MESES = { Enero: 1, Febrero: 2, Marzo: 3, Abril: 4, Mayo: 5, Junio: 6, Julio: 7, Agosto: 8, Septiembre: 9, Octubre: 10, Noviembre: 11, Diciembre: 12 };

// HTML -> texto plano separado por "|"
const texto = (html) => html
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, '|')
  .replace(/&ordm;/g, 'º').replace(/&amp;/g, '&').replace(/&#\d+;/g, '')
  .replace(/\s+/g, ' ').replace(/(\s*\|\s*)+/g, '|');

const bajar = async (p) => {
  const r = await fetch(`${BASE}/${p}`);
  if (!r.ok) throw new Error(`${p}: HTTP ${r.status}`);
  return texto(await r.text());
};
const q = (s) => `'${String(s).replace(/'/g, "''")}'`; // escapa comillas para SQL

(async () => {
  // Equipos: "Nombre|SIGLA|Fundado en Mayo 11, 2008"
  const eq = await bajar('equipos');
  const equipos = [...eq.matchAll(/\|([^|]+)\|([A-Z]{2,4})\|Fundado en (\w+) (\d+), (\d{4})/g)]
    .map(([, nombre, sigla, mes, dia, anio]) => ({ nombre, sigla, fundado: `${anio}-${String(MESES[mes]).padStart(2, '0')}-${dia.padStart(2, '0')}` }));

  // Posiciones: dos tablas (Segunda y Primera etapa) con 10 columnas numéricas por equipo
  const pos = await bajar('tabla-posiciones');
  const filas = [];
  const ETAPAS = ['Segunda Etapa', 'Primera Etapa', 'Tabla Acumulada'];
  ETAPAS.forEach((etapa, i) => {
    const ini = pos.indexOf(etapa);
    if (ini < 0) throw new Error(`No se encontró "${etapa}" (¿cambió el sitio?)`);
    const fin = i + 1 < ETAPAS.length ? pos.indexOf(ETAPAS[i + 1]) : pos.length; // cada tabla termina donde empieza la siguiente
    for (const m of pos.slice(ini, fin).matchAll(/\|(\d+)\|([^|]*[A-Za-zÀ-ÿ][^|]*)\|(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d+)\|(-?\d+)\|(\d+)(?=\|)/g)) {
      const [, , nombre, pj, pg, pe, pp, gf, gc, , , pts] = m;
      filas.push({ etapa, nombre, pj, pg, pe, pp, gf, gc, pts });
    }
  });

  // Goleadores: "Nº1|Equipo|Cod. 1922|Nombre |*FOR|35|goles"
  const gol = await bajar('goleadores');
  const goleadores = [...gol.matchAll(/Nº\d+\|([^|]+)\|Cod\. (\d+)\|([^|]+)\|(?:\*FOR\|)?(\d+)\|goles/g)]
    .map(([, equipo, codigo, nombre, goles]) => ({ equipo, codigo, nombre, goles }));

  if (equipos.length < 10 || filas.length < 20 || goleadores.length < 15) {
    throw new Error(`Parseo incompleto: ${equipos.length} equipos, ${filas.length} filas, ${goleadores.length} goleadores (¿cambió el sitio?)`);
  }
  // Equipos que ya no están en la categoría (p. ej. de la primera etapa) se omiten
  const nombres = new Set(equipos.map((e) => e.nombre));
  const omitidos = new Set();
  const ok = (n) => nombres.has(n) || (omitidos.add(n), false);
  const posiciones = filas.filter((f) => ok(f.nombre));
  const goleadoresOk = goleadores.filter((g) => ok(g.equipo));
  if (omitidos.size) console.warn('Omitidos (no están en equipos aprobados):', [...omitidos].join(', '));

  const eid = (n) => `(SELECT id FROM equipos WHERE nombre = ${q(n)})`;
  const sql = `-- Generado por scripts/scrape-liga.js desde ${BASE} (${new Date().toISOString().slice(0, 10)})
-- Ejecutar DESPUÉS de db/schema.sql

DROP TABLE IF EXISTS goleadores, posiciones, equipos CASCADE;

CREATE TABLE equipos (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(80) NOT NULL UNIQUE,
  sigla   VARCHAR(4)  NOT NULL,
  fundado DATE,
  liga_id INT NOT NULL REFERENCES ligas(id)
);

CREATE TABLE posiciones (
  equipo_id INT NOT NULL REFERENCES equipos(id),
  etapa     VARCHAR(20) NOT NULL,
  pj INT NOT NULL, pg INT NOT NULL, pe INT NOT NULL, pp INT NOT NULL,
  gf INT NOT NULL, gc INT NOT NULL, pts INT NOT NULL,
  PRIMARY KEY (equipo_id, etapa)
);

CREATE TABLE goleadores (
  codigo    INT PRIMARY KEY,
  nombre    VARCHAR(80) NOT NULL,
  equipo_id INT NOT NULL REFERENCES equipos(id),
  goles     INT NOT NULL
);

INSERT INTO ligas (nombre, pais_id) VALUES ('Liga Deportiva Barrial Pomasqui', (SELECT id FROM paises WHERE nombre = 'Ecuador'))
  ON CONFLICT DO NOTHING;

INSERT INTO equipos (nombre, sigla, fundado, liga_id) VALUES
${equipos.map((e) => `  (${q(e.nombre)}, ${q(e.sigla)}, ${q(e.fundado)}, (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui'))`).join(',\n')};

INSERT INTO posiciones (equipo_id, etapa, pj, pg, pe, pp, gf, gc, pts) VALUES
${posiciones.map((f) => `  (${eid(f.nombre)}, ${q(f.etapa)}, ${f.pj}, ${f.pg}, ${f.pe}, ${f.pp}, ${f.gf}, ${f.gc}, ${f.pts})`).join(',\n')};

INSERT INTO goleadores (codigo, nombre, equipo_id, goles) VALUES
${goleadoresOk.map((g) => `  (${g.codigo}, ${q(g.nombre)}, ${eid(g.equipo)}, ${g.goles})`).join(',\n')};
`;
  fs.writeFileSync(path.join(__dirname, '..', 'db', 'liga.sql'), sql);
  console.log(`OK: ${equipos.length} equipos, ${posiciones.length} filas de posiciones, ${goleadoresOk.length} goleadores -> db/liga.sql`);
})().catch((e) => { console.error(e.message); process.exit(1); });
