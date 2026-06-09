export type ProductStatus = "active" | "out_of_stock" | "discontinued";
export type VariantStatus = ProductStatus;
export type MovementType =
  | "entry"
  | "exit"
  | "adjustment"
  | "edit"
  | "deactivation"
  | "import"
  | "chat_action";
export type MovementOrigin = "manual" | "import" | "chatbot";
export type ImportStatus = "pending" | "confirmed" | "cancelled";
export type ChatActionStatus = "proposed" | "confirmed" | "rejected" | "executed";
export type ChatIntent =
  | "query"
  | "create"
  | "update"
  | "stock_adjustment"
  | "deactivate"
  | "history";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BUSINESS_RULE_VIOLATION"
  | "INTERNAL_ERROR"
  | "AI_UNAVAILABLE";

export type ApiError = {
  error: string;
  code: ApiErrorCode;
  field?: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
};

export type Supplier = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  category_id: string;
  description?: string;
  stock_current: number;
  stock_minimum: number;
  price_purchase: number;
  price_sale: number;
  supplier_id?: string;
  location?: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
};

export type Variant = {
  id: string;
  product_id: string;
  attributes: Record<string, string>;
  sku?: string;
  stock_current: number;
  stock_minimum: number;
  location?: string;
  status: VariantStatus;
  created_at: string;
  updated_at: string;
};

export type InventoryMovement = {
  id: string;
  product_id: string;
  variant_id?: string;
  type: MovementType;
  quantity_before: number;
  quantity_after: number;
  quantity_delta: number;
  reason?: string;
  origin: MovementOrigin;
  import_batch_id?: string;
  chat_action_id?: string;
  created_at: string;
};

export type ImportError = {
  row: number;
  field: string;
  message: string;
  severity?: "warning" | "error";
};

export type ImportPreviewRow = {
  row: number;
  data: Record<string, string>;
  type: "product" | "variant";
  status: "valid" | "warning" | "error";
  errors: ImportError[];
};

export type ImportBatch = {
  id: string;
  filename: string;
  file_type: "csv" | "xlsx";
  total_rows: number;
  valid_rows: number;
  warning_rows: number;
  error_rows: number;
  status: ImportStatus;
  preview: ImportPreviewRow[];
  errors: ImportError[];
  created_at: string;
  confirmed_at?: string;
};

export type ChatAction = {
  id: string;
  intent: ChatIntent;
  parameters: Record<string, unknown>;
  status: ChatActionStatus;
  result?: Record<string, unknown>;
  created_at: string;
  confirmed_at?: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  message: string;
  action_id?: string;
  created_at: string;
};

export type AppSettings = {
  id: 1;
  currency: string;
  openrouter_model: string;
  low_stock_global_threshold?: number;
  active_categories: string[];
  updated_at: string;
};

export type InventoryState = {
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  variants: Variant[];
  movements: InventoryMovement[];
  importBatches: ImportBatch[];
  chatActions: ChatAction[];
  chatMessages: ChatMessage[];
  settings: AppSettings;
};
