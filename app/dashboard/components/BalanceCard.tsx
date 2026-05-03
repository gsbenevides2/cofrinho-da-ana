interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <div className="bg-black/40 p-6 border border-white/10 rounded-lg">
      <p className="mb-2 text-gray-400 text-sm">Saldo Atual</p>
      <p className="font-bold text-white text-4xl">
        R$ {balance.toFixed(2).replace(".", ",")}
      </p>
    </div>
  );
}
