import { Elysia } from "elysia";
import { loadTransactionsAction } from "@/app/actions/loadTransactions";
import { requireAdmin } from "../auth/requireAdmin";
import {
  listTransactionsQuerySchema,
  listTransactionsResponseSchema,
} from "../schemas/transaction";
import {
  apiErrorResponseSchema,
  elysiaValidationQueryErrorResponseSchema,
  statusByErrorCode,
} from "../schemas/common";

export const listTransactionsRoute = new Elysia().get(
  "/transactions",
  async (ctx) => {
    const auth = await requireAdmin();
    if (!auth.ok) {
      ctx.set.status = statusByErrorCode[auth.errorCode];
      return {
        success: false as const,
        errorCode: auth.errorCode,
        message: auth.message,
      };
    }

    const offset = ctx.query.offset ?? 0;
    const limit = ctx.query.limit ?? 10;

    try {
      const { transactions, total, hasMore } = await loadTransactionsAction(
        offset,
        limit,
      );
      return {
        success: true as const,
        transactions: transactions.map((t) => ({
          id: t.id,
          description: t.description,
          amount: Number(t.amount),
          date:
            t.date instanceof Date
              ? t.date.toISOString()
              : new Date(t.date).toISOString(),
        })),
        total,
        hasMore,
        offset,
        limit,
      };
    } catch (error) {
      console.error("Erro ao listar transações:", error);
      ctx.set.status = 500;
      return {
        success: false as const,
        errorCode: "SERVER_ERROR" as const,
        message: "Erro ao listar transações",
      };
    }
  },
  {
    query: listTransactionsQuerySchema,
    response: {
      200: listTransactionsResponseSchema,
      401: apiErrorResponseSchema,
      403: apiErrorResponseSchema,
      422: elysiaValidationQueryErrorResponseSchema,
      500: apiErrorResponseSchema,
    },
    detail: {
      summary: "Listar transações",
      tags: ["Transações"],
      security: [{ bearerAuth: [] }],
      description:
        "Retorna o histórico de transações ordenado por data desc, paginado via `offset` e `limit`.",
    },
  },
);
