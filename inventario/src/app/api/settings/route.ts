import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const settings = await prisma.appSettings.findFirst();
  if (!settings) {
    const created = await prisma.appSettings.create({
      data: { id: 1, currency: "USD", openrouterModel: "openai/gpt-4o-mini" },
    });
    return NextResponse.json(created);
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { currency, openrouterModel, lowStockGlobalThreshold, activeCategoriesJson } = body;

  const settings = await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {
      ...(currency && { currency }),
      ...(openrouterModel && { openrouterModel }),
      ...(lowStockGlobalThreshold !== undefined && { lowStockGlobalThreshold }),
      ...(activeCategoriesJson !== undefined && { activeCategoriesJson }),
    },
    create: {
      id: 1,
      currency: currency ?? "USD",
      openrouterModel: openrouterModel ?? "openai/gpt-4o-mini",
    },
  });

  return NextResponse.json(settings);
}
