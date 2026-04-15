import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth("STUDENT");
    const { bookingId, reason, description } = await req.json();

    if (!bookingId || !reason) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: user.userId },
      include: { store: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Create the issue
    const issue = await prisma.$transaction(async (tx) => {
      const newIssue = await tx.issue.create({
        data: {
          bookingId,
          userId: user.userId,
          storeId: booking.storeId,
          reason,
          description,
          status: "OPEN"
        }
      });

      // Frozen logic: If student raises an issue, we freeze the booking's value in vendor's wallet if possible
      // Actually, user said "frozen" when asked about issue settlement.
      // We can increment frozenBalance and decrement walletBalance for the vendor.
      if (booking.netEntry > 0) {
          await tx.user.update({
              where: { id: booking.store.ownerId },
              data: {
                  walletBalance: { decrement: booking.netEntry },
                  frozenBalance: { increment: booking.netEntry }
              }
          });
      }

      return newIssue;
    });

    return NextResponse.json({ success: true, data: issue, message: "Issue reported successfully. Our team will investigate." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth();
        const issues = await prisma.issue.findMany({
            where: user.role === 'STUDENT' ? { userId: user.userId } : { storeId: (await prisma.store.findFirst({where: {ownerId: user.userId}}))?.id },
            include: { booking: true, store: true, user: { select: { name: true } } }
        });
        return NextResponse.json({ success: true, data: issues });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
