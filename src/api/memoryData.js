// In-memory data store - used automatically when API is not reachable

let nextId = { products: 10, tables: 10, comandas: 1, sales: 1, receipts: 1 };

const users = [
  { id: 1, email: 'admin@demo.com', password: 'admin123', name: 'Admin Demo', role: 'admin' },
  { id: 2, email: 'demo@demo.com', password: 'demo123', name: 'Usuario Demo', role: 'user' },
];

const products = [
  { id: 1, name: 'Pollo a la brasa', category: 'plato', price: 35.00, status: 1, image: null },
  { id: 2, name: 'Ceviche', category: 'plato', price: 28.00, status: 1, image: null },
  { id: 3, name: 'Coca Cola 500ml', category: 'bebida', price: 5.00, status: 1, image: null },
  { id: 4, name: 'Agua mineral', category: 'bebida', price: 3.00, status: 1, image: null },
  { id: 5, name: 'Combo familiar', category: 'combo', price: 65.00, status: 1, image: null },
];

const tables = [
  { id: 1, number: 1, name: 'Mesa 1', capacity: 4, status: 'disponible' },
  { id: 2, number: 2, name: 'Mesa 2', capacity: 4, status: 'disponible' },
  { id: 3, number: 3, name: 'Terraza', capacity: 6, status: 'disponible' },
  { id: 4, number: 4, name: 'VIP', capacity: 2, status: 'disponible' },
];

const comandas = [];
const sales = [];
const receipts = [];

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// AUTH
function login(email, password) {
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    const err = new Error('Credenciales incorrectas');
    err.response = { data: { error: 'Credenciales incorrectas' } };
    throw err;
  }
  const { password: _pwd, ...userWithoutPwd } = user;
  return { user: userWithoutPwd, token: 'offline-token-' + Date.now() };
}

// PRODUCTS
function getProducts() {
  return deepClone(products);
}

function createProduct(data) {
  const getName = () => data instanceof FormData ? data.get('name') : data.name;
  const getCategory = () => data instanceof FormData ? data.get('category') : data.category;
  const getPrice = () => data instanceof FormData ? data.get('price') : data.price;
  const getImage = () => data instanceof FormData ? data.get('image') : data.image;

  const imageFile = getImage();
  const product = {
    id: nextId.products++,
    name: getName(),
    category: getCategory(),
    price: parseFloat(getPrice()),
    status: 1,
    image: (imageFile instanceof File) ? URL.createObjectURL(imageFile) : null,
  };
  products.push(product);
  return deepClone(product);
}

function updateProduct(id, data) {
  const idx = products.findIndex(p => p.id === Number(id));
  if (idx === -1) {
    const err = new Error('Producto no encontrado');
    err.response = { data: { error: 'Producto no encontrado' } };
    throw err;
  }
  const getName = () => data instanceof FormData ? data.get('name') : data.name;
  const getCategory = () => data instanceof FormData ? data.get('category') : data.category;
  const getPrice = () => data instanceof FormData ? data.get('price') : data.price;
  const getImage = () => data instanceof FormData ? data.get('image') : data.image;

  const name = getName();
  const category = getCategory();
  const price = getPrice();
  const imageFile = getImage();

  if (name) products[idx].name = name;
  if (category) products[idx].category = category;
  if (price) products[idx].price = parseFloat(price);
  if (imageFile instanceof File) products[idx].image = URL.createObjectURL(imageFile);
  return deepClone(products[idx]);
}

function toggleProductStatus(id, data) {
  const idx = products.findIndex(p => p.id === Number(id));
  if (idx === -1) {
    const err = new Error('Producto no encontrado');
    err.response = { data: { error: 'Producto no encontrado' } };
    throw err;
  }
  products[idx].status = data?.status !== undefined ? Number(data.status) : (products[idx].status ? 0 : 1);
  return deepClone(products[idx]);
}

// TABLES
function getTables() {
  return deepClone(tables);
}

