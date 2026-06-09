import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const format   = searchParams.get("format") ?? "csv";
  const status   = searchParams.get("status") ?? "";
  const category = searchParams.get("category") ?? "";
  const supplier = searchParams.get("supplier") ?? "";

  const where: Record<string, unknown> = {};
  if (status)   where.status = status;
  if (category) where.categoryId = category;
  if (supplier) where.supplierId = supplier;

  const products = await prisma.product.findMany({
    where,
    include: { category: true, supplier: true, variants: true },
    orderBy: { name: "asc" },
  });

  if (format === "csv") {
    const header = "id,nombre,categoria,stock_actual,stock_minimo,precio_compra,precio_venta,proveedor,ubicacion,estado\n";
    const rows = products.map((p) => [
      p.id, `"${p.name}"`, `"${p.category.name}"`, p.stockCurrent, p.stockMinimum,
      p.pricePurchase, p.priceSale, `"${p.supplier?.name ?? ""}"`, `"${p.location ?? ""}"`, p.status,
    ].join(",")).join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="inventario-${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Formato no soportado. Usa: csv" }, { status: 422 });
}
