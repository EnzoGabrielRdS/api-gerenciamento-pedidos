const { AppError } = require('../errors/AppError');

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof AppError) {
    return res.status(error.status).json({ erro: error.message });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'Corpo da requisição excede o limite de 16 KB.' });
  }
  console.error(error);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = { errorHandler };
