export enum OIDCErrorCode {
  missing_configuration = "missing_configuration",
  fetch_well_known_failed = "fetch_well_known_failed",
  fetch_token_failed = "fetch_token_failed",
}

export enum UserGroup {
  admin = "cf-ana-admin",
  user = "cf-ana-user",
}

export interface OIDCConfig {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
}

export interface UserInfoResponse {
  sub: string;
  name: string;
  email: string;
  groups: UserGroup[];
}
