import { Elysia, t, type Static } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { addTransactionAction } from "@/app/actions/addTransaction";

const addTransactionBodySchema = t.Object({
  description: t.String({
    minLength: 1,
    maxLength: 200,
    description: "Descrição da transação",
    example: "Depósito mensal",
  }),
  amount: t.Number({
    description: "Valor da transação (depósito positivo / saque negativo)",
    // compatível com NUMERIC(10,2)
    multipleOf: 0.01,
    example: 120.5,
  }),
});

type AddTransactionParams = Static<typeof addTransactionBodySchema>;

const addTransactionSuccessResponseSchema = t.Object({
  success: t.Literal(true, { description: "Transação criada com sucesso" }),
  message: t.String({
    description: "Mensagem de status",
    example: "Transação adicionada com sucesso",
  }),
});

const addTransactionErrorResponseSchema = t.Object({
  success: t.Literal(false, { description: "A requisição falhou" }),
  message: t.String({ description: "Mensagem de erro" }),
});

export const app = new Elysia({ prefix: "/api" })
  .use(
    openapi({
      documentation: {
        info: {
          title: "Cofrinho da Ana API",
          version: "1.0.0",
          description: "API de integração externa para gerenciar transações",
        },
      },
    }),
  )
  .post(
    "/transaction",
    async ({ body, set }) => {
      const params = body as AddTransactionParams;

      const result = await addTransactionAction(params);

      if (result.success) {
        set.status = 201;
        return result;
      }

      const isAuthFailure =
        result.message === "Não autorizado" ||
        result.message ===
          "Apenas administradores podem adicionar transações";

      set.status = isAuthFailure ? 401 : 500;
      return result;
    },
    {
      body: addTransactionBodySchema,
      response: {
        201: addTransactionSuccessResponseSchema,
        400: addTransactionErrorResponseSchema,
        401: addTransactionErrorResponseSchema,
        500: addTransactionErrorResponseSchema,
      },
      detail: {
        summary: "Adicionar transação",
        description:
          "Cria uma nova transação no banco de dados. Autenticação feita via cookie `access_token` (não Bearer) usando OIDCClient.getUserInfo() e verificação de grupo admin.",
      },
    },
  );

export const GET = app.fetch;
export const POST = app.fetch;
export const DELETE = app.fetch;

