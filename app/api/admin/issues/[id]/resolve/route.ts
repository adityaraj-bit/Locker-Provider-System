import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAuth("ADMIN");
    const { action } = await req.json(); // RESOLVE or REFUND

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: { booking: true, store: true }
    });

    if (!issue) {
      return NextResponse.json({ success: false, error: "Issue not found" }, { status: 404 });
    }

    if (issue.status !== "OPEN") {
      return NextResponse.json({ success: false, error: "Issue already processed" }, { status: 400 });
    }

    const netAmount = issue.booking.netEntry;

    const result = await prisma.$transaction(async (tx) => {
      if (action === "RESOLVE") {
        // Validation: Release frozen funds to Vendor Wallet
        await tx.user.update({
          where: { id: issue.store.ownerId },
          data: {
            frozenBalance: { decrement: netAmount },
            walletBalance: { increment: netAmount }
          }
        });

        return await tx.issue.update({
          where: { id },
          data: { status: "RESOLVED" }
        });
      } else if (action === "REFUND") {
        // Validation: Remove from frozen (Student is "refunded" externally or conceptually)
        await tx.user.update({
          where: { id: issue.store.ownerId },
          data: {
            frozenBalance: { decrement: netAmount }
          }
        });

        return await tx.issue.update({
          where: { id },
          data: { status: "REFUNDED", refundAmount: netAmount }
        });
      } else {
        throw new Error("Invalid action");
      }
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
