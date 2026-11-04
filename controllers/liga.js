// CONTROLLER: resumen de la liga (solo lectura)
const Liga = require('../models/liga');

exports.resumen = async (req, res) => {
  const [posiciones, goleadores] = await Promise.all([Liga.posiciones('Segunda Etapa'), Liga.goleadores()]);
  res.json({ posiciones, goleadores });
};
