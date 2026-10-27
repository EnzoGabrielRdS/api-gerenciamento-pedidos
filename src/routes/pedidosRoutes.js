const { Router } = require('express');
const { createPedidosController } = require('../controllers/pedidosController');

function createPedidosRouter(service) {
  const router = Router();
  const controller = createPedidosController(service);
  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.findById);
  router.patch('/:id/status', controller.updateStatus);
  return router;
}

module.exports = { createPedidosRouter };
