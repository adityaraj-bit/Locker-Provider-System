import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/stores/[id]/capacity?date=YYYY-MM-DD
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    if (!dateStr) return NextResponse.json({ success: false, error: "Date required" }, { status: 400 });

    const capacity = await prisma.storeCapacity.findUnique({
      where: {
        storeId_date: {
          storeId: id,
          date: new Date(dateStr),
        }
      }
    });

    return NextResponse.json({ success: true, data: capacity });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/stores/[id]/capacity - Set or update capacity
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuth("STORE_OWNER");
    const body = await req.json();
    const { date, totalSlots } = body;

    // Verify ownership
    const store = await prisma.store.findUnique({ where: { id } });
    if (!store || store.ownerId !== user.userId) {
      return NextResponse.json({ success: false, error: "Not authorized for this store" }, { status: 403 });
    }

    const capacity = await prisma.storeCapacity.upsert({
      where: {
        storeId_date: {
          storeId: id,
          date: new Date(date),
        }
      },
      update: { totalSlots, availableSlots: totalSlots }, // Reset available for simplicity in MVP
      create: {
        storeId: id,
        date: new Date(date),
        totalSlots,
        availableSlots: totalSlots,
      }
    });

    return NextResponse.json({ success: true, data: capacity });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}
