import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMovement } from "@/lib/inventory";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
      variants: { orderBy: { createdAt: "asc" } },
      movements: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  if (product.status === "discontinued") return NextResponse.json({ error: "No se puede editar un producto descontinuado" }, { status: 422 });

  const { name, categoryId, description, stockMinimum, pricePurchase, priceSale, supplierId, location } = body;

  if (stockMinimum !== undefined && stockMinimum < 0)
    return NextResponse.json({ error: "El stock mínimo no puede ser negativo" }, { status: 422 });

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(name?.trim() && { name: name.trim() }),
      ...(categoryId && { categoryId }),
      ...(description !== undefined && { description: description?.trim() }),
      ...(stockMinimum !== undefined && { stockMinimum }),
      ...(pricePurchase !== undefined && { pricePurchase }),
      ...(priceSale !== undefined && { priceSale }),
      ...(supplierId !== undefined && { supplierId: supplierId || null }),
      ...(location !== undefined && { location: location?.trim() }),
    },
    include: { category: true, supplier: true, variants: true },
  });

  await createMovement({
    productId: id,
    type: "edit",
    quantityBefore: product.stockCurrent,
    quantityAfter: updated.stockCurrent,
    reason: "Edición de producto",
    origin: "manual",
  });

  return NextResponse.json(updated);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (body.action === "deactivate") {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    if (product.status === "discontinued") return NextResponse.json({ error: "Ya está descontinuado" }, { status: 422 });

    const updated = await prisma.product.update({
      where: { id },
      data: { status: "discontinued" },
    });

    await createMovement({
      productId: id,
      type: "deactivation",
      quantityBefore: product.stockCurrent,
      quantityAfter: product.stockCurrent,
      reason: body.reason ?? "Desactivado por el usuario",
      origin: "manual",
    });

    return NextResponse.json(updated);
  }

  if (body.action === "adjust_stock") {
    const { quantityAfter, reason } = body;
    if (quantityAfter === undefined) return NextResponse.json({ error: "quantityAfter requerido" }, { status: 422 });
    if (quantityAfter < 0) return NextResponse.json({ error: "El stock no puede ser negativo" }, { status: 422 });
    if (!reason?.trim()) return NextResponse.json({ error: "El motivo es requerido para ajustes de stock" }, { status: 422 });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        stockCurrent: quantityAfter,
        status: quantityAfter > 0 ? "active" : "out_of_stock",
      },
    });

    await createMovement({
      productId: id,
      type: "adjustment",
      quantityBefore: product.stockCurrent,
      quantityAfter,
      reason,
      origin: "manual",
    });

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Acción desconocida" }, { status: 422 });
}
