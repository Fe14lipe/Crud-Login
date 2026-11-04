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

INSERT INTO paises (nombre) VALUES ('Ecuador'), ('España'), ('Inglaterra'), ('Argentina');

INSERT INTO ligas (nombre, pais_id) VALUES
  ('LigaPro', 1),
  ('La Liga', 2),
  ('Premier League', 3),
  ('Liga Profesional', 4);

INSERT INTO streams (titulo, liga_id, estado, url) VALUES
  ('Real Madrid vs Barcelona', 2, 'EN VIVO',  'https://stream.example.com/clasico'),
  ('Liverpool vs Man City',    3, 'PRÓXIMO', 'https://stream.example.com/liverpool-city');
