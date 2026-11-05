-- Generado por scripts/scrape-liga.js desde https://pomasqui.sadcaftorneos.com/maxima (2026-11-05)
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
  ('11 05 Olmedo', 'OLM', '2008-05-11', (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui')),
  ('Aston F.C.', 'AST', '2019-01-30', (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui')),
  ('Atlético Boca Junior', 'ABJ', '2003-07-29', (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui')),
  ('C.D. Family', 'CDF', '2011-09-11', (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui')),
  ('C.D. Vasco', 'CDV', '2023-03-30', (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui')),
  ('F.C. Old Soccer', 'FOS', '2016-10-11', (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui')),
  ('Independiente Junior SL', 'IJR', '2001-08-05', (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui')),
  ('Inter Lunas', 'ILC', '2016-03-01', (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui')),
  ('La Florida', 'LFR', '2011-02-01', (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui')),
  ('Manabí F.C.', 'MFC', '2025-03-23', (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui')),
  ('Santos S.P', 'SSP', '2012-11-01', (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui')),
  ('Técnico Santa Rosa', 'TSR', '1979-06-08', (SELECT id FROM ligas WHERE nombre = 'Liga Deportiva Barrial Pomasqui'));

-- Equipos de la LigaPro Serie A 2026 (para que el desplegable País > Liga > Equipo funcione también ahí)
INSERT INTO equipos (nombre, sigla, fundado, liga_id) VALUES
  ('Aucas', 'AUC', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Barcelona SC', 'BSC', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Delfín SC', 'DEL', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Deportivo Cuenca', 'CUE', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Emelec', 'EME', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Guayaquil City', 'GCY', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Independiente del Valle', 'IDV', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Leones FC', 'LEO', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('LDU Quito', 'LDU', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Macará', 'MAC', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Manta FC', 'MAN', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Libertad', 'LIB', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Mushuc Runa', 'MUS', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Orense SC', 'ORE', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Técnico Universitario', 'TEC', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro')),
  ('Universidad Católica', 'UCA', NULL, (SELECT id FROM ligas WHERE nombre = 'LigaPro'));

INSERT INTO posiciones (equipo_id, etapa, pj, pg, pe, pp, gf, gc, pts) VALUES
  ((SELECT id FROM equipos WHERE nombre = 'Aston F.C.'), 'Segunda Etapa', 7, 6, 0, 1, 28, 15, 18),
  ((SELECT id FROM equipos WHERE nombre = 'Manabí F.C.'), 'Segunda Etapa', 7, 5, 1, 1, 30, 14, 16),
  ((SELECT id FROM equipos WHERE nombre = '11 05 Olmedo'), 'Segunda Etapa', 7, 5, 0, 2, 37, 29, 15),
  ((SELECT id FROM equipos WHERE nombre = 'F.C. Old Soccer'), 'Segunda Etapa', 6, 4, 1, 1, 21, 9, 13),
  ((SELECT id FROM equipos WHERE nombre = 'Técnico Santa Rosa'), 'Segunda Etapa', 6, 4, 0, 2, 31, 22, 12),
  ((SELECT id FROM equipos WHERE nombre = 'Inter Lunas'), 'Segunda Etapa', 7, 3, 1, 3, 21, 22, 10),
  ((SELECT id FROM equipos WHERE nombre = 'C.D. Vasco'), 'Segunda Etapa', 6, 3, 1, 2, 11, 12, 10),
  ((SELECT id FROM equipos WHERE nombre = 'Independiente Junior SL'), 'Segunda Etapa', 6, 2, 1, 3, 24, 31, 7),
  ((SELECT id FROM equipos WHERE nombre = 'Santos S.P'), 'Segunda Etapa', 7, 2, 0, 5, 22, 32, 6),
  ((SELECT id FROM equipos WHERE nombre = 'La Florida'), 'Segunda Etapa', 7, 1, 1, 5, 22, 39, 4),
  ((SELECT id FROM equipos WHERE nombre = 'Atlético Boca Junior'), 'Segunda Etapa', 7, 1, 0, 6, 22, 27, 3),
  ((SELECT id FROM equipos WHERE nombre = 'C.D. Family'), 'Segunda Etapa', 5, 0, 0, 5, 25, 42, 0),
  ((SELECT id FROM equipos WHERE nombre = 'Manabí F.C.'), 'Primera Etapa', 11, 8, 1, 2, 68, 34, 25),
  ((SELECT id FROM equipos WHERE nombre = '11 05 Olmedo'), 'Primera Etapa', 11, 8, 0, 3, 72, 35, 24),
  ((SELECT id FROM equipos WHERE nombre = 'F.C. Old Soccer'), 'Primera Etapa', 11, 8, 0, 3, 52, 17, 24),
  ((SELECT id FROM equipos WHERE nombre = 'Independiente Junior SL'), 'Primera Etapa', 11, 8, 0, 3, 58, 38, 24),
  ((SELECT id FROM equipos WHERE nombre = 'Inter Lunas'), 'Primera Etapa', 11, 6, 2, 3, 44, 23, 20),
  ((SELECT id FROM equipos WHERE nombre = 'Técnico Santa Rosa'), 'Primera Etapa', 11, 6, 1, 4, 45, 27, 19),
  ((SELECT id FROM equipos WHERE nombre = 'Santos S.P'), 'Primera Etapa', 11, 3, 3, 5, 30, 39, 12),
  ((SELECT id FROM equipos WHERE nombre = 'Atlético Boca Junior'), 'Primera Etapa', 11, 3, 1, 7, 32, 63, 10),
  ((SELECT id FROM equipos WHERE nombre = 'La Florida'), 'Primera Etapa', 11, 3, 0, 8, 24, 48, 9),
  ((SELECT id FROM equipos WHERE nombre = 'Aston F.C.'), 'Tabla Acumulada', 18, 6, 0, 1, 86, 40, 46),
  ((SELECT id FROM equipos WHERE nombre = 'Manabí F.C.'), 'Tabla Acumulada', 18, 13, 2, 3, 98, 48, 41),
  ((SELECT id FROM equipos WHERE nombre = '11 05 Olmedo'), 'Tabla Acumulada', 18, 13, 0, 5, 109, 64, 39),
  ((SELECT id FROM equipos WHERE nombre = 'F.C. Old Soccer'), 'Tabla Acumulada', 17, 12, 1, 4, 73, 26, 37),
  ((SELECT id FROM equipos WHERE nombre = 'C.D. Vasco'), 'Tabla Acumulada', 17, 3, 1, 2, 55, 25, 35),
  ((SELECT id FROM equipos WHERE nombre = 'Técnico Santa Rosa'), 'Tabla Acumulada', 17, 10, 1, 6, 76, 49, 31),
  ((SELECT id FROM equipos WHERE nombre = 'Independiente Junior SL'), 'Tabla Acumulada', 17, 10, 1, 6, 82, 69, 31),
  ((SELECT id FROM equipos WHERE nombre = 'Inter Lunas'), 'Tabla Acumulada', 18, 9, 3, 6, 65, 45, 30),
  ((SELECT id FROM equipos WHERE nombre = 'Santos S.P'), 'Tabla Acumulada', 18, 5, 3, 10, 52, 71, 18),
  ((SELECT id FROM equipos WHERE nombre = 'Atlético Boca Junior'), 'Tabla Acumulada', 18, 4, 1, 13, 54, 90, 13),
  ((SELECT id FROM equipos WHERE nombre = 'La Florida'), 'Tabla Acumulada', 18, 4, 1, 13, 46, 87, 13);

INSERT INTO goleadores (codigo, nombre, equipo_id, goles) VALUES
  (1922, 'Roque Marquez', (SELECT id FROM equipos WHERE nombre = 'Manabí F.C.'), 35),
  (2305, 'Joel Pumisacho', (SELECT id FROM equipos WHERE nombre = '11 05 Olmedo'), 23),
  (1905, 'Miller Sabando', (SELECT id FROM equipos WHERE nombre = 'Manabí F.C.'), 19),
  (2309, 'Esteban Carrera', (SELECT id FROM equipos WHERE nombre = '11 05 Olmedo'), 18),
  (2328, 'Jason Torres', (SELECT id FROM equipos WHERE nombre = '11 05 Olmedo'), 18),
  (2408, 'Edelberto Ayovi', (SELECT id FROM equipos WHERE nombre = 'F.C. Old Soccer'), 17),
  (3111, 'Geordy Caiza', (SELECT id FROM equipos WHERE nombre = 'Técnico Santa Rosa'), 16),
  (3105, 'Deyvith Minango', (SELECT id FROM equipos WHERE nombre = 'Técnico Santa Rosa'), 15),
  (1519, 'Isaac Tomsich', (SELECT id FROM equipos WHERE nombre = 'Inter Lunas'), 15),
  (1020, 'Eduardo Cevallos', (SELECT id FROM equipos WHERE nombre = 'C.D. Family'), 15),
  (1428, 'Jhonn Vasquez', (SELECT id FROM equipos WHERE nombre = 'Independiente Junior SL'), 12),
  (2425, 'Jose Rosero', (SELECT id FROM equipos WHERE nombre = 'F.C. Old Soccer'), 12),
  (1013, 'Jefferson Carcelen', (SELECT id FROM equipos WHERE nombre = 'C.D. Family'), 12),
  (417, 'Raul Guerron', (SELECT id FROM equipos WHERE nombre = 'Aston F.C.'), 12),
  (824, 'Jefferson Flores', (SELECT id FROM equipos WHERE nombre = 'Atlético Boca Junior'), 11),
  (1923, 'Aldo Vera', (SELECT id FROM equipos WHERE nombre = 'Manabí F.C.'), 10),
  (1512, 'Esteban Pantoja', (SELECT id FROM equipos WHERE nombre = 'Inter Lunas'), 10),
  (1424, 'Hamilton Chancay', (SELECT id FROM equipos WHERE nombre = 'Independiente Junior SL'), 10),
  (1007, 'Maury Panchez', (SELECT id FROM equipos WHERE nombre = 'C.D. Family'), 10);
