import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { addTransactionRoute } from "./routes/addTransaction";
import { listTransactionsRoute } from "./routes/listTransactions";
import { deleteTransactionRoute } from "./routes/deleteTransaction";
import { getBalanceRoute } from "./routes/getBalance";

export const app = new Elysia({ prefix: "/api" })
  .use(
    openapi({
      documentation: {
        info: {
          title: "Cofrinho da Ana API",
          version: "1.0.0",
          description: "API de integração externa para gerenciar transações",
        },
        tags: [
          {
            name: "Transações",
            description:
              "Operações de leitura, criação e remoção de transações",
          },
          {
            name: "Saldo",
            description: "Consulta do saldo agregado",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description:
                "Autenticação via token JWT. O token pode ser fornecido no header 'Authorization' (Bearer ...) ou no cookie 'access_token'. O token será validado usando OIDCClient.getUserInfo() e deve corresponder a um usuário com o grupo 'admin'.",
            },
          },
        },
      },
    }),
  )
  .use(addTransactionRoute)
  .use(listTransactionsRoute)
  .use(deleteTransactionRoute)
  .use(getBalanceRoute);
