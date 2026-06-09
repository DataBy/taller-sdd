import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RowResult = {
  row: number;
  status: "valid" | "warning" | "error";
  data: Record<string, string>;
  error?: string;
  warning?: string;
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 422 });

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!["csv", "xlsx"].includes(ext ?? ""))
    return NextResponse.json({ error: "Solo se aceptan archivos .csv o .xlsx" }, { status: 422 });

  const text = await file.text();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  if (lines.length < 2) return NextResponse.json({ error: "El archivo está vacío o solo tiene encabezados" }, { status: 422 });

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const categories = await prisma.category.findMany({ select: { name: true } });
  const catNames = categories.map((c) => c.name.toLowerCase());

  const rows: RowResult[] = [];

  for (let i = 1; i < Math.min(lines.length, 501); i++) {
    const values = lines[i].split(",");
    const data: Record<string, string> = {};
    headers.forEach((h, idx) => { data[h] = values[idx]?.trim() ?? ""; });

    const result: RowResult = { row: i, status: "valid", data };

    if (!data.name) {
      result.status = "error";
      result.error = `La fila ${i} no tiene nombre. El campo 'name' es requerido.`;
    } else if (!data.category) {
      result.status = "error";
      result.error = `La fila ${i} no tiene categoría. El campo 'category' es requerido.`;
    } else if (!catNames.includes(data.category.toLowerCase())) {
      result.status = "warning";
      result.warning = `La categoría '${data.category}' en la fila ${i} no existe. Se puede crear automáticamente.`;
    } else if (data.stock_current && parseInt(data.stock_current) < 0) {
      result.status = "error";
      result.error = `La fila ${i} tiene stock negativo (${data.stock_current}). El stock mínimo es 0.`;
    } else if (data.price_sale && isNaN(parseFloat(data.price_sale))) {
      result.status = "error";
      result.error = `La fila ${i} tiene un precio inválido. Debe ser un número mayor o igual a 0.`;
    }

    rows.push(result);
  }

  const batchId = crypto.randomUUID();
  const validRows = rows.filter((r) => r.status !== "error").length;
  const errorRows = rows.filter((r) => r.status === "error").length;

  const batch = await prisma.importBatch.create({
    data: {
      id: batchId,
      filename: file.name,
      fileType: ext === "xlsx" ? "xlsx" : "csv",
      totalRows: rows.length,
      validRows,
      errorRows,
      status: "pending",
      errorsJson: JSON.stringify(rows.filter((r) => r.status === "error")),
    },
  });

  return NextResponse.json({
    batchId: batch.id,
    totalRows: rows.length,
    validRows,
    errorRows,
    warningRows: rows.filter((r) => r.status === "warning").length,
    rows,
  });
}
