import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [
    totalActive,
    totalVariants,
    totalDiscontinued,
    recentMovements,
    settings,
  ] = await Promise.all([
    prisma.product.count({ where: { status: { not: "discontinued" } } }),
    prisma.variant.count({ where: { status: { not: "discontinued" } } }),
    prisma.product.count({ where: { status: "discontinued" } }),
    prisma.inventoryMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { product: { select: { name: true } } },
    }),
    prisma.appSettings.findFirst(),
  ]);

  const outOfStock = await prisma.product.count({ where: { status: "out_of_stock" } });

  const lowStockProducts = await prisma.product.findMany({
    where: {
      status: { not: "discontinued" },
      AND: [
        { stockMinimum: { gt: 0 } },
      ],
    },
    include: { category: true },
    take: 20,
  });

  const filtered = lowStockProducts.filter((p) => p.stockCurrent <= p.stockMinimum);

  const products = await prisma.product.findMany({
    where: { status: { not: "discontinued" } },
    select: { stockCurrent: true, pricePurchase: true, priceSale: true },
  });

  const purchaseValue = products.reduce(
    (sum, product) => sum + product.stockCurrent * Number(product.pricePurchase),
    0,
  );
  const saleValue = products.reduce(
    (sum, product) => sum + product.stockCurrent * Number(product.priceSale),
    0,
  );

  return NextResponse.json({
    totalActive,
    totalVariants,
    totalDiscontinued,
    outOfStock,
    lowStockCount: filtered.length,
    lowStockProducts: filtered,
    purchaseValue,
    saleValue,
    recentMovements,
    currency: settings?.currency ?? "USD",
  });
}
