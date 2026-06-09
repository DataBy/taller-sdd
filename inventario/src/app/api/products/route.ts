import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMovement } from "@/lib/inventory";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search   = searchParams.get("search") ?? "";
  const status   = searchParams.get("status") ?? "";
  const category = searchParams.get("category") ?? "";
  const supplier = searchParams.get("supplier") ?? "";
  const lowStock = searchParams.get("low_stock") === "true";
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit    = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { category: { name: { contains: search } } },
      { supplier: { name: { contains: search } } },
    ];
  }
  if (status) where.status = status;
  if (category) where.categoryId = category;
  if (supplier) where.supplierId = supplier;
  if (lowStock) {
    where.AND = [
      { stockCurrent: { lte: prisma.product.fields.stockMinimum } },
      { status: { not: "discontinued" } },
    ];
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true, supplier: true, variants: true },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ data: products, total, page, limit });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, categoryId, description, stockCurrent = 0, stockMinimum = 0,
          pricePurchase = 0, priceSale = 0, supplierId, location } = body;

  if (!name?.trim()) return NextResponse.json({ error: "El nombre es requerido" }, { status: 422 });
  if (!categoryId)    return NextResponse.json({ error: "La categoría es requerida" }, { status: 422 });
  if (stockCurrent < 0) return NextResponse.json({ error: "El stock no puede ser negativo" }, { status: 422 });
  if (stockMinimum < 0) return NextResponse.json({ error: "El stock mínimo no puede ser negativo" }, { status: 422 });
  if (pricePurchase < 0 || priceSale < 0) return NextResponse.json({ error: "Los precios deben ser ≥ 0" }, { status: 422 });

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      categoryId,
      description: description?.trim(),
      stockCurrent,
      stockMinimum,
      pricePurchase,
      priceSale,
      supplierId: supplierId || null,
      location: location?.trim(),
      status: stockCurrent > 0 ? "active" : "out_of_stock",
    },
    include: { category: true, supplier: true },
  });

  await createMovement({
    productId: product.id,
    type: "entry",
    quantityBefore: 0,
    quantityAfter: stockCurrent,
    origin: "manual",
  });

  return NextResponse.json(product, { status: 201 });
}
