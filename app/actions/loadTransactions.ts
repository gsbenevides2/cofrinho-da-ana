"use server";

import { Database, Transaction } from "@/app/db";

interface LoadTransactionsResponse {
  transactions: Transaction[];
  hasMore: boolean;
  total: number;
}

export async function loadTransactionsAction(
  offset: number = 0,
  limit: number = 10,
): Promise<LoadTransactionsResponse> {
  try {
    const [transactions, total] = await Promise.all([
      Database.getInstance().getTransactions(limit, offset),
      Database.getInstance().getTotalTransactions(),
    ]);

    return {
      transactions,
      hasMore: offset + limit < total,
      total,
    };
  } catch (error) {
    console.error("Erro ao carregar transações:", error);
    return {
      transactions: [],
      hasMore: false,
      total: 0,
    };
  }
}
