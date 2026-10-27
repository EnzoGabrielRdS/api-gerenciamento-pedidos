# Guia de estudo

Leia os arquivos na sequência: app -> routes -> controllers -> services -> repository -> errorHandler.

## Onde alterar cada responsabilidade

| Pedido de alteração | Arquivo principal |
| --- | --- |
| Adicionar um caminho HTTP | src/routes/pedidosRoutes.js |
| Alterar código HTTP ou cabeçalho de sucesso | src/controllers/pedidosController.js |
| Aceitar nova prioridade ou regra de status | src/services/pedidosService.js |
| Trocar memória por banco | src/repositories/pedidosRepository.js |
| Alterar formato do erro | src/middlewares/errorHandler.js |
| Alterar porta padrão | src/server.js |
| Demonstrar o comportamento | tests/pedidos.api.test.js |

## Perguntas para conferir compreensão

1. Por que valor "350" dá 400? Porque typeof retorna string; a API não converte texto para número.
2. Por que cliente "   " dá 400? trim() remove os espaços e sobra texto vazio.
3. Por que GET /pedidos/1 pode dar 404 depois de reiniciar? A memória foi descartada.
4. Por que enviado -> cancelado dá 400? A tabela de transições só permite enviado -> entregue.
5. Por que cancelado -> cancelado dá 200? Repetir o estado atual é uma operação idempotente.
6. Onde o status recebido é definido? Na criação no service, sem confiar no status fornecido pelo cliente.
7. Por que há 500 se o armazenamento falhar? Uma falha inesperada não é erro de validação do usuário.
8. Por que o repository devolve cópias? Para impedir que outra camada altere o estado salvo por referência.
9. O que o controller faz? Lê parâmetros/corpo, chama o service e envia a resposta HTTP.
10. O que os testes de transição verificam? Todos os pares de estados e a preservação dos dados quando uma operação falha.

## Pequenos exercícios

- Antes de executar, preveja o resultado de POST com valor 0, cliente numérico e prioridade desconhecida.
- Troque a prioridade aceita de alta para urgente, atualize mensagem, README, coleção e testes, execute tudo e depois reverta o exercício.
- Implemente uma regra que proíba cancelamento na preparação. Primeiro altere a expectativa do teste para observar a falha.
- Explique por que implementar essa regra apenas no controller dificultaria reutilizar as regras sem HTTP.
- Simule um repository que lança erro. Confira que a API responde 500 sem expor o texto interno.

Não entregue exercícios pela metade. Mantenha documentação, testes e código coerentes.
