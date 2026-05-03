import { OIDCClient } from "@/app/service/oidc";
import { OIDCError } from "@/app/service/oidc/OIDCError";
import { goToErrorPage } from "@/app/utils/goToErrorPage";
import { CookieMap } from "bun";

export function GET(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const cookieMap = new CookieMap(cookies);
  if (!cookieMap.has("access_token")) {
    return goToErrorPage(
      "Acesso negado. Por favor, faça login para acessar esta página.",
    );
  }
  const idToken = cookieMap.get("id_token");
  if (!idToken) {
    return goToErrorPage(
      "Token de identificação não encontrado. Por favor, faça login novamente.",
    );
  }
  return OIDCClient.getInstance()
    .logOutUrl(idToken)
    .then((logoutUrl) => {
      const headers = new Headers();
      headers.append("Location", logoutUrl);
      headers.append(
        "Set-Cookie",
        `access_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      );
      headers.append(
        "Set-Cookie",
        `id_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      );
      return new Response("", {
        status: 307,
        headers,
      });
    })
    .catch((error: unknown) => {
      if (error instanceof OIDCError) {
        const message = error.getErrorMessage();
        return goToErrorPage(message);
      }
      console.error("Erro ao obter URL de logout:", error);
      return goToErrorPage(
        "Ocorreu um erro ao tentar obter a URL de logout. Por favor, tente novamente mais tarde.",
      );
    });
}
