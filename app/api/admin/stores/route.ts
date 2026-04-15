import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await requireAuth("ADMIN");
    
    const stores = await prisma.store.findMany({
      include: {
        owner: { select: { name: true, email: true, phone: true } },
        documents: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: stores });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}
