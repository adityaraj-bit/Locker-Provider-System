import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn("JWT_SECRET missing (build phase)");
}

const secret = new TextEncoder().encode(JWT_SECRET || "build_safe_secret");

async function createToken(userId: string, role: string) {
  return await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

// REGISTER
export async function register(
  name: string,
  email: string,
  phone: string,
  password: string,
  role: "STUDENT" | "STORE_OWNER" | "ADMIN" = "STUDENT"
) {
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, phone, password: hashed, role },
  });

  const token = await createToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
    token,
  };
}

// LOGIN
export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) throw new Error("Invalid password");

  const token = await createToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
}


export const getRole = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role");
};

export const isAdmin = () => getRole() === "ADMIN";
export const isStoreOwner = () => getRole() === "STORE_OWNER";
export const isStudent = () => getRole() === "STUDENT";