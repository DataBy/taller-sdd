import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const productId = searchParams.get("productId") ?? "";
  const variantId = searchParams.get("variantId") ?? "";
  const limit = Math.min(200, parseInt(searchParams.get("limit") ?? "50"));

  const movements = await prisma.inventoryMovement.findMany({
    where: {
      ...(productId && { productId }),
      ...(variantId && { variantId }),
    },
    include: {
      product: { select: { id: true, name: true } },
      variant: { select: { id: true, attributesJson: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(movements);
}