function createTable(data) {
  const maxNumber = tables.reduce((max, t) => Math.max(max, t.number), 0);
  const table = {
    id: nextId.tables++,
    number: maxNumber + 1,
    name: data?.name || '',
    capacity: data?.capacity || 4,
    status: 'disponible',
  };
  tables.push(table);
  return deepClone(table);
}

function updateTable(id, data) {
  const idx = tables.findIndex(t => t.id === Number(id));
  if (idx === -1) {
    const err = new Error('Mesa no encontrada');
    err.response = { data: { error: 'Mesa no encontrada' } };
    throw err;
  }
  if (data?.name !== undefined) tables[idx].name = data.name;
  if (data?.capacity !== undefined) tables[idx].capacity = data.capacity;
  if (data?.status !== undefined) tables[idx].status = data.status;
  return deepClone(tables[idx]);
}

function updateTableStatus(id, data) {
  return updateTable(id, { status: data?.status });
}

// DASHBOARD
function getDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.created_at?.startsWith(today));
  const totalHoy = todaySales.reduce((acc, s) => acc + s.total, 0);

  const productCounts = {};
  sales.forEach(s => {
    s.items?.forEach(item => {
      productCounts[item.product_id] = (productCounts[item.product_id] || 0) + item.quantity;
    });
  });
  const topProductos = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pid]) => products.find(p => p.id === Number(pid)))
    .filter(Boolean);

  return { totalHoy: totalHoy.toFixed(2), topProductos };
}

// RECEIPTS
function getReceipts() {
  return deepClone(receipts);
}

function createReceipt(data, asBlob = false) {
  const sale = sales.find(s => s.id === Number(data?.sale_id));
  const receipt = {
    id: nextId.receipts++,
    number: `B001-${String(nextId.receipts).padStart(6, '0')}`,
    sale_id: data?.sale_id,
    client_name: data?.client_name || 'Cliente General',
    client_doc: data?.client_doc || '-',
    total: sale?.total || 0,
    issue_date: new Date().toISOString(),
    pdf_url: null,
  };
  receipts.push(receipt);
  if (asBlob) {
    const text = [
      '====================================',
      '         BOLETA DE VENTA',
      '      (Modo sin conexión)',
      '====================================',
      `Número    : ${receipt.number}`,
      `Cliente   : ${receipt.client_name}`,
      `Documento : ${receipt.client_doc}`,
      `Total     : S/ ${Number(receipt.total).toFixed(2)}`,
      `Fecha     : ${new Date(receipt.issue_date).toLocaleString('es-PE')}`,
      '====================================',
      'Nota: PDF no disponible en modo offline.',
    ].join('\n');
    return new Blob([text], { type: 'text/plain' });
  }
  return deepClone(receipt);
}

// COMANDAS
function getComandaByTable(tableId) {
  const comanda = comandas.find(c => c.table_id === Number(tableId) && c.status === 'abierta');
  if (!comanda) return null;
  const clone = deepClone(comanda);
  clone.comanda_items = clone.comanda_items.map(item => {
    const product = products.find(p => p.id === item.product_id) || {};
    return { ...item, product, subtotal: (item.quantity * item.price).toFixed(2) };
  });
  return clone;
}

function createComanda(data) {
  const comanda = {
    id: nextId.comandas++,
    table_id: Number(data?.table_id),
    status: 'abierta',
    created_at: new Date().toISOString(),
    comanda_items: [],
  };
  comandas.push(comanda);
  const tableIdx = tables.findIndex(t => t.id === Number(data?.table_id));
  if (tableIdx !== -1) tables[tableIdx].status = 'ocupada';
  return deepClone(comanda);
}

