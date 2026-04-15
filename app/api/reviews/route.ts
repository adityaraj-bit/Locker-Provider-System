import { requireAuth } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth("STUDENT");
    const { storeId, rating, comment } = await req.json();

    if (!storeId || !rating) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          storeId,
          userId: user.userId,
          rating: Number(rating),
          comment
        }
      });

      // Update store average rating
      const allReviews = await tx.review.findMany({
          where: { storeId }
      });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await tx.store.update({
          where: { id: storeId },
          data: { rating: avgRating }
      });

      return newReview;
    });

    return NextResponse.json({ success: true, data: review, message: "Review submitted! Thank you." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
