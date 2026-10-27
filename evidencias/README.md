# Evidências reais do Postman

Capturas obtidas no Postman Desktop contra a API local em http://localhost:3000.
São imagens da interface real, sem respostas simuladas ou montagem de telas.

| Arquivo | Cenário | Código HTTP |
| --- | --- | --- |
| 01-criacao.png | POST /pedidos com cliente Carlos Silva | 201 |
| 02-validacao.png | POST /pedidos com cliente contendo apenas espaços | 400 |
| 03-listagem.png | GET /pedidos | 200 |
| 04-consulta-inexistente.png | GET /pedidos/999999 | 404 |
| 05-atualizacao.png | PATCH /pedidos/1/status com status cancelado | 200 |

O POST de criação foi executado em uma memória inicialmente vazia e gerou o ID 1.
O POST inválido não gerou outro pedido. A listagem foi capturada antes do cancelamento.
A mudança de recebido para cancelado é permitida pela regra documentada.
Os corpos de POST/PATCH, os métodos, as URLs, as respostas e os códigos aparecem nas capturas.

## Reproduzir

1. Execute npm install e npm start na pasta do projeto.
2. Importe a coleção em postman/api-pedidos.postman_collection.json.
3. Execute os cinco primeiros itens em ordem.
4. Nos POST/PATCH, deixe a aba Body da requisição visível junto com Body e código da resposta.
5. Capture a janela com resolução suficiente para ler os dados.

Ao repetir, os IDs podem ser diferentes; a coleção usa o ID devolvido pelo POST.
Os números de tempo e tamanho podem variar entre execuções.
