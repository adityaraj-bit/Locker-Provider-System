import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth("STORE_OWNER");
    
    const store = await prisma.store.findFirst({
      where: { ownerId: user.userId },
      include: {
          capacities: true,
          documents: true
      }
    });

    return NextResponse.json({ success: true, data: store });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}
