import { OIDCClient } from "@/app/service/oidc";
import { goToErrorPage } from "@/app/utils/goToErrorPage";
import { makeSetCookieUtil } from "@/app/utils/makeSetCookieUtil";
import Bun from "bun";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    return goToErrorPage("Código de autorização não encontrado na URL.");
  }

  const response = OIDCClient.getInstance()
    .getToken(code)
    .then(({ access_token, id_token }) => {
      const headers = new Headers();
      headers.append("Location", "/dashboard");
      const setCookie = makeSetCookieUtil({
        cookies: [
          {
            name: "access_token",
            value: access_token,
            options: {
              httpOnly: true,
              secureIfPossible: true,
              sameSite: "lax",
              expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
            },
          },
          {
            name: "id_token",
            value: id_token ?? "",
            options: {
              httpOnly: true,
              secureIfPossible: true,
              sameSite: "lax",
              expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
            },
          },
        ],
      });
      setCookie.forEach((cookie) => headers.append("Set-Cookie", cookie));
      return new Response("", {
        status: 307,
        headers,
      });
    })
    .catch((error) => {
      console.error("Erro ao obter token de acesso:", error);
      return goToErrorPage(
        "Ocorreu um erro ao tentar obter o token de acesso. Por favor, tente novamente mais tarde.",
      );
    });

  return response;
}
