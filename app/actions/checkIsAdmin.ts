"use server";
import { cookies } from "next/headers";
import { OIDCClient } from "@/app/service/oidc";
import { UserGroup } from "@/app/service/oidc/types";

interface CheckIsAdminResponse {
  success: boolean;
  message: string;
}

export async function checkIsAdminAction(): Promise<CheckIsAdminResponse> {
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
        message: "Apenas administradores podem adicionar transações",
      };
    }

    return { success: true, message: "Usuário é administrador" };
  } catch (error) {
    console.error("Erro ao verificar se o usuário é administrador:", error);
    return {
      success: false,
      message: "Erro ao verificar se o usuário é administrador",
    };
  }
}