function addComandaItem(comandaId, data) {
  const comanda = comandas.find(c => c.id === Number(comandaId));
  if (!comanda) {
    const err = new Error('Comanda no encontrada');
    err.response = { data: { error: 'Comanda no encontrada' } };
    throw err;
  }
  const product = products.find(p => p.id === Number(data?.product_id));
  if (!product) {
    const err = new Error('Producto no encontrado');
    err.response = { data: { error: 'Producto no encontrado' } };
    throw err;
  }
  const existing = comanda.comanda_items.find(
    i => i.product_id === Number(data?.product_id) && i.status !== 'cancelado'
  );
  if (existing) {
    existing.quantity += data?.quantity || 1;
    existing.subtotal = (existing.quantity * existing.price).toFixed(2);
    return { ...deepClone(existing), product: deepClone(product) };
  }
  const qty = data?.quantity || 1;
  const item = {
    id: Date.now(),
    comanda_id: comanda.id,
    product_id: Number(data?.product_id),
    quantity: qty,
    price: product.price,
    subtotal: (qty * product.price).toFixed(2),
    notes: data?.notes || null,
    status: 'activo',
  };
  comanda.comanda_items.push(item);
  return { ...deepClone(item), product: deepClone(product) };
}

function updateComandaItem(comandaId, itemId, data) {
  const comanda = comandas.find(c => c.id === Number(comandaId));
  if (!comanda) {
    const err = new Error('Comanda no encontrada');
    err.response = { data: { error: 'Comanda no encontrada' } };
    throw err;
  }
  const item = comanda.comanda_items.find(i => i.id === Number(itemId));
  if (!item) {
    const err = new Error('Item no encontrado');
    err.response = { data: { error: 'Item no encontrado' } };
    throw err;
  }
  if (data?.quantity !== undefined) item.quantity = data.quantity;
  if (data?.notes !== undefined) item.notes = data.notes;
  item.subtotal = (item.quantity * item.price).toFixed(2);
  return deepClone(item);
}

function deleteComandaItem(comandaId, itemId) {
  const comanda = comandas.find(c => c.id === Number(comandaId));
  if (!comanda) {
    const err = new Error('Comanda no encontrada');
    err.response = { data: { error: 'Comanda no encontrada' } };
    throw err;
  }
  const item = comanda.comanda_items.find(i => i.id === Number(itemId));
  if (item) item.status = 'cancelado';
  return {};
}

function closeComanda(comandaId, data) {
  const comanda = comandas.find(c => c.id === Number(comandaId));
  if (!comanda) {
    const err = new Error('Comanda no encontrada');
    err.response = { data: { error: 'Comanda no encontrada' } };
    throw err;
  }
  const activeItems = comanda.comanda_items.filter(i => i.status !== 'cancelado');
  const total = activeItems.reduce((acc, i) => acc + Number(i.subtotal), 0);

  comanda.status = 'cerrada';

  const tableIdx = tables.findIndex(t => t.id === comanda.table_id);
  if (tableIdx !== -1) tables[tableIdx].status = 'disponible';

  const sale = {
    id: nextId.sales++,
    total,
    payment_method: data?.payment_method,
    items: activeItems.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price })),
    created_at: new Date().toISOString(),
  };
  sales.push(sale);

  if (data?.generate_receipt) {
    const receipt = {
      id: nextId.receipts++,
      number: `B001-${String(nextId.receipts).padStart(6, '0')}`,
      sale_id: sale.id,
      client_name: data?.client_name || 'Cliente General',
      client_doc: data?.client_doc || '-',
      total,
      issue_date: new Date().toISOString(),
      pdf_url: null,
    };
    receipts.push(receipt);
  }

  return { total: total.toFixed(2), sale_id: sale.id, pdf_url: null };
}

// SALES
function createSale(data) {
  const items = data?.items || [];
  const total = items.reduce((acc, i) => acc + (Number(i.price) * Number(i.quantity)), 0);
  const sale = {
    id: nextId.sales++,
    total,
    items,
    created_at: new Date().toISOString(),
  };
  sales.push(sale);
  return { saleId: sale.id, total: total.toFixed(2) };
}

export {
  login,
  getProducts, createProduct, updateProduct, toggleProductStatus,
  getTables, createTable, updateTable, updateTableStatus,
  getDashboard,
  getReceipts, createReceipt,
  getComandaByTable, createComanda, addComandaItem, updateComandaItem, deleteComandaItem, closeComanda,
  createSale,
};
