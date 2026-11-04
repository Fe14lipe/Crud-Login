// MODEL: conexión a PostgreSQL (configurada en .env)
// En producción (Render, Neon...) se usa DATABASE_URL con SSL; en local, las variables DB_*.
const { Pool } = require('pg');

module.exports = new Pool(
  process.env.DATABASE_URL
    // ponytail: sin verificar el certificado (los hosts gratuitos usan certificados propios); con la URL interna de Render no hace falta SSL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'pomasqui_stream',
      },
);
