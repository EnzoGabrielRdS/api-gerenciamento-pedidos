function createPedidosController(service) {
  return {
    create(req, res) {
      const pedido = service.create(req.body);
      res.status(201).location('/pedidos/' + pedido.id).json(pedido);
    },
    list(req, res) {
      res.status(200).json(service.list());
    },
    findById(req, res) {
      res.status(200).json(service.findById(req.params.id));
    },
    updateStatus(req, res) {
      res.status(200).json(service.updateStatus(req.params.id, req.body));
    },
  };
}

module.exports = { createPedidosController };
