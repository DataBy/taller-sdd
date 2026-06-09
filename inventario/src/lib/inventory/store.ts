import { parse as parseCsvRecords } from "csv-parse/sync";
import { stringify as stringifyCsv } from "csv-stringify/sync";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { read, utils, write } from "xlsx";
import type {
  ApiError,
  ApiErrorCode,
  AppSettings,
  Category,
  ChatAction,
  ChatMessage,
  ImportBatch,
  ImportError,
  ImportPreviewRow,
  InventoryMovement,
  InventoryState,
  MovementOrigin,
  MovementType,
  Product,
  ProductStatus,
  Supplier,
  Variant,
  VariantStatus,
} from "./types.ts";

export class ApiException extends Error {
  status: number;
  code: ApiErrorCode;
  field?: string;

  constructor(status: number, error: string, code: ApiErrorCode, field?: string) {
    super(error);
    this.status = status;
    this.code = code;
    this.field = field;
  }

  toBody(): ApiError {
    return { error: this.message, code: this.code, field: this.field };
  }
}

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

const requiredString = (
  value: unknown,
  field: string,
  label = field,
): string => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiException(400, `${label} es requerido`, "VALIDATION_ERROR", field);
  }

  return value.trim();
};

const optionalString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

const numberValue = (value: unknown, field: string, fallback = 0): number => {
  const parsed = value === undefined || value === null || value === "" ? fallback : Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ApiException(400, `${field} debe ser un numero mayor o igual a 0`, "VALIDATION_ERROR", field);
  }

  return parsed;
};

const integerValue = (value: unknown, field: string, fallback = 0): number => {
  const parsed = numberValue(value, field, fallback);

  if (!Number.isInteger(parsed)) {
    throw new ApiException(400, `${field} debe ser un entero`, "VALIDATION_ERROR", field);
  }

  return parsed;
};

const emailValue = (value: unknown): string | undefined => {
  const email = optionalString(value);
  if (!email) return undefined;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiException(400, "email tiene formato invalido", "VALIDATION_ERROR", "email");
  }

  return email;
};

const textValue = (value: unknown): string => (value === undefined || value === null ? "" : String(value).trim());

const normalizedAttributes = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiException(400, "attributes es requerido", "VALIDATION_ERROR", "attributes");
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined && entry !== null && String(entry).trim() !== "")
      .map(([key, entry]) => [key.trim().toLowerCase(), String(entry).trim().toLowerCase()])
      .sort(([a], [b]) => a.localeCompare(b)),
  );
};

const variantAttributesKey = (attributes: Record<string, string>) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(attributes)
        .map(([key, value]) => [key.trim().toLowerCase(), String(value).trim().toLowerCase()])
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
  );

const findCategoryByName = (name: string) =>
  state.categories.find((entry) => entry.name.toLowerCase() === name.trim().toLowerCase());

const findSupplierByName = (name: string) =>
  state.suppliers.find((entry) => entry.name.toLowerCase() === name.trim().toLowerCase());

const importableRows = (rows: ImportPreviewRow[]) => rows.filter((row) => row.status !== "error");

const rowIssue = (
  row: number,
  field: string,
  message: string,
  severity: "warning" | "error" = "error",
): ImportError => ({ row, field, message, severity });

const parseAttributes = (row: number, value: string): { attributes?: Record<string, string>; issue?: ImportError } => {
  const attributes: Record<string, string> = {};

  if (!value.trim()) {
    return {
      issue: rowIssue(row, "attributes", `La fila ${row} no tiene atributos. El campo 'attributes' es requerido.`),
    };
  }

  for (const part of value.split(",")) {
    const [key, ...rest] = part.split(":");
    const normalizedKey = key?.trim().toLowerCase();
    const normalizedValue = rest.join(":").trim().toLowerCase();

    if (!normalizedKey || !normalizedValue) {
      return {
        issue: rowIssue(
          row,
          "attributes",
          `La fila ${row} tiene atributos con formato incorrecto. Use: talla:M,color:negro.`,
        ),
      };
    }

    attributes[normalizedKey] = normalizedValue;
  }

  return { attributes };
};

