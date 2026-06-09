import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMovement, hashAttributes, refreshProductStock } from "@/lib/inventory";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, attributes, sku, stockCurrent = 0, stockMinimum = 0, location } = body;

  if (!productId) return NextResponse.json({ error: "productId requerido" }, { status: 422 });
  if (!attributes || Object.keys(attributes).length === 0)
    return NextResponse.json({ error: "Los atributos son requeridos" }, { status: 422 });
  if (stockCurrent < 0) return NextResponse.json({ error: "El stock no puede ser negativo" }, { status: 422 });
  if (stockMinimum < 0) return NextResponse.json({ error: "El stock mínimo no puede ser negativo" }, { status: 422 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const attributesHash = hashAttributes(attributes);

  const existing = await prisma.variant.findUnique({
    where: { productId_attributesHash: { productId, attributesHash } },
  });
  if (existing) return NextResponse.json({ error: "Ya existe una variante con esos atributos para este producto" }, { status: 422 });

  if (sku) {
    const skuTaken = await prisma.variant.findUnique({ where: { sku } });
    if (skuTaken) return NextResponse.json({ error: `El SKU '${sku}' ya está en uso` }, { status: 422 });
  }

  const variant = await prisma.variant.create({
    data: {
      productId,
      attributesJson: JSON.stringify(attributes),
      attributesHash,
      sku: sku?.trim() || null,
      stockCurrent,
      stockMinimum,
      location: location?.trim(),
      status: stockCurrent > 0 ? "active" : "out_of_stock",
    },
  });

  await createMovement({
    productId,
    variantId: variant.id,
    type: "entry",
    quantityBefore: 0,
    quantityAfter: stockCurrent,
    origin: "manual",
  });

  await refreshProductStock(productId);

  return NextResponse.json(variant, { status: 201 });
}
