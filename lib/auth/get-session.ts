import { auth } from "@/lib/auth/auth";

export async function getSessionFromRequest(req: Request) {
  return auth.api.getSession({ headers: req.headers });
}
