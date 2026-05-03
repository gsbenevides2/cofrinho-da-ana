"use server";

import { cookies } from "next/headers";
import { Database } from "@/app/db";
import { OIDCClient } from "@/app/service/oidc";
import { UserGroup } from "@/app/service/oidc/types";
import { revalidatePath } from "next/cache";

interface DeleteTransactionResponse {
  success: boolean;
  message: string;
}

export async function deleteTransactionAction(
  transactionId: number,
): Promise<DeleteTransactionResponse> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("access_token")?.value;

    if (!accessToken) {
      return { success: false, message: "Não autorizado" };
    }

    // Verificar se o usuário é admin
    const userInfo = await OIDCClient.getInstance().getUserInfo(accessToken);
    if (!userInfo.groups.includes(UserGroup.admin)) {
      return {
        success: false,
        message: "Apenas administradores podem deletar transações",
      };
    }

    await Database.getInstance().deleteTransaction(transactionId);
    
    // Revalidar a página do dashboard para atualizar os dados
    revalidatePath("/dashboard");

    return { success: true, message: "Transação deletada com sucesso" };
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    return { success: false, message: "Erro ao deletar transação" };
  }
}