const statusFromStock = (stock: number, requested?: ProductStatus): ProductStatus => {
  if (requested === "discontinued") return "discontinued";
  return stock <= 0 ? "out_of_stock" : "active";
};

const variantStatusFromStock = (stock: number, requested?: VariantStatus): VariantStatus => {
  if (requested === "discontinued") return "discontinued";
  return stock <= 0 ? "out_of_stock" : "active";
};

const seedState = (): InventoryState => {
  const created = now();
  const categories: Category[] = [
    "Llaveros",
    "Imanes",
    "Camisetas",
    "Tazas",
    "Artesanias",
    "Pulseras",
  ].map((name) => ({ id: id(), name, is_active: true }));
  const supplier: Supplier = {
    id: id(),
    name: "Proveedor Central",
    email: "compras@example.com",
    created_at: created,
  };
  const product: Product = {
    id: id(),
    name: "Llavero volcan",
    category_id: categories[0].id,
    description: "Souvenir metalico",
    stock_current: 24,
    stock_minimum: 5,
    price_purchase: 2,
    price_sale: 5,
    supplier_id: supplier.id,
    location: "Estante A1",
    status: "active",
    created_at: created,
    updated_at: created,
  };
  const variant: Variant = {
    id: id(),
    product_id: product.id,
    attributes: { color: "rojo" },
    sku: "LLV-VOL-ROJ",
    stock_current: 24,
    stock_minimum: 5,
    location: "Estante A1",
    status: "active",
    created_at: created,
    updated_at: created,
  };
  const settings: AppSettings = {
    id: 1,
    currency: "USD",
    openrouter_model: "openai/gpt-4o-mini",
    active_categories: categories.map((category) => category.id),
    updated_at: created,
  };

  return {
    categories,
    suppliers: [supplier],
    products: [product],
    variants: [variant],
    movements: [
      {
        id: id(),
        product_id: product.id,
        variant_id: variant.id,
        type: "entry",
        quantity_before: 0,
        quantity_after: 24,
        quantity_delta: 24,
        reason: "Carga inicial",
        origin: "manual",
        created_at: created,
      },
    ],
    importBatches: [],
    chatActions: [],
    chatMessages: [],
    settings,
  };
};

const globalKey = "__inventory_spec04_state__";
const globalStore = globalThis as typeof globalThis & {
  [globalKey]?: InventoryState;
};

export const state = globalStore[globalKey] ?? seedState();
globalStore[globalKey] = state;

export const getPagination = (searchParams: URLSearchParams) => {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20) || 20));
  return { page, limit };
};

