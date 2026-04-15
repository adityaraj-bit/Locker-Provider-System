import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth("STORE_OWNER");
    const body = await req.json();
    const { otp, qrCode } = body;
    const cleanOtp = otp?.toString().trim();
    const cleanQr = qrCode?.toString().trim();

    if (!cleanOtp && !cleanQr) {
      return NextResponse.json({ success: false, error: "Validation code required" }, { status: 400 });
    }

    // 1. Find the booking
    const booking = await prisma.booking.findFirst({
      where: {
        store: { ownerId: user.userId },
        OR: [
          cleanOtp ? { otp: cleanOtp } : {},
          cleanQr ? { qrCode: cleanQr } : {}
        ].filter(cond => Object.keys(cond).length > 0)
      },
      include: {
        store: true,
        user: { select: { name: true } }
      }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found or unauthorized" }, { status: 404 });
    }

    // 2. Determine Action (Auto-Toggle)
    let nextStatus: "CHECKED_IN" | "COMPLETED" | null = null;
    let logStatus: string = "";

    if (booking.status === "PENDING" || booking.status === "CONFIRMED") {
      nextStatus = "CHECKED_IN";
      logStatus = "CHECKED_IN";
    } else if (booking.status === "CHECKED_IN") {
      nextStatus = "COMPLETED";
      logStatus = "COMPLETED";
    } else if (booking.status === "COMPLETED") {
      return NextResponse.json({ success: false, error: "Booking already completed" }, { status: 400 });
    } else {
      return NextResponse.json({ success: false, error: "Invalid booking state" }, { status: 400 });
    }

    // 3. Update Status and Wallet (Transaction)
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: { status: nextStatus },
        include: { user: { select: { name: true } }, payment: true, store: true }
      });

      // If Checking Out, move funds to Vendor Wallet
      if (nextStatus === "COMPLETED" && updated.payment) {
        const totalAmount = updated.payment.amount;
        const commission = totalAmount * 0.10; // 10% Platform Fee
        const vendorEarnings = totalAmount - commission;

        await tx.user.update({
          where: { id: updated.store.ownerId },
          data: { 
            walletBalance: { increment: vendorEarnings } 
          }
        });

        // Update financial records in booking
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            totalPrice: totalAmount,
            platformFee: commission,
            netEntry: vendorEarnings,
            securityPaid: updated.store.securityDeposit // Return mapping if needed
          }
        });
      }

      return updated;
    });

    // 4. Log the state change
    await prisma.bookingLog.create({
      data: {
        bookingId: booking.id,
        status: nextStatus
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: updatedBooking,
      message: `Student ${updatedBooking.user.name} ${nextStatus === 'CHECKED_IN' ? 'Checked-In' : 'Checked-Out'}` 
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
