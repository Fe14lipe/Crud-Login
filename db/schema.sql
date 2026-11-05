-- Ejecutar en pgAdmin 4: Query Tool sobre la base "pomasqui_stream" (F5 para correr todo)
-- Crear la base antes: clic derecho en Databases > Create > Database > "pomasqui_stream"

DROP TABLE IF EXISTS streams, ligas, paises CASCADE;

CREATE TABLE paises (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE ligas (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(80) NOT NULL,
  pais_id INT NOT NULL REFERENCES paises(id),
  UNIQUE (nombre, pais_id)
);

CREATE TABLE streams (
  id         SERIAL PRIMARY KEY,
  titulo     VARCHAR(100) NOT NULL,
  liga_id    INT NOT NULL REFERENCES ligas(id),
  estado     VARCHAR(12) NOT NULL CHECK (estado IN ('EN VIVO', 'PRÓXIMO', 'FINALIZADO')),
  url        VARCHAR(500) NOT NULL UNIQUE, -- dato sensible: enlace de transmisión
  creado_en  TIMESTAMP NOT NULL DEFAULT now()
);

-- Solo Ecuador: LigaPro aquí y la Liga Barrial de Pomasqui en db/liga.sql
INSERT INTO paises (nombre) VALUES ('Ecuador');

INSERT INTO ligas (nombre, pais_id) VALUES ('LigaPro', 1);

INSERT INTO streams (titulo, liga_id, estado, url) VALUES
  ('Barcelona SC vs Emelec',                   1, 'EN VIVO', 'https://stream.example.com/clasico-del-astillero'),
  ('Liga de Quito vs Independiente del Valle', 1, 'PRÓXIMO', 'https://stream.example.com/ldu-idv');
