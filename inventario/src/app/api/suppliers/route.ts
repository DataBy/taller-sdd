import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(suppliers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, address, notes } = body;

  if (!name?.trim()) return NextResponse.json({ error: "El nombre es requerido" }, { status: 422 });
  if (email && !emailRe.test(email)) return NextResponse.json({ error: "El correo no tiene formato válido" }, { status: 422 });

  const supplier = await prisma.supplier.create({
    data: {
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json(supplier, { status: 201 });
}
