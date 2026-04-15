import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await requireAuth("ADMIN");
    
    const issues = await prisma.issue.findMany({
      include: {
        booking: {
          include: {
            payment: true
          }
        },
        user: { select: { name: true, phone: true } },
        store: { 
          include: { 
            owner: { select: { name: true, phone: true } } 
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: issues });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}
