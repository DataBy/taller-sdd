import { NextRequest, NextResponse } from "next/server";
import {
  ApiException,
  confirmImportBatch,
  createCategory,
  createChatAction,
  createChatMessage,
  createImportBatch,
  createMovement,
  createProduct,
  createSupplier,
  createVariant,
  exportPdf,
  exportRows,
  exportWorkbook,
  findProduct,
  getPagination,
  paginated,
  parseCsv,
  parseXlsx,
  previewImportRows,
  productDetail,
  productView,
  setProductStatus,
  setVariantStatus,
  state,
  updateCategory,
  updateProduct,
  updateSettings,
  updateSupplier,
  updateVariant,
  updateVariantStock,
} from "@/lib/inventory/store";
import type { MovementOrigin, MovementType, ProductStatus, VariantStatus } from "@/lib/inventory/types";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

const parseJson = async (request: NextRequest): Promise<Record<string, unknown>> => {
  if (!request.body) return {};
  return (await request.json().catch(() => ({}))) as Record<string, unknown>;
};

const errorResponse = (error: unknown) => {
  if (error instanceof ApiException) {
    return json(error.toBody(), { status: error.status });
  }

  console.error(error);
  return json({ error: "Error interno del servidor", code: "INTERNAL_ERROR" }, { status: 500 });
};

const filterProducts = (searchParams: URLSearchParams) => {
  const search = searchParams.get("search")?.trim().toLowerCase();
  const categoryId = searchParams.get("category_id");
  const supplierId = searchParams.get("supplier_id");
  const status = searchParams.get("status");
  const lowStock = searchParams.get("low_stock") === "true";

  return state.products.filter((product) => {
    const category = state.categories.find((entry) => entry.id === product.category_id);
    const supplier = state.suppliers.find((entry) => entry.id === product.supplier_id);
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      category?.name.toLowerCase().includes(search) ||
      supplier?.name.toLowerCase().includes(search);
    const matchesCategory = !categoryId || product.category_id === categoryId;
    const matchesSupplier = !supplierId || product.supplier_id === supplierId;
    const matchesStatus = !status || product.status === status;
    const matchesLowStock = !lowStock || product.stock_current <= product.stock_minimum;

    return matchesSearch && matchesCategory && matchesSupplier && matchesStatus && matchesLowStock;
  });
};

const filterMovements = (searchParams: URLSearchParams, productId?: string) => {
  const variantId = searchParams.get("variant_id");
  const type = searchParams.get("type");
  const origin = searchParams.get("origin");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const queryProductId = productId ?? searchParams.get("product_id");

  return state.movements.filter((movement) => {
    const matchesProduct = !queryProductId || movement.product_id === queryProductId;
    const matchesVariant = !variantId || movement.variant_id === variantId;
    const matchesType = !type || movement.type === type;
    const matchesOrigin = !origin || movement.origin === origin;
    const matchesDateFrom = !dateFrom || movement.created_at >= dateFrom;
    const matchesDateTo = !dateTo || movement.created_at <= dateTo;
    return matchesProduct && matchesVariant && matchesType && matchesOrigin && matchesDateFrom && matchesDateTo;
  });
};

const dashboardSummary = () => {
  const activeProducts = state.products.filter((product) => product.status === "active");
  const activeVariants = state.variants.filter((variant) => variant.status !== "discontinued");

  return {
    active_products: activeProducts.length,
    total_variants: state.variants.length,
    low_stock_count:
      state.products.filter((product) => product.stock_current <= product.stock_minimum).length +
      activeVariants.filter((variant) => variant.stock_current <= variant.stock_minimum).length,
    out_of_stock_count:
      state.products.filter((product) => product.status === "out_of_stock").length +
      state.variants.filter((variant) => variant.status === "out_of_stock").length,
    estimated_purchase_value: state.products.reduce(
      (sum, product) => sum + product.stock_current * product.price_purchase,
      0,
    ),
    estimated_sale_value: state.products.reduce(
      (sum, product) => sum + product.stock_current * product.price_sale,
      0,
    ),
    recent_movements: state.movements.slice(0, 10),
  };
};