export const paginated = <T>(items: T[], page: number, limit: number) => {
  const total = items.length;
  const offset = (page - 1) * limit;
  return {
    data: items.slice(offset, offset + limit),
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const productView = (product: Product) => ({
  ...product,
  category: state.categories.find((category) => category.id === product.category_id) ?? null,
  supplier: product.supplier_id
    ? state.suppliers.find((supplier) => supplier.id === product.supplier_id) ?? null
    : null,
});

export const productDetail = (product: Product) => ({
  ...productView(product),
  variants: state.variants.filter((variant) => variant.product_id === product.id),
  movements: state.movements
    .filter((movement) => movement.product_id === product.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at)),
});

export const findProduct = (productId: string): Product => {
  const product = state.products.find((entry) => entry.id === productId);
  if (!product) throw new ApiException(404, "Producto no encontrado", "NOT_FOUND");
  return product;
};

export const findVariant = (productId: string, variantId: string): Variant => {
  const variant = state.variants.find(
    (entry) => entry.id === variantId && entry.product_id === productId,
  );
  if (!variant) throw new ApiException(404, "Variante no encontrada", "NOT_FOUND");
  return variant;
};

export const assertCategory = (categoryId: string) => {
  if (!state.categories.some((category) => category.id === categoryId && category.is_active)) {
    throw new ApiException(400, "Categoria no existe o esta inactiva", "VALIDATION_ERROR", "category_id");
  }
};

export const assertSupplier = (supplierId?: string) => {
  if (supplierId && !state.suppliers.some((supplier) => supplier.id === supplierId)) {
    throw new ApiException(400, "Proveedor no encontrado", "VALIDATION_ERROR", "supplier_id");
  }
};

export const syncProductStock = (productId: string) => {
  const product = findProduct(productId);
  const activeVariants = state.variants.filter(
    (variant) => variant.product_id === productId && variant.status !== "discontinued",
  );

  if (activeVariants.length > 0) {
    product.stock_current = activeVariants.reduce((sum, variant) => sum + variant.stock_current, 0);
    product.status = statusFromStock(product.stock_current, product.status);
    product.updated_at = now();
  }

  return product;
};

export const createMovement = (input: {
  product_id: string;
  variant_id?: string;
  type: MovementType;
  quantity_before: number;
  quantity_after: number;
  reason?: string;
  origin: MovementOrigin;
  import_batch_id?: string;
  chat_action_id?: string;
}) => {
  if ((input.type === "adjustment" || input.origin === "chatbot") && !input.reason?.trim()) {
    throw new ApiException(
      400,
      "Motivo requerido para ajustes y acciones del chatbot",
      "VALIDATION_ERROR",
      "reason",
    );
  }

  const movement: InventoryMovement = {
    id: id(),
    ...input,
    reason: input.reason ?? "Movimiento de inventario",
    quantity_delta: input.quantity_after - input.quantity_before,
    created_at: now(),
  };
  state.movements.unshift(movement);
  return movement;
};

export const createProduct = (body: Record<string, unknown>, origin: MovementOrigin = "manual") => {
  const category_id = requiredString(body.category_id, "category_id", "category_id");
  const supplier_id = optionalString(body.supplier_id);
  assertCategory(category_id);
  assertSupplier(supplier_id);

  const timestamp = now();
  const stock = integerValue(body.stock_current, "stock_current", 0);
  const product: Product = {
    id: id(),
    name: requiredString(body.name, "name", "Nombre del producto"),
    category_id,
    description: optionalString(body.description),
    stock_current: stock,
    stock_minimum: integerValue(body.stock_minimum, "stock_minimum", 0),
    price_purchase: numberValue(body.price_purchase, "price_purchase", 0),
    price_sale: numberValue(body.price_sale, "price_sale", 0),
    supplier_id,
    location: optionalString(body.location),
    status: statusFromStock(stock),
    created_at: timestamp,
    updated_at: timestamp,
  };
  state.products.push(product);

  if (stock > 0) {
    createMovement({
      product_id: product.id,
      type: origin === "import" ? "import" : "entry",
      quantity_before: 0,
      quantity_after: stock,
      reason: origin === "import" ? "Importacion" : "Creacion de producto",
      origin,
    });
  }

  return product;
};

export const updateProduct = (productId: string, body: Record<string, unknown>) => {
  const product = findProduct(productId);
  const before = product.stock_current;

  if (body.category_id !== undefined) {
    const categoryId = requiredString(body.category_id, "category_id", "category_id");
    assertCategory(categoryId);
    product.category_id = categoryId;
  }

  if (body.supplier_id !== undefined) {
    const supplierId = optionalString(body.supplier_id);
    assertSupplier(supplierId);
    product.supplier_id = supplierId;
  }

  if (body.name !== undefined) product.name = requiredString(body.name, "name", "Nombre del producto");
  if (body.description !== undefined) product.description = optionalString(body.description);
  if (body.stock_current !== undefined) product.stock_current = integerValue(body.stock_current, "stock_current");
  if (body.stock_minimum !== undefined) product.stock_minimum = integerValue(body.stock_minimum, "stock_minimum");
  if (body.price_purchase !== undefined) product.price_purchase = numberValue(body.price_purchase, "price_purchase");
  if (body.price_sale !== undefined) product.price_sale = numberValue(body.price_sale, "price_sale");
  if (body.location !== undefined) product.location = optionalString(body.location);

  product.status = statusFromStock(product.stock_current, product.status);
  product.updated_at = now();

  createMovement({
    product_id: product.id,
    type: "edit",
    quantity_before: before,
    quantity_after: product.stock_current,
    reason: optionalString(body.reason) ?? "Edicion de producto",
    origin: "manual",
  });

  return product;
};

export const createVariant = (productId: string, body: Record<string, unknown>) => {
  findProduct(productId);
  const attributes = normalizedAttributes(body.attributes);
  const encodedAttributes = variantAttributesKey(attributes);
  const duplicate = state.variants.some(
    (variant) =>
      variant.product_id === productId &&
      variantAttributesKey(variant.attributes) === encodedAttributes &&
      variant.status !== "discontinued",
  );

  if (duplicate) {
    throw new ApiException(409, "Ya existe una variante con los mismos atributos", "CONFLICT", "attributes");
  }

  const sku = optionalString(body.sku);
  if (sku && state.variants.some((variant) => variant.sku === sku)) {
    throw new ApiException(409, "SKU ya existe", "CONFLICT", "sku");
  }

  const timestamp = now();
  const stock = integerValue(body.stock_current, "stock_current", 0);
  const variant: Variant = {
    id: id(),
    product_id: productId,
    attributes,
    sku,
    stock_current: stock,
    stock_minimum: integerValue(body.stock_minimum, "stock_minimum", 0),
    location: optionalString(body.location),
    status: variantStatusFromStock(stock),
    created_at: timestamp,
    updated_at: timestamp,
  };
  state.variants.push(variant);
  syncProductStock(productId);

  createMovement({
    product_id: productId,
    variant_id: variant.id,
    type: "entry",
    quantity_before: 0,
    quantity_after: stock,
    reason: "Creacion de variante",
    origin: "manual",
  });

  return variant;
};

export const updateVariant = (productId: string, variantId: string, body: Record<string, unknown>) => {
  const variant = findVariant(productId, variantId);
  const before = variant.stock_current;

  if (body.attributes !== undefined) {
    const attributes = normalizedAttributes(body.attributes);
    const encodedAttributes = variantAttributesKey(attributes);
    const duplicate = state.variants.some(
      (entry) =>
        entry.id !== variant.id &&
        entry.product_id === productId &&
        variantAttributesKey(entry.attributes) === encodedAttributes &&
        entry.status !== "discontinued",
    );
    if (duplicate) {
      throw new ApiException(409, "Ya existe una variante con los mismos atributos", "CONFLICT", "attributes");
    }
    variant.attributes = attributes;
  }

  if (body.sku !== undefined) {
    const sku = optionalString(body.sku);
    if (sku && state.variants.some((entry) => entry.id !== variant.id && entry.sku === sku)) {
      throw new ApiException(409, "SKU ya existe", "CONFLICT", "sku");
    }
    variant.sku = sku;
  }

  if (body.stock_current !== undefined) variant.stock_current = integerValue(body.stock_current, "stock_current");
  if (body.stock_minimum !== undefined) variant.stock_minimum = integerValue(body.stock_minimum, "stock_minimum");
  if (body.location !== undefined) variant.location = optionalString(body.location);

  variant.status = variantStatusFromStock(variant.stock_current, variant.status);
  variant.updated_at = now();
  syncProductStock(productId);

  createMovement({
    product_id: productId,
    variant_id: variantId,
    type: "edit",
    quantity_before: before,
    quantity_after: variant.stock_current,
    reason: optionalString(body.reason) ?? "Edicion de variante",
    origin: "manual",
  });

  return variant;
};

export const updateVariantStock = (
  productId: string,
  variantId: string,
  body: Record<string, unknown>,
  origin: MovementOrigin = "manual",
  chatActionId?: string,
) => {
  const variant = findVariant(productId, variantId);
  const reason = requiredString(body.reason, "reason", "Motivo");
  const before = variant.stock_current;
  const after =
    body.stock_current !== undefined
      ? integerValue(body.stock_current, "stock_current")
      : before + Number(body.quantity_delta ?? 0);

  if (!Number.isInteger(after) || after < 0) {
    throw new ApiException(422, "La operacion resulta en stock negativo", "BUSINESS_RULE_VIOLATION", "stock_current");
  }

  variant.stock_current = after;
  variant.status = variantStatusFromStock(after, variant.status);
  variant.updated_at = now();
  syncProductStock(productId);

  const movementType: MovementType =
    after > before ? "entry" : after < before ? "exit" : "adjustment";

  createMovement({
    product_id: productId,
    variant_id: variantId,
    type: origin === "chatbot" ? "chat_action" : movementType,
    quantity_before: before,
    quantity_after: after,
    reason,
    origin,
    chat_action_id: chatActionId,
  });

  return variant;
};

export const setProductStatus = (productId: string, status: ProductStatus, reason = "Cambio de estado") => {
  const product = findProduct(productId);
  if (!["active", "out_of_stock", "discontinued"].includes(status)) {
    throw new ApiException(400, "Estado invalido", "VALIDATION_ERROR", "status");
  }

  product.status = status;
  product.updated_at = now();

  createMovement({
    product_id: productId,
    type: status === "discontinued" ? "deactivation" : "edit",
    quantity_before: product.stock_current,
    quantity_after: product.stock_current,
    reason,
    origin: "manual",
  });

  return product;
};

export const setVariantStatus = (
  productId: string,
  variantId: string,
  status: VariantStatus,
  reason = "Cambio de estado",
) => {
  const variant = findVariant(productId, variantId);
  if (!["active", "out_of_stock", "discontinued"].includes(status)) {
    throw new ApiException(400, "Estado invalido", "VALIDATION_ERROR", "status");
  }

  variant.status = status;
  variant.updated_at = now();
  syncProductStock(productId);

  createMovement({
    product_id: productId,
    variant_id: variantId,
    type: status === "discontinued" ? "deactivation" : "edit",
    quantity_before: variant.stock_current,
    quantity_after: variant.stock_current,
    reason,
    origin: "manual",
  });

  return variant;
};

export const createCategory = (body: Record<string, unknown>) => {
  const name = requiredString(body.name, "name", "Nombre de categoria");
  if (state.categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
    throw new ApiException(409, "Categoria ya existe", "CONFLICT", "name");
  }

  const category: Category = {
    id: id(),
    name,
    description: optionalString(body.description),
    is_active: body.is_active === undefined ? true : Boolean(body.is_active),
  };
  state.categories.push(category);
  return category;
};

export const updateCategory = (categoryId: string, body: Record<string, unknown>) => {
  const category = state.categories.find((entry) => entry.id === categoryId);
  if (!category) throw new ApiException(404, "Categoria no encontrada", "NOT_FOUND");
  if (body.name !== undefined) category.name = requiredString(body.name, "name", "Nombre de categoria");
  if (body.description !== undefined) category.description = optionalString(body.description);
  if (body.is_active !== undefined) category.is_active = Boolean(body.is_active);
  return category;
};

export const createSupplier = (body: Record<string, unknown>) => {
  const supplier: Supplier = {
    id: id(),
    name: requiredString(body.name, "name", "Nombre del proveedor"),
    phone: optionalString(body.phone),
    email: emailValue(body.email),
    address: optionalString(body.address),
    notes: optionalString(body.notes),
    created_at: now(),
  };
  state.suppliers.push(supplier);
  return supplier;
};

export const updateSupplier = (supplierId: string, body: Record<string, unknown>) => {
  const supplier = state.suppliers.find((entry) => entry.id === supplierId);
  if (!supplier) throw new ApiException(404, "Proveedor no encontrado", "NOT_FOUND");
  if (body.name !== undefined) supplier.name = requiredString(body.name, "name", "Nombre del proveedor");
  if (body.phone !== undefined) supplier.phone = optionalString(body.phone);
  if (body.email !== undefined) supplier.email = emailValue(body.email);
  if (body.address !== undefined) supplier.address = optionalString(body.address);
  if (body.notes !== undefined) supplier.notes = optionalString(body.notes);
  return supplier;
};

export const parseCsv = (content: string) => {
  const records = parseCsvRecords(content, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  if (records.length === 0) {
    throw new ApiException(400, "El archivo esta vacio", "VALIDATION_ERROR", "file");
  }

  return records.map((data, index) => ({ row: index + 2, data }));
};

export const parseXlsx = (content: ArrayBuffer) => {
  const workbook = read(content, { type: "array" });
  const [sheetName] = workbook.SheetNames;

  if (!sheetName) {
    throw new ApiException(400, "Hoja de calculo no encontrada", "VALIDATION_ERROR", "file");
  }

  const sheet = workbook.Sheets[sheetName];
  const records = utils.sheet_to_json<Record<string, string>>(sheet, { defval: "", raw: false });

  if (records.length === 0) {
    throw new ApiException(400, "El archivo esta vacio", "VALIDATION_ERROR", "file");
  }

  return records.map((data, index) => ({ row: index + 2, data }));
};

export const previewImportRows = (
  rows: Array<{ row: number; data: Record<string, string> }>,
): { preview: ImportPreviewRow[]; errors: ImportError[] } => {
  const preview = rows.map(({ row, data }) => {
    const errors: ImportError[] = [];
    const type = data.product_name !== undefined || data.attributes !== undefined ? "variant" : "product";

    if (type === "variant") {
      const productName = textValue(data.product_name);
      const sku = textValue(data.sku);
      const attributesText = textValue(data.attributes);

      if (!productName) {
        errors.push(rowIssue(row, "product_name", `La fila ${row} no tiene producto. El campo 'product_name' es requerido.`));
      }

      const product = state.products.find((entry) => entry.name.toLowerCase() === productName.toLowerCase());
      if (productName && !product) {
        errors.push(rowIssue(row, "product_name", `El producto '${productName}' en la fila ${row} no existe.`));
      }

      const parsedAttributes = parseAttributes(row, attributesText);
      if (parsedAttributes.issue) errors.push(parsedAttributes.issue);

      if (
        product &&
        parsedAttributes.attributes &&
        state.variants.some(
          (variant) =>
            variant.product_id === product.id &&
            variantAttributesKey(variant.attributes) === variantAttributesKey(parsedAttributes.attributes ?? {}),
        )
      ) {
        errors.push(
          rowIssue(
            row,
            "attributes",
            `La fila ${row} tiene los mismos atributos que una variante existente. Se actualizara.`,
            "warning",
          ),
        );
      }

      if (sku && state.variants.some((variant) => variant.sku === sku)) {
        errors.push(rowIssue(row, "sku", `El SKU '${sku}' en la fila ${row} ya existe en el sistema.`));
      }
    } else {
      const name = textValue(data.name);
      const categoryName = textValue(data.category ?? data.category_name);

      if (!name) errors.push(rowIssue(row, "name", `La fila ${row} no tiene nombre. El campo 'name' es requerido.`));
      if (!categoryName && !data.category_id) {
        errors.push(rowIssue(row, "category", `La fila ${row} no tiene categoria. El campo 'category' es requerido.`));
      }

      const category =
        data.category_id
          ? state.categories.find((entry) => entry.id === data.category_id)
          : findCategoryByName(categoryName);

      if ((data.category_id || categoryName) && !category) {
        errors.push(
          rowIssue(
            row,
            "category",
            `La categoria '${categoryName || data.category_id}' en la fila ${row} no existe. Se puede crear automaticamente.`,
            "warning",
          ),
        );
      }

      if (
        name &&
        category &&
        state.products.some(
          (product) => product.name.toLowerCase() === name.toLowerCase() && product.category_id === category.id,
        )
      ) {
        errors.push(
          rowIssue(
            row,
            "name",
            `La fila ${row} tiene el mismo nombre y categoria que un producto existente. Se actualizara.`,
            "warning",
          ),
        );
      }
    }

    for (const field of ["stock_current", "stock_minimum", "price_purchase", "price_sale"]) {
      if (data[field] !== undefined && data[field] !== "" && (Number.isNaN(Number(data[field])) || Number(data[field]) < 0)) {
        errors.push(rowIssue(row, field, `La fila ${row} tiene ${field} invalido. Debe ser un numero mayor o igual a 0.`));
      }
    }

    const hasErrors = errors.some((entry) => entry.severity !== "warning");
    return {
      row,
      data,
      type,
      status: hasErrors ? "error" : errors.length > 0 ? "warning" : "valid",
      errors,
    } satisfies ImportPreviewRow;
  });

  return { preview, errors: preview.flatMap((row) => row.errors.filter((issue) => issue.severity !== "warning")) };
};

export const createImportBatch = (
  filename: string,
  fileType: "csv" | "xlsx",
  preview: ImportPreviewRow[],
  errors: ImportError[],
) => {
  const batch: ImportBatch = {
    id: id(),
    filename,
    file_type: fileType,
    total_rows: preview.length,
    valid_rows: importableRows(preview).length,
    warning_rows: preview.filter((row) => row.status === "warning").length,
    error_rows: preview.filter((row) => row.status === "error").length,
    status: "pending",
    preview,
    errors,
    created_at: now(),
  };
  state.importBatches.unshift(batch);
  return batch;
};

export const confirmImportBatch = (batchId: string) => {
  const batch = state.importBatches.find((entry) => entry.id === batchId);
  if (!batch) throw new ApiException(404, "Batch no encontrado", "NOT_FOUND");
  if (batch.status !== "pending") {
    throw new ApiException(422, "El batch no esta pendiente", "BUSINESS_RULE_VIOLATION");
  }

  const result = { products_created: 0, products_updated: 0, variants_created: 0, variants_updated: 0, skipped: batch.error_rows };

  importableRows(batch.preview).forEach((row) => {
    if (row.type === "variant") {
      const product = state.products.find(
        (entry) => entry.name.toLowerCase() === textValue(row.data.product_name).toLowerCase(),
      );
      const parsedAttributes = parseAttributes(row.row, textValue(row.data.attributes));
      if (!product || !parsedAttributes.attributes) return;

      const existing = state.variants.find(
        (variant) =>
          variant.product_id === product.id &&
          variantAttributesKey(variant.attributes) === variantAttributesKey(parsedAttributes.attributes ?? {}),
      );

      if (existing) {
        updateVariant(product.id, existing.id, {
          sku: row.data.sku,
          attributes: parsedAttributes.attributes,
          stock_current: row.data.stock_current,
          stock_minimum: row.data.stock_minimum,
          location: row.data.location,
          reason: "Importacion confirmada",
        });
        result.variants_updated += 1;
        return;
      }

      createVariant(product.id, {
        sku: row.data.sku,
        attributes: parsedAttributes.attributes,
        stock_current: row.data.stock_current,
        stock_minimum: row.data.stock_minimum,
        location: row.data.location,
      });
      result.variants_created += 1;
      return;
    }

      const category = row.data.category_id
        ? state.categories.find((entry) => entry.id === row.data.category_id)
        : findCategoryByName(textValue(row.data.category ?? row.data.category_name)) ??
          createCategory({ name: row.data.category ?? row.data.category_name });
      if (!category) return;
      const supplierName = textValue(row.data.supplier);
      const supplier = supplierName
        ? findSupplierByName(supplierName) ?? createSupplier({ name: supplierName })
        : undefined;
      const existing = state.products.find(
        (product) =>
          product.name.toLowerCase() === textValue(row.data.name).toLowerCase() && product.category_id === category.id,
      );

      if (existing) {
        updateProduct(existing.id, {
          name: row.data.name,
          category_id: category.id,
          description: row.data.description,
          stock_current: row.data.stock_current,
          stock_minimum: row.data.stock_minimum,
          price_purchase: row.data.price_purchase,
          price_sale: row.data.price_sale,
          supplier_id: supplier?.id,
          location: row.data.location,
          reason: "Importacion confirmada",
        });
        result.products_updated += 1;
        return;
      }

      createProduct(
        {
          name: row.data.name,
          category_id: category?.id,
          description: row.data.description,
          stock_current: row.data.stock_current,
          stock_minimum: row.data.stock_minimum,
          price_purchase: row.data.price_purchase,
          price_sale: row.data.price_sale,
          supplier_id: supplier?.id,
          location: row.data.location,
        },
        "import",
      );
      result.products_created += 1;
    });

  batch.status = "confirmed";
  batch.confirmed_at = now();
  return { batch, summary: result };
};

const productExportRows = (products: Product[]) =>
  products.map((product) => {
      const category = state.categories.find((entry) => entry.id === product.category_id)?.name ?? "";
    const supplier = product.supplier_id
      ? state.suppliers.find((entry) => entry.id === product.supplier_id)?.name ?? ""
      : "";
      return [
        product.id,
        product.name,
        category,
      product.description ?? "",
        product.stock_current,
        product.stock_minimum,
        product.price_purchase,
        product.price_sale,
      supplier,
      product.location ?? "",
        product.status,
      product.created_at,
      product.updated_at,
    ];
  });

const variantExportRows = (products: Product[]) => {
  const productIds = new Set(products.map((product) => product.id));
  return state.variants
    .filter((variant) => productIds.has(variant.product_id))
    .map((variant) => {
      const product = state.products.find((entry) => entry.id === variant.product_id);
      return [
        product?.name ?? "",
        variant.sku ?? "",
        Object.entries(variant.attributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", "),
        variant.stock_current,
        variant.stock_minimum,
        variant.location ?? "",
        variant.status,
      ];
    });
};

export const PRODUCT_EXPORT_HEADERS = [
  "ID",
  "Nombre",
  "Categoria",
  "Descripcion",
  "Stock total",
  "Stock minimo",
  "Precio de compra",
  "Precio de venta",
  "Proveedor",
  "Ubicacion",
  "Estado",
  "Fecha de creacion",
  "Ultima actualizacion",
];

export const VARIANT_EXPORT_HEADERS = [
  "Producto",
  "SKU",
  "Atributos",
  "Stock actual",
  "Stock minimo",
  "Ubicacion",
  "Estado",
];

export const exportRows = (products: Product[]) =>
  stringifyCsv([PRODUCT_EXPORT_HEADERS, ...productExportRows(products)], { quoted: true });

export const exportWorkbook = (products: Product[]) => {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([PRODUCT_EXPORT_HEADERS, ...productExportRows(products)]), "Productos");
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([VARIANT_EXPORT_HEADERS, ...variantExportRows(products)]), "Variantes");
  return write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;
};

