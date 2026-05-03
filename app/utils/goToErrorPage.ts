import { redirect, RedirectType } from "next/navigation";

export function goToErrorPage(message: string, fromPage: true): never;
export function goToErrorPage(message: string, fromPage?: false): Response;
export function goToErrorPage(message: string, fromPage?: boolean): Response {
  const encodedMessage = encodeURIComponent(message);
  const finalUrl = `/error?message=${encodedMessage}`;

  if (fromPage) {
    return redirect(finalUrl, RedirectType.replace);
  }
  return new Response("", {
    status: 307,
    headers: {
      Location: finalUrl,
    },
  });
}
