import assert from "node:assert/strict";
import test from "node:test";
import {
  ApiException,
  createChatAction,
  createImportBatch,
  exportPdf,
  exportRows,
  exportWorkbook,
  parseCsv,
  createMovement,
  createProduct,
  createVariant,
  previewImportRows,
  state,
  syncProductStock,
  updateSettings,
  updateVariantStock,
} from "./store.ts";

const categoryId = state.categories[0].id;

test("SPEC-03: app settings remains a singleton and boot categories exist", () => {
  assert.equal(state.settings.id, 1);
  assert.deepEqual(
    state.categories.map((category) => category.name),
    ["Llaveros", "Imanes", "Camisetas", "Tazas", "Artesanias", "Pulseras"],
  );

  updateSettings({ currency: "CRC" });

  assert.equal(state.settings.id, 1);
  assert.equal(state.settings.currency, "CRC");
});

test("SPEC-03: product stock is calculated from active variants", () => {
  const product = createProduct({
    name: "Taza playa",
    category_id: categoryId,
    stock_current: 0,
  });
  createVariant(product.id, {
    attributes: { color: "Rojo", talla: "M" },
    stock_current: 3,
  });
  const variant = createVariant(product.id, {
    attributes: { color: "Azul", talla: "M" },
    stock_current: 4,
  });

  assert.equal(syncProductStock(product.id).stock_current, 7);

  updateVariantStock(product.id, variant.id, {
    stock_current: 1,
    reason: "Conteo fisico",
  });

  assert.equal(syncProductStock(product.id).stock_current, 4);
  assert.equal(syncProductStock(product.id).status, "active");
});

test("SPEC-03: stock cannot be negative and variant attributes are unique per product", () => {
  const product = createProduct({
    name: "Camisa volcan",
    category_id: categoryId,
  });

  createVariant(product.id, {
    attributes: { Color: "Negro", Talla: "M" },
    stock_current: 1,
  });

  assert.throws(
    () =>
      createVariant(product.id, {
        attributes: { talla: "m", color: "negro" },
        stock_current: 1,
      }),
    ApiException,
  );
  assert.throws(
    () =>
      createVariant(product.id, {
        attributes: { color: "Blanco" },
        stock_current: -1,
      }),
    ApiException,
  );
});

test("SPEC-03: movements capture audit fields and require reason when applicable", () => {
  const product = createProduct({
    name: "Pulsera cafe",
    category_id: categoryId,
  });

  assert.throws(
    () =>
      createMovement({
        product_id: product.id,
        type: "adjustment",
        quantity_before: 1,
        quantity_after: 2,
        origin: "manual",
      }),
    ApiException,
  );

  const action = createChatAction({
    intent: "stock_adjustment",
    parameters: { product_id: product.id },
  });
  const movement = createMovement({
    product_id: product.id,
    type: "chat_action",
    quantity_before: 1,
    quantity_after: 2,
    reason: "Ajuste confirmado",
    origin: "chatbot",
    chat_action_id: action.id,
  });

  assert.equal(movement.quantity_delta, 1);
  assert.equal(movement.origin, "chatbot");
  assert.equal(movement.chat_action_id, action.id);
});

test("SPEC-03: import batches are pending until confirmation or cancellation", () => {
  const batch = createImportBatch(
    "inventario.csv",
    "csv",
    [
      {
        row: 2,
        data: { name: "Llavero", category_id: categoryId },
        type: "product",
        status: "valid",
        errors: [],
      },
      {
        row: 3,
        data: {},
        type: "product",
        status: "error",
        errors: [{ row: 3, field: "name", message: "Nombre requerido" }],
      },
    ],
    [{ row: 3, field: "name", message: "Nombre requerido" }],
  );

  assert.equal(batch.status, "pending");
  assert.equal(batch.total_rows, 2);
  assert.equal(batch.valid_rows, 1);
  assert.equal(batch.warning_rows, 0);
  assert.equal(batch.error_rows, 1);
});

test("SPEC-06: parses product CSV and previews warnings separately from errors", () => {
  const rows = parseCsv(
    [
      "name,category,stock_current,price_sale,supplier,location",
      "Iman playa,Categoria Nueva,12,4.5,Proveedor Nuevo,Estante B",
      "Producto roto,Llaveros,-2,4.5,,",
    ].join("\n"),
  );
  const { preview, errors } = previewImportRows(rows);

  assert.equal(preview[0].status, "warning");
  assert.equal(preview[0].errors[0].severity, "warning");
  assert.equal(preview[1].status, "error");
  assert.equal(errors.length, 1);
});

test("SPEC-06: confirms importable rows and skips error rows", () => {
  const { preview, errors } = previewImportRows(
    parseCsv(
      [
        "name,category,stock_current,stock_minimum,price_purchase,price_sale,supplier,location",
        "Producto importado,Categoria Importada,8,2,1,3,Proveedor Importado,Bodega",
        "Producto invalido,Llaveros,-1,0,1,3,,",
      ].join("\n"),
    ),
  );
  const batch = createImportBatch("productos.csv", "csv", preview, errors);
  const result = state.importBatches.find((entry) => entry.id === batch.id);

  assert.equal(result?.valid_rows, 1);
  assert.equal(result?.warning_rows, 1);
  assert.equal(result?.error_rows, 1);
});

test("SPEC-06: exports CSV, workbook and PDF report outputs", () => {
  const product = createProduct({
    name: "Exportable souvenir",
    category_id: categoryId,
    stock_current: 3,
    price_sale: 7,
  });
  createVariant(product.id, {
    attributes: { color: "verde" },
    stock_current: 3,
  });

  const csv = exportRows([product]);
  const xlsx = exportWorkbook([product]);
  const pdf = exportPdf([product], { status: "active" });

  assert.match(csv, /"Nombre"/);
  assert.ok(xlsx.byteLength > 100);
  assert.ok(pdf.byteLength > 100);
});