const handleChatMessage = async (request: NextRequest) => {
  const body = await parseJson(request);
  const message = String(body.message ?? "").trim();
  const conversationId = String(body.conversation_id ?? crypto.randomUUID());

  if (!message) {
    throw new ApiException(400, "message es requerido", "VALIDATION_ERROR", "message");
  }

  createChatMessage({ conversation_id: conversationId, role: "user", message });

  const normalized = message.toLowerCase();
  const product = state.products.find((entry) => normalized.includes(entry.name.toLowerCase()));

  if (normalized.includes("ajusta") || normalized.includes("ajustar") || normalized.includes("stock")) {
    const numberMatch = normalized.match(/-?\d+/);
    const variant = product ? state.variants.find((entry) => entry.product_id === product.id) : undefined;

    if (product && variant && numberMatch && (normalized.includes("ajusta") || normalized.includes("ajustar"))) {
      const action = createChatAction({
        intent: "stock_adjustment",
        parameters: {
          product_id: product.id,
          variant_id: variant.id,
          stock_current: Number(numberMatch[0]),
          reason: "Ajuste solicitado por chatbot",
        },
      });
      const reply = `Propongo ajustar ${product.name} a ${numberMatch[0]} unidades.`;
      createChatMessage({ conversation_id: conversationId, role: "assistant", message: reply, action_id: action.id });
      return {
        conversation_id: conversationId,
        status: "proposed",
        action_id: action.id,
        intent: action.intent,
        proposal: action.parameters,
        message: reply,
      };
    }

    if (product) {
      const reply = `${product.name} tiene ${product.stock_current} unidades.`;
      createChatMessage({ conversation_id: conversationId, role: "assistant", message: reply });
      return { conversation_id: conversationId, status: "answered", message: reply, product: productView(product) };
    }
  }

  if (normalized.includes("bajo")) {
    const products = state.products.filter((entry) => entry.stock_current <= entry.stock_minimum);
    const reply = products.length
      ? `Hay ${products.length} productos con stock bajo.`
      : "No hay productos con stock bajo.";
    createChatMessage({ conversation_id: conversationId, role: "assistant", message: reply });
    return { conversation_id: conversationId, status: "answered", message: reply, products };
  }

  const reply = "Puedo consultar stock, listar stock bajo o proponer ajustes de stock.";
  createChatMessage({ conversation_id: conversationId, role: "assistant", message: reply });
  return { conversation_id: conversationId, status: "answered", message: reply };
};

const confirmChatAction = (actionId: string) => {
  const action = state.chatActions.find((entry) => entry.id === actionId);
  if (!action) throw new ApiException(404, "Accion no encontrada", "NOT_FOUND");
  if (action.status !== "proposed") {
    throw new ApiException(422, "La accion no esta pendiente de confirmacion", "BUSINESS_RULE_VIOLATION");
  }

  action.status = "confirmed";
  action.confirmed_at = new Date().toISOString();

  if (action.intent === "stock_adjustment") {
    const parameters = action.parameters as {
      product_id: string;
      variant_id: string;
      stock_current: number;
      reason: string;
    };
    const variant = updateVariantStock(
      parameters.product_id,
      parameters.variant_id,
      { stock_current: parameters.stock_current, reason: parameters.reason },
      "chatbot",
      action.id,
    );
    action.status = "executed";
    action.result = { variant };
  }

  return action;
};

const rejectChatAction = (actionId: string) => {
  const action = state.chatActions.find((entry) => entry.id === actionId);
  if (!action) throw new ApiException(404, "Accion no encontrada", "NOT_FOUND");
  if (action.status !== "proposed") {
    throw new ApiException(422, "La accion no esta pendiente de confirmacion", "BUSINESS_RULE_VIOLATION");
  }
  action.status = "rejected";
  return action;
};

