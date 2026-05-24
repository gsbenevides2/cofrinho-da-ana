"use server";
import { cookies } from "next/headers";
import { Database } from "@/app/db";
import { OIDCClient } from "@/app/service/oidc";
import { UserGroup } from "@/app/service/oidc/types";
import { revalidatePath } from "next/cache";

type AddTransactionErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | "SERVER_ERROR";

interface AddTransactionSuccessResponse {
  success: true;
  message: string;
}

interface AddTransactionErrorResponse {
  success: false;
  message: string;
  errorCode: AddTransactionErrorCode;
}

type AddTransactionResponse =
  | AddTransactionSuccessResponse
  | AddTransactionErrorResponse;

interface AddTransactionParams {
  description: string;
  amount: number;
}

export async function addTransactionAction(
  params: AddTransactionParams,
): Promise<AddTransactionResponse> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("access_token")?.value;

    if (!accessToken) {
      return {
        success: false,
        errorCode: "UNAUTHORIZED",
        message: "Não autorizado",
      };
    }

    // Verificar se o usuário é admin
    const userInfo = await OIDCClient.getInstance().getUserInfo(accessToken);
    if (!userInfo.groups.includes(UserGroup.admin)) {
      return {
        success: false,
        errorCode: "FORBIDDEN",
        message: "Apenas administradores podem adicionar transações",
      };
    }

    const { description, amount } = params;

    await Database.getInstance().addTransaction(description, amount);

    // Revalidar a página do dashboard para atualizar os dados
    revalidatePath("/dashboard");

    return { success: true, message: "Transação adicionada com sucesso" };
  } catch (error) {
    console.error("Erro ao adicionar transação:", error);
    return {
      success: false,
      errorCode: "SERVER_ERROR",
      message: "Erro ao adicionar transação",
    };
  }
}
