import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("JWT_SECRET missing (build phase)");
}
const secret = new TextEncoder().encode(JWT_SECRET || "build_safe_secret");

export async function requireAuth(role?: "ADMIN" | "STORE_OWNER" | "STUDENT") {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const { payload } = await jwtVerify(token, secret);

  const user = payload as {
    userId: string;
    role: "ADMIN" | "STORE_OWNER" | "STUDENT";
  };

  if (role && user.role !== role && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return user;
}