import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/stores - List stores (with proximity search if lat/lng provided)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius") || "10"; // in km

    if (lat && lng) {
      // Basic bounding box search for proximity
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radNum = parseFloat(radius) / 111; // Crude conversion to degrees

      const stores = await prisma.store.findMany({
        where: {
          latitude: { gte: latNum - radNum, lte: latNum + radNum },
          longitude: { gte: lngNum - radNum, lte: lngNum + radNum },
          isVerified: true,
        },
        include: {
          capacities: {
            where: { date: new Date().toISOString().split('T')[0] + "T00:00:00Z" }
          }
        }
      });
      return NextResponse.json({ success: true, data: stores });
    }

    const stores = await prisma.store.findMany({
      where: { isVerified: true },
      include: { owner: { select: { name: true } } }
    });

    return NextResponse.json({ success: true, data: stores });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/stores - Register a new store
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth("STORE_OWNER");
    const body = await req.json();

    const { name, description, address, latitude, longitude } = body;

    if (!name || !latitude || !longitude) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const store = await prisma.store.create({
      data: {
        name,
        description,
        address,
        latitude,
        longitude,
        ownerId: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: store });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}
