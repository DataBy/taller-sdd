import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMovement } from "@/lib/inventory";

export async function POST(req: NextRequest, { params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  const batch = await prisma.importBatch.findUnique({ where: { id: batchId } });

  if (!batch) return NextResponse.json({ error: "Lote no encontrado" }, { status: 404 });
  if (batch.status !== "pending") return NextResponse.json({ error: "El lote ya fue procesado" }, { status: 422 });

  const body = await req.json();
  const { rows } = body as { rows: Array<Record<string, string>> };

  if (!rows?.length) return NextResponse.json({ error: "No hay filas para importar" }, { status: 422 });

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const name = row.name?.trim();
    const categoryName = row.category?.trim();
    const stockCurrent = parseInt(row.stock_current ?? "0") || 0;
    const stockMinimum = parseInt(row.stock_minimum ?? "0") || 0;
    const pricePurchase = parseFloat(row.price_purchase ?? "0") || 0;
    const priceSale = parseFloat(row.price_sale ?? "0") || 0;
    const location = row.location?.trim();

    if (!name || !categoryName) continue;

    let category = await prisma.category.findFirst({ where: { name: { equals: categoryName } } });
    if (!category) {
      category = await prisma.category.create({ data: { name: categoryName } });
    }

    let supplier = null;
    if (row.supplier?.trim()) {
      supplier = await prisma.supplier.findFirst({ where: { name: { contains: row.supplier.trim() } } });
      if (!supplier) {
        supplier = await prisma.supplier.create({ data: { name: row.supplier.trim() } });
      }
    }

    const existing = await prisma.product.findFirst({
      where: { name: { equals: name }, categoryId: category.id },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { stockCurrent, stockMinimum, pricePurchase, priceSale, location: location || undefined },
      });
      await createMovement({
        productId: existing.id,
        type: "import",
        quantityBefore: existing.stockCurrent,
        quantityAfter: stockCurrent,
        reason: `Importación: ${batch.filename}`,
        origin: "import",
        importBatchId: batchId,
      });
      updated++;
    } else {
      const product = await prisma.product.create({
        data: {
          name,
          categoryId: category.id,
          supplierId: supplier?.id || null,
          stockCurrent,
          stockMinimum,
          pricePurchase,
          priceSale,
          location: location || null,
          status: stockCurrent > 0 ? "active" : "out_of_stock",
        },
      });
      await createMovement({
        productId: product.id,
        type: "import",
        quantityBefore: 0,
        quantityAfter: stockCurrent,
        reason: `Importación: ${batch.filename}`,
        origin: "import",
        importBatchId: batchId,
      });
      created++;
    }
  }

  await prisma.importBatch.update({
    where: { id: batchId },
    data: { status: "confirmed", confirmedAt: new Date() },
  });

  return NextResponse.json({ success: true, created, updated });
}
