const { createPedidosRepository } = require('../src/repositories/pedidosRepository');
const { createPedidosService } = require('../src/services/pedidosService');
const { errorHandler } = require('../src/middlewares/errorHandler');

test.each([NaN, Infinity, -Infinity])('service rejeita número não finito %s', (valor) => {
  const service = createPedidosService(createPedidosRepository());
  expect(() => service.create({ cliente: 'Ana', tipo: 'entrega', prioridade: 'normal', valor }))
    .toThrow('Valor deve ser numérico, finito e maior que zero.');
});

test('repository não expõe referências que permitam alterar dados salvos', () => {
  const repository = createPedidosRepository();
  const created = repository.create({ cliente: 'Ana', status: 'recebido' });
  created.cliente = 'Alterado';
  const list = repository.findAll();
  list[0].cliente = 'Alterado';
  const found = repository.findById(1);
  found.cliente = 'Alterado';
  const updated = repository.updateStatus(1, 'cancelado');
  updated.status = 'entregue';
  expect(repository.findById(1)).toEqual({ id: 1, cliente: 'Ana', status: 'cancelado' });
});

test('erro após início da resposta é delegado ao Express', () => {
  const error = new Error('conexão interrompida');
  const next = jest.fn();
  errorHandler(error, {}, { headersSent: true }, next);
  expect(next).toHaveBeenCalledWith(error);
});
