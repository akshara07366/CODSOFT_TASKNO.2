
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function verifyAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("dinedesk-session")?.value;
    const secret = process.env.SESSION_SECRET;

    if (!token || !secret) {
      return false;
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    return payload.role === "ADMIN" && Boolean(payload.sub);
  } catch {
    return false;
  }
}
