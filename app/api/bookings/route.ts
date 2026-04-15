import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/bookings - Create a booking
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth("STUDENT");
    const body = await req.json();
    const { storeId, bookingDate, itemCount } = body;

    if (!storeId || !bookingDate) {
        return NextResponse.json({ success: false, error: "Store ID and Date required" }, { status: 400 });
    }

    const date = new Date(bookingDate);

    // Atomic Transaction to prevent overbooking
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check capacity
      const capacity = await tx.storeCapacity.findUnique({
        where: {
          storeId_date: { storeId, date }
        }
      });

      if (!capacity || capacity.availableSlots <= 0) {
        throw new Error("No slots available for this date");
      }

      // 2. Decrement available slots
      await tx.storeCapacity.update({
        where: { id: capacity.id },
        data: { availableSlots: { decrement: 1 } }
      });

      // 3. Create booking
      const booking = await tx.booking.create({
        data: {
          userId: user.userId,
          storeId,
          bookingDate: date,
          qrCode: crypto.randomUUID(), // Unique QR identifier
          otp: Math.floor(1000 + Math.random() * 9000).toString(), // 4-digit OTP
          itemCount: itemCount || 1,
          status: "PENDING",
        }
      });

      // 4. Log the state
      await tx.bookingLog.create({
        data: {
          bookingId: booking.id,
          status: "PENDING",
        }
      });

      return booking;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// GET /api/bookings - List user bookings
export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth();
        const bookings = await prisma.booking.findMany({
            where: user.role === "STUDENT" ? { userId: user.userId } : { store: { ownerId: user.userId } },
            include: {
                store: true,
                user: { select: { name: true, phone: true } },
                payment: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, data: bookings });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    }
}
