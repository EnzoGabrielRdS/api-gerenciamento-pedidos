const { AppError } = require('../errors/AppError');

const TIPOS = ['entrega', 'retirada'];
const PRIORIDADES = ['normal', 'alta'];
const TRANSICOES = {
  recebido: ['em_preparacao', 'cancelado'],
  em_preparacao: ['enviado', 'cancelado'],
  enviado: ['entregue'],
  entregue: [],
  cancelado: [],
};

function validateObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(400, 'O corpo deve ser um objeto JSON.');
  }
}

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new AppError(400, 'O ID deve ser um inteiro positivo, sem zeros à esquerda.');
  }
  return Number(value);
}

function createPedidosService(repository) {
  function findById(value) {
    const pedido = repository.findById(parseId(value));
    if (!pedido) throw new AppError(404, 'Pedido não encontrado.');
    return pedido;
  }

  return {
    create(body) {
      validateObject(body);
      if (typeof body.cliente !== 'string' || !body.cliente.trim()) {
        throw new AppError(400, 'Cliente deve ser um texto não vazio.');
      }
      if (typeof body.valor !== 'number' || !Number.isFinite(body.valor) || body.valor <= 0) {
        throw new AppError(400, 'Valor deve ser numérico, finito e maior que zero.');
      }
      if (!TIPOS.includes(body.tipo)) {
        throw new AppError(400, 'Tipo deve ser entrega ou retirada.');
      }
      if (!PRIORIDADES.includes(body.prioridade)) {
        throw new AppError(400, 'Prioridade deve ser normal ou alta.');
      }
      return repository.create({
        cliente: body.cliente.trim(),
        tipo: body.tipo,
        valor: body.valor,
        prioridade: body.prioridade,
        status: 'recebido',
      });
    },
    list() {
      return repository.findAll();
    },
    findById,
    updateStatus(value, body) {
      const pedido = findById(value);
      validateObject(body);
      if (typeof body.status !== 'string' || !Object.hasOwn(TRANSICOES, body.status)) {
        throw new AppError(400, 'Status deve ser recebido, em_preparacao, enviado, entregue ou cancelado.');
      }
      // Repetir o estado atual é permitido: a atualização é idempotente.
      if (pedido.status === body.status) return pedido;
      if (!TRANSICOES[pedido.status].includes(body.status)) {
        throw new AppError(400, 'Transição de ' + pedido.status + ' para ' + body.status + ' não permitida.');
      }
      return repository.updateStatus(pedido.id, body.status);
    },
  };
}

module.exports = { createPedidosService };
