import { Elysia } from "elysia";
import { deleteTransactionAction } from "@/app/actions/deleteTransaction";
import {
  deleteTransactionParamsSchema,
  deleteTransactionSuccessResponseSchema,
} from "../schemas/transaction";
import {
  apiErrorResponseSchema,
  elysiaValidationParamsErrorResponseSchema,
  statusByErrorCode,
} from "../schemas/common";

export const deleteTransactionRoute = new Elysia().delete(
  "/transaction/:transactionId",
  async (ctx) => {
    const result = await deleteTransactionAction(ctx.params.transactionId);

    if (result.success) {
      return result;
    }

    ctx.set.status = statusByErrorCode[result.errorCode];
    return result;
  },
  {
    params: deleteTransactionParamsSchema,
    response: {
      200: deleteTransactionSuccessResponseSchema,
      401: apiErrorResponseSchema,
      403: apiErrorResponseSchema,
      422: elysiaValidationParamsErrorResponseSchema,
      500: apiErrorResponseSchema,
    },
    detail: {
      summary: "Deletar transação",
      tags: ["Transações"],
      security: [{ bearerAuth: [] }],
      description: "Remove uma transação existente pelo ID.",
    },
  },
);
