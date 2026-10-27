const express = require('express');
const { createPedidosRepository } = require('./repositories/pedidosRepository');
const { createPedidosService } = require('./services/pedidosService');
const { createPedidosRouter } = require('./routes/pedidosRoutes');
const { AppError } = require('./errors/AppError');
const { errorHandler } = require('./middlewares/errorHandler');

function createApp({ repository = createPedidosRepository() } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.use('/pedidos', createPedidosRouter(createPedidosService(repository)));
  app.use((req, res, next) => next(new AppError(404, 'Rota não encontrada.')));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
