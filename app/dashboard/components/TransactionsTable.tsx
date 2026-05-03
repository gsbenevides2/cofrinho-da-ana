import { Transaction } from "@/app/db";

export enum TransactionType {
  deposit = "deposit",
  withdrawal = "withdrawal",
  starting_balance = "starting_balance",
}

interface TableTransaction {
  date: string;
  time: string;
  description: string;
  amount: number;
  type: TransactionType;
}

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

export const tranformToTableTransaction = (
  transaction: Transaction,
): TableTransaction => {
  const dateObj = new Date(transaction.date);
  const date = dateObj.toLocaleDateString("pt-BR");
  const time = dateObj.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  let type: TransactionType;
  if (transaction.amount > 0) {
    type = TransactionType.deposit;
  } else if (transaction.amount < 0) {
    type = TransactionType.withdrawal;
  } else {
    type = TransactionType.starting_balance;
  }
  return {
    date,
    time,
    description: transaction.description,
    amount: transaction.amount,
    type,
  };
};

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const tableTransactions = transactions.map(tranformToTableTransaction);
  if (transactions.length === 0) {
    return (
      <div className="bg-black/40 p-6 border border-white/10 rounded-lg text-gray-400 text-center">
        Nenhuma transação encontrada.
      </div>
    );
  }
  return (
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
            </tr>
          </thead>
          <tbody>
            {tableTransactions.map((transaction, index) => (
              <tr
                key={index}
                className="hover:bg-white/5 border-white/5 border-b transition-colors"
              >
                <td className="p-4">
                  <div className="text-white text-sm">{transaction.date}</div>
                  <div className="text-gray-500 text-xs">
                    {transaction.time}
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-white text-sm">
                    {transaction.description}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span
                    className={`text-sm font-medium ${transactionColors[transaction.type]}`}
                  >
                    {transactionIcons[transaction.type]} R${" "}
                    {Math.abs(transaction.amount).toFixed(2).replace(".", ",")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
