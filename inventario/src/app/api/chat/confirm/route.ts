import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMovement, refreshProductStock } from "@/lib/inventory";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { actionId } = body;

  if (!actionId) return NextResponse.json({ error: "actionId requerido" }, { status: 422 });

  const action = await prisma.chatAction.findUnique({ where: { id: actionId } });
  if (!action) return NextResponse.json({ error: "Acción no encontrada" }, { status: 404 });
  if (action.status !== "proposed") return NextResponse.json({ error: "Solo se pueden confirmar acciones en estado propuesto" }, { status: 422 });

  const params = JSON.parse(action.parametersJson) as Record<string, unknown>;

  await prisma.chatAction.update({
    where: { id: actionId },
    data: { status: "confirmed", confirmedAt: new Date() },
  });

  let result: Record<string, unknown> = {};

  try {
    if (action.intent === "adjust_stock") {
      const productId = params.productId as string;
      const variantId = params.variantId as string | undefined;
      const quantityAfter = params.quantityAfter as number;
      const reason = params.reason as string;

      if (variantId) {
        const variant = await prisma.variant.findUnique({ where: { id: variantId } });
        if (variant) {
          await prisma.variant.update({
            where: { id: variantId },
            data: { stockCurrent: quantityAfter, status: quantityAfter > 0 ? "active" : "out_of_stock" },
          });
          const movement = await createMovement({
            productId: variant.productId,
            variantId,
            type: "chat_action",
            quantityBefore: variant.stockCurrent,
            quantityAfter,
            reason,
            origin: "chatbot",
            chatActionId: actionId,
          });
          await refreshProductStock(variant.productId);
          result = { movementId: movement.id };
        }
      } else if (productId) {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (product) {
          await prisma.product.update({
            where: { id: productId },
            data: { stockCurrent: quantityAfter, status: quantityAfter > 0 ? "active" : "out_of_stock" },
          });
          const movement = await createMovement({
            productId,
            type: "chat_action",
            quantityBefore: product.stockCurrent,
            quantityAfter,
            reason,
            origin: "chatbot",
            chatActionId: actionId,
          });
          result = { movementId: movement.id };
        }
      }
    }

    if (action.intent === "deactivate_product") {
      const productId = params.productId as string;
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (product) {
        await prisma.product.update({ where: { id: productId }, data: { status: "discontinued" } });
        const movement = await createMovement({
          productId,
          type: "deactivation",
          quantityBefore: product.stockCurrent,
          quantityAfter: product.stockCurrent,
          reason: (params.reason as string) ?? "Desactivado vía chatbot",
          origin: "chatbot",
          chatActionId: actionId,
        });
        result = { movementId: movement.id };
      }
    }

    await prisma.chatAction.update({
      where: { id: actionId },
      data: { status: "executed", resultJson: JSON.stringify(result) },
    });

    return NextResponse.json({ success: true, result });

  } catch (err) {
    await prisma.chatAction.update({
      where: { id: actionId },
      data: { status: "rejected", resultJson: JSON.stringify({ error: String(err) }) },
    });
    return NextResponse.json({ error: "Error al ejecutar la acción" }, { status: 500 });
  }
}
