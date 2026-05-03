import { CookieMap } from "bun";

interface CookieItem {
  name: string;
  value: string;
  options?: {
    path?: string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    secureIfPossible?: boolean;
    sameSite?: Bun.CookieSameSite;
  };
}
interface SetCookieOptions {
  cookies: CookieItem[];
}

export function makeSetCookieUtil(options: SetCookieOptions): string[] {
  const cookies = new CookieMap();
  for (const cookie of options.cookies) {
    const { name, value, options: cookieOptions } = cookie;
    const {
      path,
      expires,
      maxAge,
      domain,
      secure,
      httpOnly,
      secureIfPossible,
      sameSite,
    } = cookieOptions || {};

    const isPossibleToSetSecure = Bun.env.BASE_URL?.startsWith("https://");
    const finalSecure = secureIfPossible ? isPossibleToSetSecure : secure;
    cookies.set(name, value, {
      path,
      expires,
      maxAge,
      domain,
      secure: finalSecure,
      httpOnly,
      sameSite,
    });
  }

  return cookies.toSetCookieHeaders();
}
