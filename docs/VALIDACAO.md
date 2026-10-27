# Verificação executada

Verificação local realizada em 27/10/2026.

## Ambiente

- Node.js 24.19.0
- npm 11.17.0
- Express 5.3.0
- Jest 30.5.2
- Supertest 7.3.1
- Postman Desktop 12.24.4
- Newman 6.2.3 (usado apenas na verificação, sem adicionar dependência ao projeto)

O package-lock.json fixa as versões resolvidas para instalação reproduzível.

## Resultados

| Verificação | Resultado |
| --- | --- |
| npm install | Concluído; auditoria informou 0 vulnerabilidades |
| npm start | Servidor iniciado e acessado na porta 3000 |
| npm run test:coverage | 2 suítes, 75 testes aprovados |
| Cobertura dos arquivos incluídos | 100% linhas, instruções, funções e ramificações; server.js excluído |
| Postman Desktop | 5 requisições executadas e capturadas |
| Coleção via Newman | 10 requisições e 25 verificações aprovadas, 0 falhas |

## Comandos

~~~sh
npm install
npm run test:coverage
npm start
~~~

Em outro terminal, opcionalmente:

~~~sh
npx --yes newman@6.2.3 run postman/api-pedidos.postman_collection.json
~~~

O Newman é uma ferramenta opcional para repetir a coleção; não substitui as capturas da interface do Postman.
A execução adicional da coleção cria outros pedidos em memória. As capturas obrigatórias foram obtidas na sequência inicial documentada em evidencias/README.md.

A publicação no GitHub e o RA dependem das informações do aluno; este relatório não afirma que houve publicação.
