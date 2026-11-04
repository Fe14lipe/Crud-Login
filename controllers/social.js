// CONTROLLER: perfil, publicaciones, me gusta, comentarios y seguir equipos
const Social = require('../models/social');

const idValido = (v) => (/^\d+$/.test(String(v)) ? Number(v) : null);
const texto = (v, max) => { const t = String(v ?? '').trim(); return t && t.length <= max ? t : null; };

const fkError = (res, e) => {
  if (e.code === '23503') return res.status(404).json({ error: 'No existe' });
  throw e;
};

exports.yo = async (req, res) => res.json({ usuario: req.session.user, ...(await Social.resumen(req.session.user)) });

exports.publicaciones = async (req, res) => res.json(await Social.publicaciones(req.session.user));

exports.publicar = async (req, res) => {
  const t = texto(req.body.texto, 500);
  if (!t) return res.status(400).json({ error: 'Escribe algo (máximo 500 caracteres)' });
  res.status(201).json(await Social.crearPublicacion(req.session.user, t));
};

exports.borrar = async (req, res) => {
  const id = idValido(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  const borradas = await Social.borrarPublicacion(id, req.session.user);
  borradas.length ? res.json({ ok: true }) : res.status(403).json({ error: 'Solo puedes borrar tus publicaciones' });
};

exports.like = async (req, res) => {
  const id = idValido(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  try { await Social.alternarLike(req.session.user, id); res.json({ ok: true }); } catch (e) { fkError(res, e); }
};

exports.comentarios = async (req, res) => {
  const id = idValido(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  res.json(await Social.comentarios(id));
};

exports.comentar = async (req, res) => {
  const id = idValido(req.params.id);
  const t = texto(req.body.texto, 300);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  if (!t) return res.status(400).json({ error: 'Escribe un comentario (máximo 300 caracteres)' });
  try { await Social.crearComentario(id, req.session.user, t); res.status(201).json({ ok: true }); } catch (e) { fkError(res, e); }
};

exports.equipos = async (req, res) => res.json(await Social.equipos(req.session.user));

exports.seguir = async (req, res) => {
  const id = idValido(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  try { await Social.alternarSeguir(req.session.user, id); res.json({ ok: true }); } catch (e) { fkError(res, e); }
};
