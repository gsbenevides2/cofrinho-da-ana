"use client";

import { useState, useTransition } from "react";
import { Transaction } from "@/app/db";
import { deleteTransactionAction } from "@/app/actions/deleteTransaction";
import { loadTransactionsAction } from "@/app/actions/loadTransactions";
import {
  TransactionType,
  tranformToTableTransaction,
} from "./TransactionsTable";

const transactionColors = {
  [TransactionType.deposit]: "text-green-400",
  [TransactionType.withdrawal]: "text-red-400",
  [TransactionType.starting_balance]: "text-gray-400",
};

const transactionIcons = {
  [TransactionType.deposit]: "+",
  [TransactionType.withdrawal]: "-",
  [TransactionType.starting_balance]: "",
};

interface TransactionsListProps {
  initialTransactions: Transaction[];
  initialHasMore: boolean;
  isAdmin: boolean;
}

export function TransactionsList({
  initialTransactions,
  initialHasMore,
  isAdmin,
}: TransactionsListProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadMore = () => {
    startTransition(async () => {
      const result = await loadTransactionsAction(transactions.length, 10);
      setTransactions([...transactions, ...result.transactions]);
      setHasMore(result.hasMore);
    });
  };

  const handleDelete = (transactionId: number) => {
    if (!confirm("Tem certeza que deseja deletar esta transação?")) {
      return;
    }

    setDeletingId(transactionId);
    startTransition(async () => {
      const result = await deleteTransactionAction(transactionId);
      if (result.success) {
        setTransactions(transactions.filter((t) => t.id !== transactionId));
      } else {
        alert(result.message);
      }
      setDeletingId(null);
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-black/40 p-6 border border-white/10 rounded-lg text-gray-400 text-center">
        Nenhuma transação encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-white/10 border-b">
                <th className="p-4 font-medium text-gray-400 text-sm text-left">
                  Data
                </th>
                <th className="p-4 font-medium text-gray-400 text-sm text-left">
                  Descrição
                </th>
                <th className="p-4 font-medium text-gray-400 text-sm text-right">
                  Valor
                </th>
                {isAdmin && (
                  <th className="p-4 font-medium text-gray-400 text-sm text-center w-16">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const tableTransaction = tranformToTableTransaction(transaction);
                return (
                  <tr
                    key={transaction.id}
                    className="hover:bg-white/5 border-white/5 border-b transition-colors"
                  >
                    <td className="p-4">
                      <div className="text-white text-sm">
                        {tableTransaction.date}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {tableTransaction.time}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white text-sm">
                        {tableTransaction.description}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`text-sm font-medium ${transactionColors[tableTransaction.type]}`}
                      >
                        {transactionIcons[tableTransaction.type]} R${" "}
                        {Math.abs(tableTransaction.amount)
                          .toFixed(2)
                          .replace(".", ",")}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          disabled={deletingId === transaction.id}
                          className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Deletar transação"
                        >
                          {deletingId === transaction.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isPending}
          className="w-full text-center py-3 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg hover:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </div>
  );
}
