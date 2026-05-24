import { Elysia, type Static } from "elysia";
import { addTransactionAction } from "@/app/actions/addTransaction";
import {
  addTransactionBodySchema,
  addTransactionSuccessResponseSchema,
} from "../schemas/transaction";
import {
  apiErrorResponseSchema,
  elysiaValidationBodyErrorResponseSchema,
  statusByErrorCode,
} from "../schemas/common";

type AddTransactionParams = Static<typeof addTransactionBodySchema>;

export const addTransactionRoute = new Elysia().post(
  "/transaction",
  async (ctx) => {
    const params = ctx.body as AddTransactionParams;
    const result = await addTransactionAction(params);

    if (result.success) {
      ctx.set.status = 201;
      return result;
    }

    ctx.set.status = statusByErrorCode[result.errorCode];
    return result;
  },
  {
    body: addTransactionBodySchema,
    response: {
      201: addTransactionSuccessResponseSchema,
      401: apiErrorResponseSchema,
      403: apiErrorResponseSchema,
      422: elysiaValidationBodyErrorResponseSchema,
      500: apiErrorResponseSchema,
    },
    detail: {
      summary: "Adicionar transação",
      tags: ["Transações"],
      security: [{ bearerAuth: [] }],
      description: "Cria uma nova transação no banco de dados.",
    },
  },
);
