-- Migración para bases YA creadas (ej. Render): deja solo Ecuador con LigaPro (16 equipos de la Serie A 2026)
-- y la Liga Barrial de Pomasqui. No borra jugadores, publicaciones ni datos de la liga barrial.
-- Se puede ejecutar más de una vez.

-- 1) Asegurar Ecuador y LigaPro
INSERT INTO paises (nombre) VALUES ('Ecuador') ON CONFLICT DO NOTHING;
INSERT INTO ligas (nombre, pais_id) SELECT 'LigaPro', id FROM paises WHERE nombre = 'Ecuador' ON CONFLICT DO NOTHING;

-- 2) Limpiar los equipos de ejemplo de la versión anterior
UPDATE equipos SET nombre = 'LDU Quito' WHERE nombre = 'Liga de Quito';
DELETE FROM equipos e WHERE e.nombre = 'El Nacional' AND NOT EXISTS (SELECT 1 FROM jugadores j WHERE j.equipo_id = e.id);

-- 3) Los 16 equipos de la LigaPro Serie A 2026
INSERT INTO equipos (nombre, sigla, fundado, liga_id)
SELECT v.nombre, v.sigla, NULL, l.id
FROM (VALUES ('Aucas', 'AUC'), ('Barcelona SC', 'BSC'), ('Delfín SC', 'DEL'), ('Deportivo Cuenca', 'CUE'),
             ('Emelec', 'EME'), ('Guayaquil City', 'GCY'), ('Independiente del Valle', 'IDV'), ('Leones FC', 'LEO'),
             ('LDU Quito', 'LDU'), ('Macará', 'MAC'), ('Manta FC', 'MAN'), ('Libertad', 'LIB'),
             ('Mushuc Runa', 'MUS'), ('Orense SC', 'ORE'), ('Técnico Universitario', 'TEC'),
             ('Universidad Católica', 'UCA')) AS v(nombre, sigla),
     ligas l WHERE l.nombre = 'LigaPro'
ON CONFLICT (nombre) DO NOTHING;

-- 4) Streams: quitar los de ejemplo de otros países y poner unos de Ecuador
DELETE FROM streams WHERE url IN ('https://stream.example.com/clasico', 'https://stream.example.com/liverpool-city');
UPDATE streams SET titulo = 'LDU Quito vs Independiente del Valle' WHERE url = 'https://stream.example.com/ldu-idv';
INSERT INTO streams (titulo, liga_id, estado, url)
SELECT t.titulo, l.id, t.estado, t.url
FROM (VALUES ('Barcelona SC vs Emelec', 'EN VIVO', 'https://stream.example.com/clasico-del-astillero'),
             ('LDU Quito vs Independiente del Valle', 'PRÓXIMO', 'https://stream.example.com/ldu-idv')) AS t(titulo, estado, url),
     ligas l WHERE l.nombre = 'LigaPro'
ON CONFLICT (url) DO NOTHING;

-- 4b) Si quedó algún stream en otra liga, pasarlo a LigaPro
UPDATE streams SET liga_id = (SELECT id FROM ligas WHERE nombre = 'LigaPro')
WHERE liga_id NOT IN (SELECT id FROM ligas WHERE nombre IN ('LigaPro', 'Liga Deportiva Barrial Pomasqui'));

-- 5) Borrar las demás ligas y países
DELETE FROM ligas WHERE nombre NOT IN ('LigaPro', 'Liga Deportiva Barrial Pomasqui');
DELETE FROM paises WHERE nombre <> 'Ecuador';
