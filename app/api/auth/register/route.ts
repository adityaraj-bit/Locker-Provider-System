import { register } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.email || !body.phone || !body.password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const role = body.email.includes("admin@lockerlink.com") ? "ADMIN" : (body.role || "STUDENT");

    const { user, token } = await register(
      body.name,
      body.email,
      body.phone,
      body.password,
      role
    );

    const res = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;

  } catch (err: any) {
    console.error("REGISTER ERROR:", err);

    return NextResponse.json(
      { success: false, error: err.message || "Registration failed" },
      { status: 400 }
    );
  }
}