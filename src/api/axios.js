// ============================================================
// MOCK API - Funciona completamente en memoria, sin backend
// Credenciales de prueba: admin@demo.com / 1234
// ============================================================

let _id = 100;
const newId = () => ++_id;

const db = {
  users: [
    { id: 1, name: "Admin", email: "admin@demo.com", password: "1234" },
  ],

  products: [
    { id: 1, name: "Pollo a la brasa", category: "plato", price: 25.0, status: 1, image: null },
    { id: 2, name: "Lomo saltado", category: "plato", price: 28.0, status: 1, image: null },
    { id: 3, name: "Arroz con leche", category: "plato", price: 8.0, status: 1, image: null },
    { id: 4, name: "Inca Kola 500ml", category: "bebida", price: 5.0, status: 1, image: null },
    { id: 5, name: "Agua mineral", category: "bebida", price: 3.0, status: 1, image: null },
    { id: 6, name: "Combo familiar", category: "combo", price: 55.0, status: 1, image: null },
  ],

  sales: [],
  receipts: [],

  tables: [
    { id: 1, number: 1, name: "Terraza", capacity: 4, status: "disponible" },
    { id: 2, number: 2, name: "Interior", capacity: 6, status: "disponible" },
    { id: 3, number: 3, name: "VIP", capacity: 2, status: "disponible" },
    { id: 4, number: 4, name: "", capacity: 4, status: "disponible" },
  ],

  // { id, table_id, status: 'abierta'|'cerrada', comanda_items: [] }
  // item: { id, product: {id,name,price}, quantity, notes, subtotal, status }
  comandas: [],
};

const mockError = (message, status = 400) => {
  const err = new Error(message);
  err.response = { data: { error: message }, status };
  return err;
};

const delay = () => new Promise((r) => setTimeout(r, 80));

