const express = require('express');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  return app;
}

module.exports = { createApp };
