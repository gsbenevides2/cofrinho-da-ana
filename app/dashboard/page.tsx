import { cookies } from "next/headers";
import { goToErrorPage } from "../utils/goToErrorPage";
import { OIDCClient } from "../service/oidc";
import Link from "next/link";
import { UserGroup } from "../service/oidc/types";
import { BalanceCard } from "./components/BalanceCard";
import { TransactionsList } from "./components/TransactionsList";
import { Database } from "../db";

export default async function DashboardPage() {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get("access_token")?.value;

  if (!accessToken) {
    return goToErrorPage(
      "Acesso negado. Por favor, faça login para acessar o dashboard.",
      true,
    );
  }

  const userInfoResponse = await OIDCClient.getInstance()
    .getUserInfo(accessToken)
    .then((data) => data)
    .catch((error) => {
      console.error("Erro ao obter informações do usuário:", error);
      return goToErrorPage(
        "Falha ao obter informações do usuário. Por favor, tente novamente mais tarde.",
        true,
      );
    });

  const isAdmin = userInfoResponse.groups.includes(UserGroup.admin);
  
  const db = Database.getInstance();
  const [transactions, balance, totalTransactions] = await Promise.all([
    db.getTransactions(10, 0),
    db.getBalance(),
    db.getTotalTransactions(),
  ]);
  
  const hasMore = transactions.length < totalTransactions;

  return (
    <div className="bg-black py-8 min-h-screen text-white">
      <div className="mx-auto px-4 max-w-4xl container">
        {/* Header */}
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="mb-1 font-light text-2xl">
              Olá, {userInfoResponse.name}
            </h1>
            <p className="text-gray-500 text-sm">Cofrinho da Ana</p>
          </div>
          <a href="/auth/logout" className="button">
            Sair
          </a>
        </div>

        {/* Balance */}
        <div className="mb-8">
          <BalanceCard balance={balance} />
        </div>

        {/* Transactions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-light text-lg">Transações</h2>
            {isAdmin && (
              <Link
                href="/dashboard/addTransaction"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                + Nova
              </Link>
            )}
          </div>
          <TransactionsList
            initialTransactions={transactions}
            initialHasMore={hasMore}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  );
}
