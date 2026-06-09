import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMovement, refreshProductStock } from "@/lib/inventory";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { stockMinimum, location } = body;

  const variant = await prisma.variant.findUnique({ where: { id } });
  if (!variant) return NextResponse.json({ error: "Variante no encontrada" }, { status: 404 });

  if (stockMinimum !== undefined && stockMinimum < 0)
    return NextResponse.json({ error: "El stock mínimo no puede ser negativo" }, { status: 422 });

  const updated = await prisma.variant.update({
    where: { id },
    data: {
      ...(stockMinimum !== undefined && { stockMinimum }),
      ...(location !== undefined && { location: location?.trim() }),
    },
  });

  return NextResponse.json(updated);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (body.action === "adjust_stock") {
    const { quantityAfter, reason } = body;
    if (quantityAfter === undefined) return NextResponse.json({ error: "quantityAfter requerido" }, { status: 422 });
    if (quantityAfter < 0) return NextResponse.json({ error: "El stock no puede ser negativo" }, { status: 422 });
    if (!reason?.trim()) return NextResponse.json({ error: "El motivo es requerido" }, { status: 422 });

    const variant = await prisma.variant.findUnique({ where: { id } });
    if (!variant) return NextResponse.json({ error: "Variante no encontrada" }, { status: 404 });

    const updated = await prisma.variant.update({
      where: { id },
      data: {
        stockCurrent: quantityAfter,
        status: quantityAfter > 0 ? "active" : "out_of_stock",
      },
    });

    await createMovement({
      productId: variant.productId,
      variantId: id,
      type: "adjustment",
      quantityBefore: variant.stockCurrent,
      quantityAfter,
      reason,
      origin: "manual",
    });

    await refreshProductStock(variant.productId);
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Acción desconocida" }, { status: 422 });
}
