import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, phone, email, address, notes } = body;

  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
  if (email && !emailRe.test(email)) return NextResponse.json({ error: "El correo no tiene formato válido" }, { status: 422 });

  const updated = await prisma.supplier.update({
    where: { id },
    data: {
      ...(name?.trim() && { name: name.trim() }),
      ...(phone !== undefined && { phone: phone?.trim() || null }),
      ...(email !== undefined && { email: email?.trim() || null }),
      ...(address !== undefined && { address: address?.trim() || null }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
    },
  });

  return NextResponse.json(updated);
}