async function handleGet(request: NextRequest, path: string[]) {
  const { searchParams } = request.nextUrl;
  const [resource, id, child, childId] = path;

  if (!resource) return json({ service: "inventario-api", version: "v1" });

  if (resource === "products" && !id) {
    const { page, limit } = getPagination(searchParams);
    return json(paginated(filterProducts(searchParams).map(productView), page, limit));
  }

  if (resource === "products" && id && !child) return json(productDetail(findProduct(id)));

  if (resource === "products" && id && child === "variants" && !childId) {
    return json({ data: state.variants.filter((variant) => variant.product_id === id) });
  }

  if (resource === "products" && id && child === "movements") {
    const { page, limit } = getPagination(searchParams);
    return json(paginated(filterMovements(searchParams, id), page, limit));
  }

  if (resource === "categories" && !id) {
    return json({ data: state.categories.filter((category) => category.is_active) });
  }

  if (resource === "suppliers" && !id) {
    const { page, limit } = getPagination(searchParams);
    return json(paginated(state.suppliers, page, limit));
  }

  if (resource === "suppliers" && id) {
    const supplier = state.suppliers.find((entry) => entry.id === id);
    if (!supplier) throw new ApiException(404, "Proveedor no encontrado", "NOT_FOUND");
    return json(supplier);
  }

  if (resource === "movements") {
    const { page, limit } = getPagination(searchParams);
    return json(paginated(filterMovements(searchParams), page, limit));
  }

  if (resource === "import" && id === "batches") {
    const { page, limit } = getPagination(searchParams);
    return json(paginated(state.importBatches, page, limit));
  }

  if (resource === "export") {
    const products = filterProducts(searchParams);
    const filters = Object.fromEntries(searchParams.entries());
    const body =
      id === "pdf"
        ? exportPdf(products, filters)
        : id === "excel" || id === "xlsx"
          ? exportWorkbook(products)
          : exportRows(products);
    const responseBody = typeof body === "string" ? body : new Uint8Array(body);
    const filename = `inventario.${id === "pdf" ? "pdf" : id === "excel" || id === "xlsx" ? "xlsx" : "csv"}`;
    const contentType =
      id === "pdf"
        ? "application/pdf"
        : id === "excel" || id === "xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv; charset=utf-8";

    return new NextResponse(responseBody, {
      headers: {
        "content-type": contentType,
        "content-disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  if (resource === "chat" && id === "history") {
    return json({ data: state.chatMessages, actions: state.chatActions });
  }

  if (resource === "settings") return json(state.settings);
  if (resource === "dashboard" && id === "summary") return json(dashboardSummary());

  throw new ApiException(404, "Endpoint no encontrado", "NOT_FOUND");
}

async function handlePost(request: NextRequest, path: string[]) {
  const [resource, id, child, childId] = path;

  if (resource === "products" && !id) {
    return json(createProduct(await parseJson(request)), { status: 201 });
  }

  if (resource === "products" && id && child === "variants" && !childId) {
    return json(createVariant(id, await parseJson(request)), { status: 201 });
  }

  if (resource === "categories" && !id) return json(createCategory(await parseJson(request)), { status: 201 });
  if (resource === "suppliers" && !id) return json(createSupplier(await parseJson(request)), { status: 201 });

  if (resource === "movements") {
    const body = await parseJson(request);
    const product = findProduct(String(body.product_id ?? ""));
    const quantityBefore = product.stock_current;
    const quantityDelta = Number(body.quantity_delta ?? 0);
    const quantityAfter =
      body.quantity_after !== undefined ? Number(body.quantity_after) : quantityBefore + quantityDelta;

    if (!Number.isInteger(quantityAfter) || quantityAfter < 0) {
      throw new ApiException(422, "La operacion resulta en stock negativo", "BUSINESS_RULE_VIOLATION", "quantity_after");
    }

    product.stock_current = quantityAfter;
    product.status = quantityAfter <= 0 ? "out_of_stock" : product.status === "discontinued" ? "discontinued" : "active";
    const movement = createMovement({
      product_id: product.id,
      variant_id: typeof body.variant_id === "string" ? body.variant_id : undefined,
      type: String(body.type ?? "adjustment") as MovementType,
      quantity_before: quantityBefore,
      quantity_after: quantityAfter,
      reason: String(body.reason ?? "Movimiento manual"),
      origin: String(body.origin ?? "manual") as MovementOrigin,
    });
    return json(movement, { status: 201 });
  }

  if (resource === "import" && id === "preview") {
    const contentType = request.headers.get("content-type") ?? "";
    let filename = "import.csv";
    let rows: Array<{ row: number; data: Record<string, string> }> = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        throw new ApiException(400, "file es requerido", "VALIDATION_ERROR", "file");
      }
      filename = file.name;
      if (file.size > 5 * 1024 * 1024) {
        throw new ApiException(400, "El archivo supera 5MB", "VALIDATION_ERROR", "file");
      }
      rows = filename.endsWith(".xlsx") ? parseXlsx(await file.arrayBuffer()) : parseCsv(await file.text());
    } else {
      const body = await parseJson(request);
      filename = String(body.filename ?? filename);
      rows = Array.isArray(body.rows)
        ? (body.rows as Record<string, string>[]).map((data, index) => ({ row: index + 1, data }))
        : [];
    }

    const { preview, errors } = previewImportRows(rows);
    const batch = createImportBatch(filename, filename.endsWith(".xlsx") ? "xlsx" : "csv", preview, errors);
    return json({
      batch_id: batch.id,
      total_rows: batch.total_rows,
      valid_rows: batch.valid_rows,
      warning_rows: batch.warning_rows,
      error_rows: batch.error_rows,
      preview: batch.preview,
      errors: batch.errors,
    });
  }

  if (resource === "import" && id === "confirm" && child) {
    return json(confirmImportBatch(child));
  }

  if (resource === "chat" && id === "message") return json(await handleChatMessage(request));
  if (resource === "chat" && id === "confirm" && child) return json(confirmChatAction(child));
  if (resource === "chat" && id === "reject" && child) return json(rejectChatAction(child));

  throw new ApiException(404, "Endpoint no encontrado", "NOT_FOUND");
}

async function handlePut(request: NextRequest, path: string[]) {
  const [resource, id, child, childId] = path;

  if (resource === "products" && id && !child) return json(updateProduct(id, await parseJson(request)));
  if (resource === "products" && id && child === "variants" && childId) {
    return json(updateVariant(id, childId, await parseJson(request)));
  }
  if (resource === "categories" && id) return json(updateCategory(id, await parseJson(request)));
  if (resource === "suppliers" && id) return json(updateSupplier(id, await parseJson(request)));
  if (resource === "settings") return json(updateSettings(await parseJson(request)));

  throw new ApiException(404, "Endpoint no encontrado", "NOT_FOUND");
}

async function handlePatch(request: NextRequest, path: string[]) {
  const [resource, id, child, childId, action] = path;
  const body = await parseJson(request);

  if (resource === "products" && id && child === "status") {
    return json(setProductStatus(id, String(body.status) as ProductStatus, String(body.reason ?? "Cambio de estado")));
  }

  if (resource === "products" && id && child === "variants" && childId && action === "stock") {
    return json(updateVariantStock(id, childId, body));
  }

  if (resource === "products" && id && child === "variants" && childId && action === "status") {
    return json(setVariantStatus(id, childId, String(body.status) as VariantStatus, String(body.reason ?? "Cambio de estado")));
  }

  if (resource === "categories" && id && child === "status") {
    return json(updateCategory(id, { is_active: Boolean(body.is_active) }));
  }

  throw new ApiException(404, "Endpoint no encontrado", "NOT_FOUND");
}

async function handleDelete(_request: NextRequest, path: string[]) {
  const [resource, id, child] = path;

  if (resource === "import" && id === "cancel" && child) {
    const batch = state.importBatches.find((entry) => entry.id === child);
    if (!batch) throw new ApiException(404, "Batch no encontrado", "NOT_FOUND");
    if (batch.status !== "pending") {
      throw new ApiException(422, "El batch no esta pendiente", "BUSINESS_RULE_VIOLATION");
    }
    batch.status = "cancelled";
    return json(batch);
  }

  throw new ApiException(404, "Endpoint no encontrado", "NOT_FOUND");
}

const route = async (
  request: NextRequest,
  context: RouteContext,
  handler: (request: NextRequest, path: string[]) => Promise<Response>,
) => {
  try {
    const { path = [] } = await context.params;
    return await handler(request, path);
  } catch (error) {
    return errorResponse(error);
  }
};

export const GET = (request: NextRequest, context: RouteContext) => route(request, context, handleGet);
export const POST = (request: NextRequest, context: RouteContext) => route(request, context, handlePost);
export const PUT = (request: NextRequest, context: RouteContext) => route(request, context, handlePut);
export const PATCH = (request: NextRequest, context: RouteContext) => route(request, context, handlePatch);
export const DELETE = (request: NextRequest, context: RouteContext) => route(request, context, handleDelete);
