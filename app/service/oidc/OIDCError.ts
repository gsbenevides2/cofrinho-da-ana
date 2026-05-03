import { OIDCErrorCode } from "./types";

export class OIDCError extends Error {
  code: OIDCErrorCode;

  constructor(code: OIDCErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "OIDCError";
  }

  getErrorMessage(): string {
    return this.message;
  }
}
