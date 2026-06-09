import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description } = body;

  if (!name?.trim()) return NextResponse.json({ error: "El nombre es requerido" }, { status: 422 });

  const existing = await prisma.category.findUnique({ where: { name: name.trim() } });
  if (existing) return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 422 });

  const category = await prisma.category.create({
    data: { name: name.trim(), description: description?.trim() },
  });

  return NextResponse.json(category, { status: 201 });
}
