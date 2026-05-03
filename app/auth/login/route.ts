import { OIDCClient } from "@/app/service/oidc";
import { OIDCError } from "@/app/service/oidc/OIDCError";
import { goToErrorPage } from "@/app/utils/goToErrorPage";

export async function GET() {
  const oidcClient = OIDCClient.getInstance();
  const response = oidcClient
    .getAuthorizationEndpoint()
    .then(
      (url) =>
        new Response("", {
          status: 307,
          headers: {
            Location: url,
          },
        }),
    )
    .catch((error) => {
      if (error instanceof OIDCError) {
        const message = error.getErrorMessage();
        return goToErrorPage(message);
      } else {
        console.error(
          "Erro inesperado ao obter o endpoint de autorização do OIDC:",
          error,
        );
        return goToErrorPage(
          "Ocorreu um erro inesperado ao tentar obter o endpoint de autorização do OIDC. Por favor, tente novamente mais tarde.",
        );
      }
    });

  return response;
}
