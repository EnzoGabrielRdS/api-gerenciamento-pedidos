const { createApp } = require('./app');

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT deve ser um inteiro entre 1 e 65535.');
}

const server = createApp().listen(port, '127.0.0.1', () => {
  console.log('API de pedidos em http://localhost:' + port);
});

server.on('error', (error) => {
  console.error('Não foi possível iniciar a API: ' + error.message);
  process.exitCode = 1;
});
