import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { actionId } = body;

  if (!actionId) return NextResponse.json({ error: "actionId requerido" }, { status: 422 });

  const action = await prisma.chatAction.findUnique({ where: { id: actionId } });
  if (!action) return NextResponse.json({ error: "Acción no encontrada" }, { status: 404 });
  if (action.status !== "proposed") return NextResponse.json({ error: "Solo se pueden rechazar acciones en estado propuesto" }, { status: 422 });

  await prisma.chatAction.update({ where: { id: actionId }, data: { status: "rejected" } });

  return NextResponse.json({ success: true });
}
