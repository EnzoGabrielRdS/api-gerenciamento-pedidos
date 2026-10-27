const request = require('supertest');
const { createApp } = require('../src/app');
const { createPedidosRepository } = require('../src/repositories/pedidosRepository');

const valido = { cliente: 'Carlos Silva', tipo: 'entrega', valor: 350, prioridade: 'normal' };
let app;
beforeEach(() => { app = createApp(); });

async function criar(body = valido) {
  return request(app).post('/pedidos').send(body);
}

test('cria pedido, limpa espaços, define status e ignora campos protegidos', async () => {
  const response = await criar({ ...valido, cliente: '  Carlos Silva  ', id: 77, status: 'entregue', extra: true });
  expect(response.status).toBe(201);
  expect(response.headers.location).toBe('/pedidos/1');
  expect(response.body).toEqual({ id: 1, ...valido, status: 'recebido' });
});

test.each([
  ['cliente ausente', { cliente: undefined }],
  ['cliente vazio', { cliente: '' }],
  ['cliente em branco', { cliente: ' \t\n ' }],
  ['cliente numérico', { cliente: 123 }],
  ['valor ausente', { valor: undefined }],
  ['valor zero', { valor: 0 }],
  ['valor negativo', { valor: -0.01 }],
  ['valor como texto', { valor: '350' }],
  ['valor nulo', { valor: null }],
  ['valor booleano', { valor: true }],
  ['tipo desconhecido', { tipo: 'correio' }],
  ['tipo ausente', { tipo: undefined }],
  ['tipo com caixa diferente', { tipo: 'Entrega' }],
  ['prioridade desconhecida', { prioridade: 'urgente' }],
  ['prioridade ausente', { prioridade: undefined }],
])('rejeita %s sem cadastrar', async (label, overrides) => {
  const response = await criar({ ...valido, ...overrides });
  expect(response.status).toBe(400);
  expect(response.body.erro).toEqual(expect.any(String));
  expect((await request(app).get('/pedidos')).body).toEqual([]);
});

test.each(['entrega', 'retirada'])('aceita tipo %s e prioridade alta', async (tipo) => {
  const response = await criar({ ...valido, tipo, prioridade: 'alta', valor: 0.01 });
  expect(response.status).toBe(201);
  expect(response.body).toMatchObject({ tipo, prioridade: 'alta', valor: 0.01 });
});

test('lista vazia e pedidos em ordem de criação com IDs distintos', async () => {
  expect((await request(app).get('/pedidos')).body).toEqual([]);
  await criar();
  await criar({ ...valido, cliente: 'Ana' });
  const response = await request(app).get('/pedidos');
  expect(response.status).toBe(200);
  expect(response.body.map(({ id, cliente }) => ({ id, cliente }))).toEqual([
    { id: 1, cliente: 'Carlos Silva' }, { id: 2, cliente: 'Ana' },
  ]);
});

test('consulta um pedido existente', async () => {
  const created = await criar();
  const response = await request(app).get('/pedidos/1');
  expect(response.status).toBe(200);
  expect(response.body).toEqual(created.body);
});

test.each(['get', 'patch'])('%s devolve 404 para ID inexistente', async (method) => {
  const path = method === 'patch' ? '/pedidos/999/status' : '/pedidos/999';
  const response = await request(app)[method](path).send({ status: 'cancelado' });
  expect(response.status).toBe(404);
  expect(response.body).toEqual({ erro: 'Pedido não encontrado.' });
});

test.each(['abc', '0', '-1', '1.5', '1abc', '01', '9007199254740992'])('ID %s é inválido', async (id) => {
  expect((await request(app).get('/pedidos/' + id)).status).toBe(400);
  expect((await request(app).patch('/pedidos/' + id + '/status').send({ status: 'cancelado' })).status).toBe(400);
});

const estados = ['recebido', 'em_preparacao', 'enviado', 'entregue', 'cancelado'];
const caminhos = {
  recebido: [],
  em_preparacao: ['em_preparacao'],
  enviado: ['em_preparacao', 'enviado'],
  entregue: ['em_preparacao', 'enviado', 'entregue'],
  cancelado: ['cancelado'],
};
const permitidas = {
  recebido: ['recebido', 'em_preparacao', 'cancelado'],
  em_preparacao: ['em_preparacao', 'enviado', 'cancelado'],
  enviado: ['enviado', 'entregue'],
  entregue: ['entregue'],
  cancelado: ['cancelado'],
};

test.each(estados.flatMap((origem) => estados.map((destino) => [origem, destino])))(
  'transição %s -> %s respeita a regra e preserva dados em caso de rejeição',
  async (origem, destino) => {
    await criar();
    for (const status of caminhos[origem]) {
      expect((await request(app).patch('/pedidos/1/status').send({ status })).status).toBe(200);
    }
    const aceita = permitidas[origem].includes(destino);
    const response = await request(app).patch('/pedidos/1/status').send({ status: destino });
    expect(response.status).toBe(aceita ? 200 : 400);
    const saved = await request(app).get('/pedidos/1');
    expect(saved.body).toEqual({ id: 1, ...valido, status: aceita ? destino : origem });
  },
);

test.each([{}, { status: null }, { status: 1 }, { status: '' }, { status: 'pronto' }, { status: '__proto__' }])(
  'rejeita status inválido %j', async (body) => {
    await criar();
    const response = await request(app).patch('/pedidos/1/status').send(body);
    expect(response.status).toBe(400);
    expect(response.body.erro).toEqual(expect.any(String));
  },
);

test.each(['[]', 'null', '"texto"', '123', '{invalido'])('rejeita corpo inválido %s', async (body) => {
  await criar();
  for (const path of ['/pedidos', '/pedidos/1/status']) {
    const method = path.endsWith('status') ? 'patch' : 'post';
    const response = await request(app)[method](path).set('Content-Type', 'application/json').send(body);
    expect(response.status).toBe(400);
    expect(response.body.erro).toEqual(expect.any(String));
  }
});

test('rejeita corpo ausente ou Content-Type incorreto', async () => {
  expect((await request(app).post('/pedidos')).status).toBe(400);
  expect((await request(app).post('/pedidos').type('text').send('qualquer texto')).status).toBe(400);
  await criar();
  expect((await request(app).patch('/pedidos/1/status')).status).toBe(400);
});

test('rejeita corpo acima do limite com 413', async () => {
  const response = await criar({ ...valido, cliente: 'x'.repeat(17000) });
  expect(response.status).toBe(413);
  expect(response.body.erro).toContain('16 KB');
});

test('rota desconhecida retorna erro JSON 404', async () => {
  const response = await request(app).get('/nao-existe');
  expect(response.status).toBe(404);
  expect(response.body).toEqual({ erro: 'Rota não encontrada.' });
});

test('falha inesperada retorna 500 sem revelar detalhes internos', async () => {
  const repository = createPedidosRepository();
  const failure = new Error('segredo interno de armazenamento');
  repository.findAll = () => { throw failure; };
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const response = await request(createApp({ repository })).get('/pedidos');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ erro: 'Erro interno do servidor.' });
    expect(log).toHaveBeenCalledWith(failure);
  } finally {
    log.mockRestore();
  }
});

test('cada instância da aplicação tem armazenamento independente', async () => {
  await criar();
  expect((await request(createApp()).get('/pedidos')).body).toEqual([]);
});
