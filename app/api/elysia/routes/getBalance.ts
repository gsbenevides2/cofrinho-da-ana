import { Elysia } from "elysia";
import { getBalanceAction } from "@/app/actions/getBalance";
import { requireAdmin } from "../auth/requireAdmin";
import { getBalanceSuccessResponseSchema } from "../schemas/transaction";
import {
  apiErrorResponseSchema,
  statusByErrorCode,
} from "../schemas/common";

export const getBalanceRoute = new Elysia().get(
  "/balance",
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

    try {
      const { balance } = await getBalanceAction();
      return { success: true as const, balance: Number(balance) };
    } catch (error) {
      console.error("Erro ao obter saldo:", error);
      ctx.set.status = 500;
      return {
        success: false as const,
        errorCode: "SERVER_ERROR" as const,
        message: "Erro ao obter saldo",
      };
    }
  },
  {
    response: {
      200: getBalanceSuccessResponseSchema,
      401: apiErrorResponseSchema,
      403: apiErrorResponseSchema,
      500: apiErrorResponseSchema,
    },
    detail: {
      summary: "Obter saldo total",
      tags: ["Saldo"],
      security: [{ bearerAuth: [] }],
      description:
        "Retorna o saldo total atual (soma de todas as transações).",
    },
  },
);
