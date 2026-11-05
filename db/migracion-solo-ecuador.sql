-- Migración para bases YA creadas (ej. Render): deja solo Ecuador con LigaPro y la Liga Barrial de Pomasqui.
-- No borra jugadores, publicaciones ni datos de la liga. Se puede ejecutar más de una vez.

-- 1) Asegurar Ecuador y LigaPro
INSERT INTO paises (nombre) VALUES ('Ecuador') ON CONFLICT DO NOTHING;
INSERT INTO ligas (nombre, pais_id) SELECT 'LigaPro', id FROM paises WHERE nombre = 'Ecuador' ON CONFLICT DO NOTHING;

-- 2) Equipos de ejemplo de LigaPro
INSERT INTO equipos (nombre, sigla, fundado, liga_id)
SELECT v.nombre, v.sigla, NULL, l.id
FROM (VALUES ('Barcelona SC', 'BSC'), ('Emelec', 'EME'), ('Liga de Quito', 'LDU'),
             ('Independiente del Valle', 'IDV'), ('El Nacional', 'ELN'), ('Aucas', 'AUC')) AS v(nombre, sigla),
     ligas l WHERE l.nombre = 'LigaPro'
ON CONFLICT (nombre) DO NOTHING;

-- 3) Streams: quitar los de ejemplo de otros países y poner unos de Ecuador
DELETE FROM streams WHERE url IN ('https://stream.example.com/clasico', 'https://stream.example.com/liverpool-city');
INSERT INTO streams (titulo, liga_id, estado, url)
SELECT t.titulo, l.id, t.estado, t.url
FROM (VALUES ('Barcelona SC vs Emelec', 'EN VIVO', 'https://stream.example.com/clasico-del-astillero'),
             ('Liga de Quito vs Independiente del Valle', 'PRÓXIMO', 'https://stream.example.com/ldu-idv')) AS t(titulo, estado, url),
     ligas l WHERE l.nombre = 'LigaPro'
ON CONFLICT (url) DO NOTHING;

-- 3b) Si quedó algún stream en otra liga, pasarlo a LigaPro
UPDATE streams SET liga_id = (SELECT id FROM ligas WHERE nombre = 'LigaPro')
WHERE liga_id NOT IN (SELECT id FROM ligas WHERE nombre IN ('LigaPro', 'Liga Deportiva Barrial Pomasqui'));

-- 4) Borrar las demás ligas y países
DELETE FROM ligas WHERE nombre NOT IN ('LigaPro', 'Liga Deportiva Barrial Pomasqui');
DELETE FROM paises WHERE nombre <> 'Ecuador';