export const exportPdf = (products: Product[], filters: Record<string, string | undefined> = {}) => {
  const doc = new jsPDF({ orientation: "landscape" });
  const activeFilters = Object.entries(filters)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" | ");

  doc.setTextColor(124, 58, 237);
  doc.setFontSize(16);
  doc.text("Inventario Souvenirs", 14, 14);
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.text(`Fecha de exportacion: ${now()}`, 14, 22);
  doc.text(`Filtros aplicados: ${activeFilters || "ninguno"}`, 14, 28);

  autoTable(doc, {
    head: [["Nombre", "Categoria", "Stock", "Minimo", "Precio venta", "Proveedor", "Estado"]],
    body: productExportRows(products).map((row) => [row[1], row[2], row[4], row[5], row[7], row[8], row[10]]),
    startY: 34,
    headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 243, 255] },
  });

  doc.text(`Total de registros: ${products.length}`, 14, doc.internal.pageSize.height - 10);
  return Buffer.from(doc.output("arraybuffer"));
};

export const createChatMessage = (input: Omit<ChatMessage, "id" | "created_at">) => {
  const message: ChatMessage = { id: id(), created_at: now(), ...input };
  state.chatMessages.push(message);
  return message;
};

export const createChatAction = (input: Omit<ChatAction, "id" | "created_at" | "status">) => {
  const action: ChatAction = { id: id(), status: "proposed", created_at: now(), ...input };
  state.chatActions.push(action);
  return action;
};

export const updateSettings = (body: Record<string, unknown>) => {
  if (body.currency !== undefined) state.settings.currency = requiredString(body.currency, "currency", "currency");
  if (body.openrouter_model !== undefined) {
    state.settings.openrouter_model = requiredString(body.openrouter_model, "openrouter_model", "openrouter_model");
  }
  if (body.low_stock_global_threshold !== undefined) {
    state.settings.low_stock_global_threshold = integerValue(body.low_stock_global_threshold, "low_stock_global_threshold");
  }
  if (Array.isArray(body.active_categories)) {
    state.settings.active_categories = body.active_categories.map(String);
  }
  state.settings.updated_at = now();
  return state.settings;
};
