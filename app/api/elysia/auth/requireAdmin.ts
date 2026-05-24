import { cookies, headers } from "next/headers";
import { OIDCClient } from "@/app/service/oidc";
import { UserGroup } from "@/app/service/oidc/types";
import type { ApiErrorCode } from "../schemas/common";

export type RequireAdminResult =
  | { ok: true; accessToken: string }
  | { ok: false; errorCode: ApiErrorCode; message: string };

export async function requireAdmin(): Promise<RequireAdminResult> {
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
        ok: false,
        errorCode: "UNAUTHORIZED",
        message: "Não autorizado",
      };
    }

    const userInfo = await OIDCClient.getInstance().getUserInfo(accessToken);
    if (!userInfo.groups.includes(UserGroup.admin)) {
      return {
        ok: false,
        errorCode: "FORBIDDEN",
        message: "Apenas administradores podem acessar este recurso",
      };
    }

    return { ok: true, accessToken };
  } catch (error) {
    console.error("Erro na verificação de autenticação:", error);
    return {
      ok: false,
      errorCode: "SERVER_ERROR",
      message: "Erro na verificação de autenticação",
    };
  }
}
