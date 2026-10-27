# API de gerenciamento de pedidos

API REST acadêmica em JavaScript, Node.js e Express, com arquitetura em camadas e armazenamento em memória.

## Instalação e execução

Requisito: Node.js 22 ou superior (validado com Node.js 24). Na pasta do projeto:

~~~sh
npm install
npm start
~~~

Base: http://localhost:3000. Mantenha o terminal aberto durante os testes no Postman.
O servidor aceita conexões locais. A porta pode ser configurada pela variável de ambiente PORT.
No PowerShell: defina $env:PORT=3001 antes de executar npm start.
O comando npm run dev reinicia o servidor quando um arquivo é alterado.

**Os pedidos são apagados ao reiniciar o servidor.** Cada execução começa vazia, com ID 1.
Não há banco de dados ou autenticação.

## Rotas

| Método | Rota | Resultado |
| --- | --- | --- |
| POST | /pedidos | 201 com o pedido criado e cabeçalho Location |
| GET | /pedidos | 200 com array; vazio é [] |
| GET | /pedidos/:id | 200 com pedido; 404 se não existir |
| PATCH | /pedidos/:id/status | 200 com pedido atualizado; 400 para status/transição inválidos; 404 se não existir |

Corpos de POST e PATCH devem usar Content-Type: application/json.
Erros são JSON, por exemplo: {"erro":"Pedido não encontrado."}.

### Cadastrar um pedido

~~~http
POST /pedidos
Content-Type: application/json

{
  "cliente": "Carlos Silva",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "normal"
}
~~~

Resposta 201:

~~~json
{
  "id": 1,
  "cliente": "Carlos Silva",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "normal",
  "status": "recebido"
}
~~~

### Atualizar status

~~~http
PATCH /pedidos/1/status
Content-Type: application/json

{"status":"cancelado"}
~~~

Resposta 200: o pedido completo, agora com status cancelado.

### Validações e decisões

- Cliente: texto obrigatório, não vazio após trim(). Espaços nas extremidades são removidos.
- Valor: número JSON finito maior que zero. Texto numérico, null, booleanos e valores negativos são rejeitados. Não há conversão automática de tipos ou arredondamento.
- Tipo: exatamente entrega ou retirada.
- Prioridade: exatamente normal ou alta; não altera a ordem da listagem.
- Valores enumerados diferenciam maiúsculas/minúsculas e não têm espaços removidos.
- ID: inteiro positivo seguro, em formato decimal sem zeros à esquerda. abc, 0, -1, 1.5 e 01 dão 400; um ID válido sem pedido correspondente dá 404.
- ID e status inicial são definidos pelo servidor. Campos extras na criação são ignorados, inclusive id e status.
- No PATCH, somente status é considerado; não é possível trocar cliente ou valor.
- No PATCH, o ID e a existência são verificados antes do corpo. ID inexistente com corpo semanticamente inválido dá 404. JSON malformado é detectado antes das rotas e dá 400.
- Corpo ausente, array, JSON malformado ou campos inválidos dão 400 com mensagem explicativa.
- Limite do corpo: 16 KB. Excedê-lo dá 413.
- Rota desconhecida dá 404 em JSON.
- Erro inesperado dá 500 com mensagem genérica; detalhes são registrados no servidor.

### Transições de status

| Estado atual | Próximos estados permitidos |
| --- | --- |
| recebido | em_preparacao, cancelado |
| em_preparacao | enviado, cancelado |
| enviado | entregue |
| entregue | nenhum estado diferente |
| cancelado | nenhum estado diferente |

Reenviar o estado atual é permitido e retorna 200 sem alteração (idempotência).
Não é permitido pular etapas, voltar etapas, cancelar após envio ou reabrir pedidos finalizados.
A mesma sequência se aplica a entrega e retirada: neste projeto, enviado significa disponibilizado/encaminhado para o cliente, inclusive na retirada. Essa simplificação mantém um fluxo único e explícito.

## Arquitetura e padrão implementado

