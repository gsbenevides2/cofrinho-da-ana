import { t } from "elysia";

export type ApiErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | "SERVER_ERROR";

export const apiErrorResponseSchema = t.Object({
  success: t.Literal(false, { description: "A requisição falhou" }),
  message: t.String({
    description: "Mensagem de erro",
    example: "Não autorizado",
  }),
  errorCode: t.Union(
    [
      t.Literal("UNAUTHORIZED"),
      t.Literal("FORBIDDEN"),
      t.Literal("SERVER_ERROR"),
    ],
    { description: "Código do erro" },
  ),
});

export const statusByErrorCode = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  SERVER_ERROR: 500,
} as const satisfies Record<ApiErrorCode, number>;

const validationErrorSchemaFor = <On extends string>(on: On) =>
  t.Object({
    type: t.Literal("validation", { description: "Erro de validação" }),
    on: t.Literal(on, {
      description: `Objeto validado: ${on}`,
    }),
    found: t.Optional(t.Any()),
    message: t.Optional(t.String()),
  });

export const elysiaValidationBodyErrorResponseSchema =
  validationErrorSchemaFor("body");
export const elysiaValidationQueryErrorResponseSchema =
  validationErrorSchemaFor("query");
export const elysiaValidationParamsErrorResponseSchema =
  validationErrorSchemaFor("params");
