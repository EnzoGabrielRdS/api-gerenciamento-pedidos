# API de gerenciamento de pedidos

CONTRIBUIDORES DO PROJETO : 

ENZO GABRIEL RODRIGUES DA SILVA COSTA [ RA : 43045774 ] 
MATHEUS GABRIEL FERREIRA SILVA  [ RA : 43040624 ] 
ROGER CARLOS DE ANDRADE [ RA : 42819911 ] 
CAIO VENTURA SANTANA [ RA : 43617883 ] 
MATHEUS DA SILVA PALMEIRA [ RA : 42206723 ] 

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



O padrão é **arquitetura em camadas**, com um **Repository** simples para isolar a memória das regras de negócio.
Fluxo: rota -> controller -> service -> repository; erros seguem para o middleware.
Não há camada de views porque a API responde JSON.

Controllers não decidem regras de status. Services não usam req ou res.
O repository não conhece HTTP e devolve cópias dos dados para evitar alterações acidentais por referência.
Factories criam uma memória independente por instância e permitem injetar um repository nos testes.
As operações são síncronas; erros lançados são capturados pelo Express e chegam ao middleware.

## Testes

Importe postman/api-pedidos.postman_collection.json no Postman.
A variável da coleção baseUrl já aponta para http://localhost:3000.
Execute os itens na ordem indicada. A criação salva automaticamente pedidoId na coleção para consulta e atualização.
Cada execução da criação gera um novo pedido; o ID das capturas depende do estado da memória.
A coleção contém verificações de código HTTP e conteúdo, além de cenários extras.

O roteiro das cinco capturas obrigatórias está em [evidencias/README.md](evidencias/README.md).
As capturas complementam os testes; o comportamento é verificável com entradas diferentes.

## Git e GitHub

Repositório da atividade: https://github.com/EnzoGabrielRdS/api-gerenciamento-pedidos

Para obter o projeto com o histórico:

~~~sh
git clone https://github.com/EnzoGabrielRdS/api-gerenciamento-pedidos.git
cd api-gerenciamento-pedidos
npm install
npm test
npm start
~~~

O histórico registra etapas reais de implementação, testes, documentação e evidências.
Não houve retrodatação de commits. Consulte git log --oneline para inspecioná-los.
As pastas node_modules e coverage, arquivos .env e logs são ignorados. Nenhuma credencial faz parte do projeto.

A alternativa em ZIP inclui a pasta oculta .git; mantenha essa pasta ao extrair para preservar o histórico.
O RA será preenchido pelo aluno posteriormente. Confira docs/ENTREGA.md antes de submeter o trabalho.
