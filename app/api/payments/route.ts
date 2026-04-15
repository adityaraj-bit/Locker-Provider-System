import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth("STUDENT");
    const body = await req.json();
    const { bookingId, amount, method } = body;

    const result = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          bookingId,
          amount,
          status: "PAID", // Corrected to match schema enum if needed (PAID matches)
          transactionRef: "TXN_" + Math.random().toString(36).substring(7).toUpperCase()
        }
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" }
      });

      return p;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}
