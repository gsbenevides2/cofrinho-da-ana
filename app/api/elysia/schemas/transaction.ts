import { t } from "elysia";

export const transactionSchema = t.Object({
  id: t.Number({
    description: "Identificador único da transação",
    example: 42,
  }),
  description: t.String({
    description: "Descrição da transação",
    example: "Depósito mensal",
  }),
  amount: t.Number({
    description: "Valor da transação (positivo = depósito, negativo = saque)",
    example: 120.5,
  }),
  date: t.String({
    format: "date-time",
    description: "Data/hora da transação (ISO 8601)",
    example: "2026-05-24T15:30:00.000Z",
  }),
});

export const addTransactionBodySchema = t.Object({
  description: t.String({
    minLength: 1,
    maxLength: 200,
    description: "Descrição da transação",
    example: "Depósito mensal",
  }),
  amount: t.Number({
    description:
      "Valor da transação (depósito positivo / saque negativo). Deve ter no máximo 2 casas decimais.",
    minimum: -100000000,
    maximum: 100000000,
    example: 120.5,
  }),
});

export const addTransactionSuccessResponseSchema = t.Object({
  success: t.Literal(true, { description: "Transação criada com sucesso" }),
  message: t.String({
    description: "Mensagem de status",
    example: "Transação adicionada com sucesso",
  }),
});

export const listTransactionsQuerySchema = t.Object({
  offset: t.Optional(
    t.Numeric({
      minimum: 0,
      default: 0,
      description: "Quantidade de transações a pular (padrão 0)",
      example: 0,
    }),
  ),
  limit: t.Optional(
    t.Numeric({
      minimum: 1,
      maximum: 100,
      default: 10,
      description: "Quantidade máxima de transações a retornar (1–100)",
      example: 10,
    }),
  ),
});

export const listTransactionsResponseSchema = t.Object({
  success: t.Literal(true),
  transactions: t.Array(transactionSchema, {
    description: "Página de transações ordenada por data desc",
  }),
  total: t.Number({
    description: "Total de transações armazenadas",
    example: 134,
  }),
  hasMore: t.Boolean({
    description: "Indica se ainda há transações além desta página",
  }),
  offset: t.Number({ description: "Offset aplicado", example: 0 }),
  limit: t.Number({ description: "Limite aplicado", example: 10 }),
});

export const deleteTransactionParamsSchema = t.Object({
  transactionId: t.Numeric({
    minimum: 1,
    description: "ID da transação a remover",
    example: 42,
  }),
});

export const deleteTransactionSuccessResponseSchema = t.Object({
  success: t.Literal(true, { description: "Transação removida com sucesso" }),
  message: t.String({
    description: "Mensagem de status",
    example: "Transação deletada com sucesso",
  }),
});

export const getBalanceSuccessResponseSchema = t.Object({
  success: t.Literal(true),
  balance: t.Number({
    description:
      "Saldo total atual (soma de todas as transações). Pode ser negativo.",
    example: 1234.56,
  }),
});
