function createPedidosRepository() {
  const pedidos = new Map();
  let nextId = 1;

  return {
    create(data) {
      const pedido = { id: nextId++, ...data };
      pedidos.set(pedido.id, pedido);
      return { ...pedido };
    },
    findAll() {
      return Array.from(pedidos.values(), (pedido) => ({ ...pedido }));
    },
    findById(id) {
      const pedido = pedidos.get(id);
      return pedido ? { ...pedido } : undefined;
    },
    updateStatus(id, status) {
      const pedido = pedidos.get(id);
      pedido.status = status;
      return { ...pedido };
    },
  };
}

module.exports = { createPedidosRepository };
