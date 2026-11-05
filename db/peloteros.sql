-- Parte social y jugadores de Peloteros. Ejecutar DESPUÉS de db/schema.sql y db/liga.sql

DROP TABLE IF EXISTS comentarios, likes, guardados, seguidos, publicaciones, jugadores CASCADE;

CREATE TABLE jugadores (
  id         SERIAL PRIMARY KEY,
  codigo     INT GENERATED ALWAYS AS IDENTITY (START WITH 1000) UNIQUE, -- código autogenerado, no se escribe a mano
  nombre     VARCHAR(80) NOT NULL,
  -- DATO SENSIBLE: la cédula se valida en el back-end (algoritmo módulo 10) antes de grabar.
  -- Es opcional solo para los jugadores de demostración (no se inventan cédulas); la app la exige al crear o editar.
  cedula     VARCHAR(10) UNIQUE CHECK (cedula ~ '^[0-9]{10}$'),
  posicion   VARCHAR(3) NOT NULL CHECK (posicion IN ('POR','DFC','LD','LI','MCD','MC','MCO','ED','EI','DC')),
  edad       INT NOT NULL CHECK (edad BETWEEN 14 AND 60),
  ritmo      INT NOT NULL CHECK (ritmo BETWEEN 1 AND 99),
  tiro       INT NOT NULL CHECK (tiro  BETWEEN 1 AND 99),
  pase       INT NOT NULL CHECK (pase  BETWEEN 1 AND 99),
  equipo_id  INT NOT NULL REFERENCES equipos(id),
  disponible BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE publicaciones (
  id        SERIAL PRIMARY KEY,
  autor     VARCHAR(80) NOT NULL,            -- usuario de la sesión
  equipo_id INT REFERENCES equipos(id),      -- si la publica un club
  texto     VARCHAR(500) NOT NULL,
  -- marcador opcional (resultado real de la liga)
  local_nombre VARCHAR(80), local_goles INT, visita_nombre VARCHAR(80), visita_goles INT, pie VARCHAR(80),
  creado_en TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE likes (
  publicacion_id INT NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  usuario        VARCHAR(80) NOT NULL,
  PRIMARY KEY (publicacion_id, usuario)
);

CREATE TABLE comentarios (
  id             SERIAL PRIMARY KEY,
  publicacion_id INT NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  usuario        VARCHAR(80) NOT NULL,
  texto          VARCHAR(300) NOT NULL,
  creado_en      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE seguidos (
  usuario   VARCHAR(80) NOT NULL,
  equipo_id INT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario, equipo_id)
);

CREATE TABLE guardados (
  usuario    VARCHAR(80) NOT NULL,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario, jugador_id)
);

-- Jugadores de demostración (perfiles y valoraciones ilustrativos, no son personas reales)
INSERT INTO jugadores (nombre, posicion, edad, ritmo, tiro, pase, equipo_id) VALUES
  ('Mateo Ruiz',    'DC', 18, 88, 84, 76, (SELECT id FROM equipos WHERE nombre = 'Aston F.C.')),
  ('Johan Mina',    'EI', 19, 92, 78, 81, (SELECT id FROM equipos WHERE nombre = 'Manabí F.C.')),
  ('Nicolás Vera',  'MC', 17, 78, 75, 89, (SELECT id FROM equipos WHERE nombre = 'F.C. Old Soccer')),
  ('Kevin Ortiz',   'LD', 20, 85, 66, 79, (SELECT id FROM equipos WHERE nombre = 'Inter Lunas')),
  ('Dylan Paredes', 'MCO', 18, 80, 83, 86, (SELECT id FROM equipos WHERE nombre = '11 05 Olmedo')),
  ('Bryan Chiluisa','DFC', 21, 70, 55, 72, (SELECT id FROM equipos WHERE nombre = 'Técnico Santa Rosa'));

-- Publicaciones de clubes con resultados reales (Segunda Etapa, Fecha 7)
INSERT INTO publicaciones (autor, equipo_id, texto, local_nombre, local_goles, visita_nombre, visita_goles, pie, creado_en) VALUES
  ('Manabí F.C.', (SELECT id FROM equipos WHERE nombre = 'Manabí F.C.'),
   'El talento del barrio se demuestra en la cancha. 💚 ¡Tres puntos más y un equipo que no deja de soñar!',
   'Manabí F.C.', 6, 'Atlético Boca Junior', 3, 'Segunda etapa · Fecha 7', now() - interval '2 hours'),
  ('Aston F.C.', (SELECT id FROM equipos WHERE nombre = 'Aston F.C.'),
   'Partidazo de ida y vuelta. Seguimos arriba en la tabla. 🔥',
   'Aston F.C.', 5, 'La Florida', 4, 'Segunda etapa · Fecha 7', now() - interval '5 hours'),
  ('F.C. Old Soccer', (SELECT id FROM equipos WHERE nombre = 'F.C. Old Soccer'),
   'Goleada para cerrar la fecha. ¡Gracias a la hinchada!',
   'F.C. Old Soccer', 7, 'Santos S.P', 1, 'Segunda etapa · Fecha 7', now() - interval '1 day');
