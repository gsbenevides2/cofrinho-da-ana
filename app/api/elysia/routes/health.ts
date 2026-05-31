import { Elysia } from "elysia";
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

export const healthRoute = new Elysia().get(
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
      tags: ["Health"],
    },
  },
);
