import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/bookings/[id]/verify - Verify QR/OTP and change status
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuth("STORE_OWNER");
    const body = await req.json();
    const { action, qrCode, otp } = body; // action: 'CHECK_IN' or 'CHECK_OUT'

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { store: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Verify ownership
    if (booking.store.ownerId !== user.userId) {
      return NextResponse.json({ success: false, error: "Not authorized for this booking" }, { status: 403 });
    }

    // Verify QR or OTP
    if (booking.qrCode !== qrCode && booking.otp !== otp) {
      return NextResponse.json({ success: false, error: "Invalid QR Code or OTP" }, { status: 400 });
    }

    let newStatus = booking.status;
    if (action === "CHECK_IN" && (booking.status === "PENDING" || booking.status === "CONFIRMED")) {
      newStatus = "CHECKED_IN";
    } else if (action === "CHECK_OUT" && booking.status === "CHECKED_IN") {
      newStatus = "COMPLETED";
    } else {
      return NextResponse.json({ success: false, error: `Invalid action ${action} for status ${booking.status}` }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: newStatus as any },
    });

    await prisma.bookingLog.create({
      data: {
        bookingId: booking.id,
        status: newStatus,
      }
    });

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}
