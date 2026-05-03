import { OIDCError } from "./OIDCError";
import {
  OIDCConfig,
  OIDCErrorCode,
  TokenResponse,
  UserInfoResponse,
} from "./types";

export class OIDCClient {
  static instance: OIDCClient | null = null;

  static getInstance(): OIDCClient {
    if (!this.instance) {
      this.instance = new OIDCClient();
    }
    return this.instance;
  }

  clientId = Bun.env.OIDC_CLIENT_ID;
  wellKnownConfig: OIDCConfig | null = null;
  wellKnownUrl = Bun.env.OIDC_WELLKNOWN_URL;
  baseURL = Bun.env.BASE_URL;

  async fetchWellKnownConfig(): Promise<OIDCConfig> {
    if (!this.wellKnownConfig) {
      if (!this.wellKnownUrl) {
        throw new OIDCError(
          OIDCErrorCode.missing_configuration,
          "URL de configuração do OIDC não encontrada. Verifique se a variável de ambiente OIDC_WELLKNOWN_URL está definida.",
        );
      }
      const response = await fetch(this.wellKnownUrl);
      if (!response.ok) {
        throw new OIDCError(
          OIDCErrorCode.fetch_well_known_failed,
          "Não foi possível obter a configuração do OIDC. Verifique se a URL está correta e acessível: " +
            this.wellKnownUrl,
        );
      }
      this.wellKnownConfig = (await response.json()) as OIDCConfig;
    }
    return this.wellKnownConfig;
  }

  getClientId(): string {
    if (!this.clientId) {
      throw new OIDCError(
        OIDCErrorCode.missing_configuration,
        "Client ID do OIDC não encontrado. Verifique se a variável de ambiente OIDC_CLIENT_ID está definida.",
      );
    }
    return this.clientId;
  }

  getBaseUrl(): string {
    if (!this.baseURL) {
      throw new OIDCError(
        OIDCErrorCode.missing_configuration,
        "URL base da aplicação não encontrada. Verifique se a variável de ambiente BASE_URL está definida.",
      );
    }
    return this.baseURL;
  }

  async getCallbackUrl(): Promise<string> {
    const baseURL = this.getBaseUrl();
    return `${baseURL}/auth/callback`;
  }

  async getAuthorizationEndpoint(): Promise<string> {
    const config = await this.fetchWellKnownConfig();
    const clientId = this.getClientId();
    const baseURL = this.getBaseUrl();
    if (!config.authorization_endpoint) {
      throw new OIDCError(
        OIDCErrorCode.missing_configuration,
        "Endpoint de autorização não encontrado na configuração do OIDC. Verifique se o servidor OIDC está configurado corretamente.",
      );
    }
    const newUrl = new URL(config.authorization_endpoint);
    newUrl.searchParams.set("redirect_uri", `${baseURL}/auth/callback`);
    newUrl.searchParams.set("client_id", clientId);
    newUrl.searchParams.set("response_type", "code");
    return newUrl.toString();
  }

  async getToken(code: string): Promise<TokenResponse> {
    const config = await this.fetchWellKnownConfig();
    const tokenEndpoint = config.token_endpoint;
    if (!tokenEndpoint) {
      throw new OIDCError(
        OIDCErrorCode.missing_configuration,
        "Endpoint de token não encontrado na configuração do OIDC. Verifique se o servidor OIDC está configurado corretamente.",
      );
    }
    const callbackUrl = await this.getCallbackUrl();
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: callbackUrl,
        client_id: this.getClientId(),
        client_secret: Bun.env.OIDC_CLIENT_SECRET || "",
      }),
    });
    if (!response.ok) {
      throw new OIDCError(
        OIDCErrorCode.fetch_token_failed,
        "Falha ao obter token de acesso. Verifique se as credenciais estão corretas e se o servidor OIDC está acessível. Status: " +
          response.status,
      );
    }
    const data = (await response.json()) as TokenResponse;
    return data;
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    const config = await this.fetchWellKnownConfig();
    const userInfoEndpoint = config.userinfo_endpoint;
    if (!userInfoEndpoint) {
      throw new OIDCError(
        OIDCErrorCode.missing_configuration,
        "Endpoint de userinfo não encontrado na configuração do OIDC. Verifique se o servidor OIDC está configurado corretamente.",
      );
    }
    const response = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new OIDCError(
        OIDCErrorCode.fetch_token_failed,
        "Falha ao obter informações do usuário. Verifique se o token de acesso é válido e se o servidor OIDC está acessível. Status: " +
          response.status,
      );
    }
    return (await response.json()) as UserInfoResponse;
  }

  async logOutUrl(idToken: string): Promise<string> {
    const config = await this.fetchWellKnownConfig();
    const endSessionEndpoint = config.end_session_endpoint;
    if (!endSessionEndpoint) {
      throw new OIDCError(
        OIDCErrorCode.missing_configuration,
        "Endpoint de logout não encontrado na configuração do OIDC. Verifique se o servidor OIDC está configurado corretamente.",
      );
    }
    const newUrl = new URL(endSessionEndpoint);
    newUrl.searchParams.set("id_token_hint", idToken);
    newUrl.searchParams.set(
      "post_logout_redirect_uri",
      `${this.getBaseUrl()}/voltesempre`,
    );
    return newUrl.toString();
  }
}
