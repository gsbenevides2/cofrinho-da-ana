import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { addTransactionRoute } from "./routes/addTransaction";
import { listTransactionsRoute } from "./routes/listTransactions";
import { deleteTransactionRoute } from "./routes/deleteTransaction";
import { getBalanceRoute } from "./routes/getBalance";
import { Database } from "@/app/db";

async function checkDatabase() {
  const start = Date.now();

  try {
    const db = Database.getInstance();
    await db.getTotalTransactions();

    return {
      status: "up" as const,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "down" as const,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

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
  .get(
    "/health",
    async ({ set }) => {
      const database = await checkDatabase();
      const response = {
        status: database.status === "up" ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        checks: {
          database,
        },
      };

      if (response.status !== "ok") {
        set.status = 503;
      }

      return response;
    },
    {
      detail: {
        summary: "Healthcheck da API",
        description: "Endpoint de healthcheck com verificação do banco",
        tags: ["Saldo"],
      },
    },
  )
  .use(addTransactionRoute)
  .use(listTransactionsRoute)
  .use(deleteTransactionRoute)
  .use(getBalanceRoute);
