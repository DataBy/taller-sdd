import { prisma } from "./db";

export async function refreshProductStock(productId: string) {
  const activeVariants = await prisma.variant.findMany({
    where: { productId, status: { not: "discontinued" } },
    select: { stockCurrent: true },
  });

  if (activeVariants.length === 0) return;

  const total = activeVariants.reduce((sum, v) => sum + v.stockCurrent, 0);
  const status = total > 0 ? "active" : "out_of_stock";

  await prisma.product.update({
    where: { id: productId },
    data: { stockCurrent: total, status },
  });
}

export async function createMovement(data: {
  productId: string;
  variantId?: string;
  type: string;
  quantityBefore: number;
  quantityAfter: number;
  reason?: string;
  origin: string;
  importBatchId?: string;
  chatActionId?: string;
}) {
  return prisma.inventoryMovement.create({
    data: {
      ...data,
      quantityDelta: data.quantityAfter - data.quantityBefore,
    },
  });
}

export function hashAttributes(attributes: Record<string, string>): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(attributes)
        .map(([key, value]) => [key.trim().toLowerCase(), String(value).trim().toLowerCase()])
        .sort(([left], [right]) => left.localeCompare(right)),
    ),
  );
}
