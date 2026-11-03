function errorHandler(error, req, res, next) {
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Ya existe un autor con ese email.' });
  }

  if (error.status === 400) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no es JSON válido.' });
  }

  if (error.code === '23503') {
    return res.status(400).json({ error: 'El autor o la publicación indicada no existe.' });
  }

  console.error('Error interno de la API:', error.message);
  return res.status(500).json({ error: 'Error interno del servidor.' });
}

module.exports = errorHandler;
