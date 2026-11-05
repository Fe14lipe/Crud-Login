// Validación de cédula ecuatoriana (persona natural) con el algoritmo módulo 10 oficial.
// Se usa en el BACK-END: el navegador no puede saltarse esta validación.
function cedulaValida(valor) {
  const c = String(valor ?? '').trim();
  if (!/^\d{10}$/.test(c)) return false;
  const provincia = Number(c.slice(0, 2));
  if (provincia < 1 || provincia > 24) return false; // 01-24 provincias (30 = extranjeros, no aplica)
  if (Number(c[2]) > 5) return false; // tercer dígito 0-5 = persona natural
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let p = Number(c[i]) * (i % 2 === 0 ? 2 : 1); // coeficientes 2,1,2,1,2,1,2,1,2
    if (p > 9) p -= 9;
    suma += p;
  }
  return (10 - (suma % 10)) % 10 === Number(c[9]);
}

module.exports = { cedulaValida };

// Comprobación rápida: node controllers/cedula.js
if (require.main === module) {
  const assert = require('assert');
  assert(cedulaValida('1710034065'), 'cédula de ejemplo válida');
  assert(!cedulaValida('1710034066'), 'dígito verificador incorrecto');
  assert(!cedulaValida('171003406'), 'menos de 10 dígitos');
  assert(!cedulaValida('17100340655'), 'más de 10 dígitos');
  assert(!cedulaValida('abcdefghij'), 'no numérica');
  assert(!cedulaValida('9910034065'), 'provincia inexistente');
  assert(!cedulaValida('1790034065'), 'tercer dígito de persona jurídica');
  assert(!cedulaValida(''), 'vacía');
  console.log('cedula.js OK');
}
