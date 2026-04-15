import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth("ADMIN");
    const { id } = await params;
    const body = await req.json();
    const { verified } = body;

    const store = await prisma.store.update({
      where: { id },
      data: { isVerified: verified }
    });

    return NextResponse.json({ success: true, data: store });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}
