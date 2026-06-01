import { cookies } from "next/headers";

const COOKIE_NAME = "cchair_sid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sid = cookieStore.get(COOKIE_NAME)?.value;
  if (!sid) {
    sid = generateSessionId();
  }
  return sid;
}

export function setSessionCookie(sid: string): string {
  return `${COOKIE_NAME}=${sid}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; HttpOnly`;
}
