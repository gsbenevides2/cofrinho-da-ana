"use server";

import { cookies, headers } from "next/headers";
import { Database } from "@/app/db";
import { OIDCClient } from "@/app/service/oidc";
import { UserGroup } from "@/app/service/oidc/types";
import { revalidatePath } from "next/cache";

type DeleteTransactionErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "SERVER_ERROR";

interface DeleteTransactionSuccessResponse {
  success: true;
  message: string;
}

interface DeleteTransactionErrorResponse {
  success: false;
  message: string;
  errorCode: DeleteTransactionErrorCode;
}

export type DeleteTransactionResponse =
  | DeleteTransactionSuccessResponse
  | DeleteTransactionErrorResponse;

export async function deleteTransactionAction(
  transactionId: number,
): Promise<DeleteTransactionResponse> {
  try {
    const cookiesStore = await cookies();
    const headersStore = await headers();
    const rawAuthorization = headersStore.get("authorization");
    const bearerToken = rawAuthorization
      ?.match(/^Bearer\s+(.+)$/i)?.[1]
      ?.trim();
    const accessToken = cookiesStore.get("access_token")?.value ?? bearerToken;

    if (!accessToken) {
      return {
        success: false,
        errorCode: "UNAUTHORIZED",
        message: "Não autorizado",
      };
    }

    const userInfo = await OIDCClient.getInstance().getUserInfo(accessToken);
    if (!userInfo.groups.includes(UserGroup.admin)) {
      return {
        success: false,
        errorCode: "FORBIDDEN",
        message: "Apenas administradores podem deletar transações",
      };
    }

    await Database.getInstance().deleteTransaction(transactionId);

    revalidatePath("/dashboard");

    return { success: true, message: "Transação deletada com sucesso" };
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    return {
      success: false,
      errorCode: "SERVER_ERROR",
      message: "Erro ao deletar transação",
    };
  }
}