~~~text
src/
  app.js                         composição da aplicação; não abre porta
  server.js                      configuração da porta e inicialização
  routes/pedidosRoutes.js        métodos e caminhos HTTP
  controllers/pedidosController.js leitura da requisição e resposta HTTP
  services/pedidosService.js     validação e regras de negócio
  repositories/pedidosRepository.js armazenamento em memória
  errors/AppError.js             erro esperado com status HTTP
  middlewares/errorHandler.js    tradução centralizada dos erros para JSON
tests/                           testes de integração e de domínio
postman/                         coleção importável
evidencias/                      capturas reais do Postman
docs/                            roteiro de estudo e entrega
~~~

O padrão é **arquitetura em camadas**, com um **Repository** simples para isolar a memória das regras de negócio.
Fluxo: rota -> controller -> service -> repository; erros seguem para o middleware.
Não há camada de views porque a API responde JSON.

Controllers não decidem regras de status. Services não usam req ou res.
O repository não conhece HTTP e devolve cópias dos dados para evitar alterações acidentais por referência.
Factories criam uma memória independente por instância e permitem injetar um repository nos testes.
As operações são síncronas; erros lançados são capturados pelo Express e chegam ao middleware.

## Testes automatizados

~~~sh
npm test
npm run test:coverage
~~~

Jest executa os testes; Supertest envia requisições à aplicação Express sem exigir servidor na porta 3000.
Resultado verificado nesta entrega: **75 testes aprovados**, em duas suítes.
Cobrem criação, consulta, listagem, IDs, corpos inválidos, todas as 25 combinações de status, repetição de status, preservação de dados após erro, isolamento de memória e resposta 500.

A cobertura medida foi 100% das linhas, funções, instruções e ramificações dos arquivos incluídos.
O arquivo server.js é excluído da cobertura, pois apenas abre a porta; sua inicialização também foi conferida com npm start.
Cobertura é uma medida auxiliar e não garante ausência de defeitos.
O relatório HTML é gerado em coverage/lcov-report/index.html, ignorado pelo Git.

## Testes manuais e evidências

Importe postman/api-pedidos.postman_collection.json no Postman.
A variável da coleção baseUrl já aponta para http://localhost:3000.
Execute os itens na ordem indicada. A criação salva automaticamente pedidoId na coleção para consulta e atualização.
Cada execução da criação gera um novo pedido; o ID das capturas depende do estado da memória.
A coleção contém verificações de código HTTP e conteúdo, além de cenários extras.

O roteiro das cinco capturas obrigatórias está em [evidencias/README.md](evidencias/README.md).
As capturas complementam os testes; o comportamento é verificável com entradas diferentes.

## Git e GitHub

O histórico local registra etapas reais de implementação, testes, documentação e evidências.
Não houve retrodatação de commits. Consulte git log --oneline para inspecioná-los.

Para publicar em um repositório vazio criado na conta do aluno:

~~~sh
git remote add origin https://github.com/SEU_USUARIO/api-pedidos.git
git push -u origin main
~~~

Se já existir um remote origin, confira git remote -v antes de alterá-lo.
O arquivo ZIP da entrega inclui a pasta oculta .git; extraia o ZIP mantendo essa pasta para preservar o histórico.
As pastas node_modules e coverage, arquivos .env e logs são ignorados. Nenhuma credencial faz parte do projeto.
Antes de entregar, informe o RA e o link real do repositório conforme o roteiro em docs/ENTREGA.md.

## Uso de IA

Foi utilizado o Codex, da OpenAI, para apoiar a interpretação do enunciado, implementação, testes automatizados, documentação e operação do Postman para as evidências.

Uma sugestão aceita foi separar app.js de server.js: isso permite testar as rotas sem iniciar uma porta fixa.
Outra sugestão foi modificada: em vez de aceitar qualquer troca para um status conhecido, foi adotada uma tabela explícita de transições. Isso impede pular de recebido para entregue e impede reabrir pedidos cancelados.
Foi mantida a possibilidade de repetir o estado atual, para que uma repetição da mesma requisição não produza erro.
Os testes verificam essas decisões.

Este registro descreve o apoio de IA. Cabe ao aluno executar, compreender, revisar e justificar a solução. O roteiro em docs/GUIA-DE-ESTUDO.md ajuda na preparação.

## Referências

- [Express: tratamento de erros](https://expressjs.com/en/guide/error-handling/)
- [Jest: introdução](https://jestjs.io/docs/getting-started)
