import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth("STORE_OWNER");
    
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { walletBalance: true, frozenBalance: true }
    });

    const activeIssues = await prisma.issue.count({
        where: { store: { ownerId: user.userId }, status: "OPEN" }
    });

    return NextResponse.json({ 
        success: true, 
        data: {
            ...userData,
            canWithdraw: activeIssues === 0 && (userData?.walletBalance || 0) > 0,
            activeIssues
        } 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth("STORE_OWNER");
        const { amount } = await req.json();

        const userData = await prisma.user.findUnique({
            where: { id: user.userId }
        });

        const activeIssues = await prisma.issue.count({
            where: { store: { ownerId: user.userId }, status: "OPEN" }
        });

        if (activeIssues > 0) {
            return NextResponse.json({ success: false, error: "Cannot withdraw while issues are open" }, { status: 400 });
        }

        if (!userData || userData.walletBalance < amount) {
            return NextResponse.json({ success: false, error: "Insufficient balance" }, { status: 400 });
        }

        // Create withdrawal request
        const withdrawal = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: user.userId },
                data: { walletBalance: { decrement: amount } }
            });

            return await tx.withdrawal.create({
                data: {
                    userId: user.userId,
                    amount,
                    status: "PENDING"
                }
            });
        });

        return NextResponse.json({ success: true, data: withdrawal, message: "Withdrawal request submitted" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
