import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Eres un asistente de inventario para una tienda de souvenirs. Tu dominio es exclusivamente el inventario: productos, variantes, stock, proveedores e historial de movimientos.

REGLAS:
- Solo responde sobre inventario. Rechaza preguntas fuera del dominio.
- Nunca ejecutes acciones sin confirmación explícita del usuario.
- Nunca inventes datos. Si no encuentras el producto, dilo claramente.
- Responde siempre en español.
- Para acciones (crear, editar, ajustar stock, desactivar), devuelve un JSON estructurado.

FORMATO RESPUESTA:
- Consultas: texto plano con los datos relevantes.
- Acciones propuestas: JSON con estructura { "action": true, "intent": "...", "parameters": {...}, "summary": "..." }

INTENCIONES: query_stock, query_low_stock, query_history, create_product, update_product, adjust_stock, deactivate_product, export_guidance`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, history = [] } = body;

  if (!message?.trim()) return NextResponse.json({ error: "Mensaje requerido" }, { status: 422 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({
    reply: "El asistente no está configurado. Configura la API key de OpenRouter en las variables de entorno.",
    isAction: false,
  });

  const settings = await prisma.appSettings.findFirst();
  const model = settings?.openrouterModel ?? "openai/gpt-4o-mini";

  const snapshot = await buildInventorySnapshot();

  const messages = [
    { role: "system", content: `${SYSTEM_PROMPT}\n\nESTADO ACTUAL DEL INVENTARIO:\n${JSON.stringify(snapshot, null, 2)}` },
    ...history.slice(-10),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch(OPENROUTER_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
      },
      body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 800 }),
    });

    if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    let parsed: { action?: boolean; intent?: string; parameters?: Record<string, unknown>; summary?: string } = {};
    let isAction = false;
    let actionId: string | undefined;

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
        isAction = !!parsed.action;
      }
    } catch { /* not JSON */ }

    if (isAction && parsed.intent && parsed.parameters) {
      const chatAction = await prisma.chatAction.create({
        data: {
          intent: parsed.intent,
          parametersJson: JSON.stringify(parsed.parameters),
          status: "proposed",
        },
      });
      actionId = chatAction.id;
    }

    return NextResponse.json({
      reply: isAction ? (parsed.summary ?? content) : content,
      isAction,
      actionId,
      intent: parsed.intent,
      parameters: parsed.parameters,
    });

  } catch {
    return NextResponse.json({
      reply: "El asistente no está disponible en este momento. El inventario sigue funcionando normalmente.",
      isAction: false,
    });
  }
}

async function buildInventorySnapshot() {
  const [products, lowStock] = await Promise.all([
    prisma.product.findMany({
      where: { status: { not: "discontinued" } },
      select: { name: true, stockCurrent: true, stockMinimum: true, status: true, category: { select: { name: true } } },
      take: 50,
    }),
    prisma.product.count({ where: { status: "out_of_stock" } }),
  ]);

  return { totalProducts: products.length, outOfStock: lowStock, products };
}