async function handle(method, url, data = {}, config = {}) {
  await delay();

  // ── Auth ─────────────────────────────────────────────────────────────────

  if (method === "post" && url === "/auth/login") {
    const user = db.users.find(
      (u) => u.email === data.email && u.password === data.password
    );
    if (!user) throw mockError("Credenciales incorrectas", 401);
    return {
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        token: "mock-token-" + Date.now(),
      },
    };
  }

  // ── Products ──────────────────────────────────────────────────────────────

  if (method === "get" && url === "/products") {
    return { data: [...db.products] };
  }

  if (method === "post" && url === "/products") {
    const fd = data;
    const image = fd.get("image") ? URL.createObjectURL(fd.get("image")) : null;
    const product = {
      id: newId(),
      name: fd.get("name"),
      category: fd.get("category"),
      price: Number(fd.get("price")),
      status: 1,
      image,
    };
    db.products.push(product);
    return { data: product };
  }

  const putProductMatch = url.match(/^\/products\/(\d+)$/);
  if (method === "put" && putProductMatch) {
    const p = db.products.find((p) => p.id === Number(putProductMatch[1]));
    if (!p) throw mockError("Producto no encontrado", 404);
    const fd = data;
    p.name = fd.get("name");
    p.category = fd.get("category");
    p.price = Number(fd.get("price"));
    if (fd.get("image")) p.image = URL.createObjectURL(fd.get("image"));
    return { data: p };
  }

  const patchProductStatus = url.match(/^\/products\/(\d+)\/status$/);
  if (method === "patch" && patchProductStatus) {
    const p = db.products.find((p) => p.id === Number(patchProductStatus[1]));
    if (!p) throw mockError("Producto no encontrado", 404);
    p.status = data.status;
    return { data: p };
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  if (method === "get" && url === "/dashboard") {
    const today = new Date().toDateString();
    const todaySales = db.sales.filter(
      (s) => new Date(s.created_at).toDateString() === today
    );
    const totalHoy = todaySales.reduce((acc, s) => acc + s.total, 0).toFixed(2);

    const counts = {};
    db.sales.forEach((s) =>
      s.items.forEach((i) => {
        counts[i.product_id] = (counts[i.product_id] || 0) + i.quantity;
      })
    );
    const topProductos = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pid]) => db.products.find((p) => p.id === Number(pid)))
      .filter(Boolean);

    return { data: { totalHoy, topProductos } };
  }

  // ── Receipts ──────────────────────────────────────────────────────────────

  if (method === "get" && url === "/receipts") {
    return { data: [...db.receipts] };
  }

  if (method === "post" && url === "/receipts") {
    const sale = db.sales.find((s) => s.id === Number(data.sale_id));
    const receipt = {
      id: newId(),
      number: "B001-" + String(db.receipts.length + 1).padStart(6, "0"),
      sale_id: data.sale_id,
      client_name: data.client_name || "Cliente General",
      client_doc: data.client_doc || "-",
      total: sale ? sale.total.toFixed(2) : "0.00",
      issue_date: new Date().toISOString(),
      pdf_url: null,
    };
    db.receipts.push(receipt);

    if (config.responseType === "blob") {
      const text = [
        "BOLETA DE VENTA",
        `Numero: ${receipt.number}`,
        `Cliente: ${receipt.client_name}`,
        `Documento: ${receipt.client_doc}`,
        `Total: S/ ${receipt.total}`,
        `Fecha: ${new Date().toLocaleString("es-PE")}`,
      ].join("\n");
      return { data: new Blob([text], { type: "application/pdf" }) };
    }

    return { data: receipt };
  }

  // ── Sales ─────────────────────────────────────────────────────────────────

  if (method === "post" && url === "/sales") {
    const total = data.items.reduce(
      (acc, i) => acc + i.price * i.quantity,
      0
    );
    const sale = {
      id: newId(),
      items: data.items,
      total,
      created_at: new Date().toISOString(),
    };
    db.sales.push(sale);
    return { data: { saleId: sale.id, total: total.toFixed(2) } };
  }

  // ── Tables ────────────────────────────────────────────────────────────────

  if (method === "get" && url === "/tables") {
    return { data: [...db.tables] };
  }

  if (method === "post" && url === "/tables") {
    const table = {
      id: newId(),
      number: db.tables.length + 1,
      name: data.name || "",
      capacity: data.capacity || 4,
      status: "disponible",
    };
    db.tables.push(table);
    return { data: table };
  }

  const putTableMatch = url.match(/^\/tables\/(\d+)$/);
  if (method === "put" && putTableMatch) {
    const t = db.tables.find((t) => t.id === Number(putTableMatch[1]));
    if (!t) throw mockError("Mesa no encontrada", 404);
    Object.assign(t, data);
    return { data: t };
  }

  const patchTableStatus = url.match(/^\/tables\/(\d+)\/status$/);
  if (method === "patch" && patchTableStatus) {
    const t = db.tables.find((t) => t.id === Number(patchTableStatus[1]));
    if (!t) throw mockError("Mesa no encontrada", 404);
    t.status = data.status;
    return { data: t };
  }

  // ── Comandas ──────────────────────────────────────────────────────────────

  const getComandaTable = url.match(/^\/comandas\/table\/(\d+)$/);
  if (method === "get" && getComandaTable) {
    const tableId = Number(getComandaTable[1]);
    const comanda = db.comandas.find(
      (c) => c.table_id === tableId && c.status === "abierta"
    );
    if (!comanda) throw mockError("No hay comanda activa", 404);
    return { data: comanda };
  }

  if (method === "post" && url === "/comandas") {
    const tableId = Number(data.table_id);
    const table = db.tables.find((t) => t.id === tableId);
    if (table) table.status = "ocupada";
    const comanda = {
      id: newId(),
      table_id: tableId,
      status: "abierta",
      comanda_items: [],
    };
    db.comandas.push(comanda);
    return { data: comanda };
  }

  const postComandaItem = url.match(/^\/comandas\/(\d+)\/items$/);
  if (method === "post" && postComandaItem) {
    const comanda = db.comandas.find((c) => c.id === Number(postComandaItem[1]));
    if (!comanda) throw mockError("Comanda no encontrada", 404);
    const product = db.products.find((p) => p.id === Number(data.product_id));
    if (!product) throw mockError("Producto no encontrado", 404);

    const existing = comanda.comanda_items.find(
      (i) => i.product.id === product.id && i.status !== "cancelado"
    );
    if (existing) {
      existing.quantity += data.quantity || 1;
      existing.subtotal = existing.quantity * Number(product.price);
      return { data: existing };
    }

    const qty = data.quantity || 1;
    const item = {
      id: newId(),
      product: { id: product.id, name: product.name, price: product.price },
      product_id: product.id,
      quantity: qty,
      notes: data.notes || null,
      subtotal: qty * Number(product.price),
      status: "pendiente",
    };
    comanda.comanda_items.push(item);
    return { data: item };
  }

  const putComandaItem = url.match(/^\/comandas\/(\d+)\/items\/(\d+)$/);
  if (method === "put" && putComandaItem) {
    const comanda = db.comandas.find((c) => c.id === Number(putComandaItem[1]));
    if (!comanda) throw mockError("Comanda no encontrada", 404);
    const item = comanda.comanda_items.find((i) => i.id === Number(putComandaItem[2]));
    if (!item) throw mockError("Item no encontrado", 404);
    item.quantity = data.quantity;
    item.notes = data.notes !== undefined ? data.notes : item.notes;
    item.subtotal = item.quantity * Number(item.product.price);
    return { data: item };
  }

  const deleteComandaItem = url.match(/^\/comandas\/(\d+)\/items\/(\d+)$/);
  if (method === "delete" && deleteComandaItem) {
    const comanda = db.comandas.find((c) => c.id === Number(deleteComandaItem[1]));
    if (!comanda) throw mockError("Comanda no encontrada", 404);
    const item = comanda.comanda_items.find((i) => i.id === Number(deleteComandaItem[2]));
    if (item) item.status = "cancelado";
    return { data: { ok: true } };
  }

  const closeComanda = url.match(/^\/comandas\/(\d+)\/close$/);
  if (method === "post" && closeComanda) {
    const comanda = db.comandas.find((c) => c.id === Number(closeComanda[1]));
    if (!comanda) throw mockError("Comanda no encontrada", 404);

    const activeItems = comanda.comanda_items.filter(
      (i) => i.status !== "cancelado"
    );
    const total = activeItems.reduce((acc, i) => acc + Number(i.subtotal), 0);

    const sale = {
      id: newId(),
      items: activeItems.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
        price: i.product.price,
      })),
      total,
      payment_method: data.payment_method,
      created_at: new Date().toISOString(),
    };
    db.sales.push(sale);

    comanda.status = "cerrada";

    const table = db.tables.find((t) => t.id === comanda.table_id);
    if (table) table.status = "disponible";

    let pdf_url = null;
    if (data.generate_receipt) {
      const receipt = {
        id: newId(),
        number: "B001-" + String(db.receipts.length + 1).padStart(6, "0"),
        sale_id: sale.id,
        client_name: data.client_name || "Cliente General",
        client_doc: data.client_doc || "-",
        total: total.toFixed(2),
        issue_date: new Date().toISOString(),
        pdf_url: null,
      };
      db.receipts.push(receipt);
    }

    return { data: { total: total.toFixed(2), pdf_url } };
  }

  throw mockError(`Ruta no encontrada: ${method.toUpperCase()} ${url}`, 404);
}

// Objeto que imita la interfaz de axios
const api = {
  defaults: { headers: { common: {} } },
  interceptors: { request: { use: () => {} }, response: { use: () => {} } },
  get: (url, config) => handle("get", url, {}, config),
  post: (url, data, config) => handle("post", url, data, config),
  put: (url, data, config) => handle("put", url, data, config),
  patch: (url, data, config) => handle("patch", url, data, config),
  delete: (url, config) => handle("delete", url, {}, config),
};

export default api;
