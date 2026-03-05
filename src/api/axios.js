import axios from "axios";
import * as mem from "./memoryData";

export let offlineMode = false;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Parse URL path from config (handles both relative and absolute URLs)
function parsePath(url) {
  if (!url) return "";
  if (url.startsWith("http")) {
    try {
      return new URL(url).pathname.replace(/^\/api/, "");
    } catch {
      return url;
    }
  }
  return url;
}

// Route an offline request to the in-memory store
function handleMemoryRequest(config) {
  const method = config.method?.toLowerCase();
  const path = parsePath(config.url);

  let body = config.data;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { /* keep as-is (e.g. FormData serialized) */ }
  }

  // AUTH
  if (method === "post" && path === "/auth/login") {
    return mem.login(body?.email, body?.password);
  }

  // PRODUCTS
  if (method === "get" && path === "/products") return mem.getProducts();
  if (method === "post" && path === "/products") return mem.createProduct(body);
  const productPut = path.match(/^\/products\/(\d+)$/);
  if (method === "put" && productPut) return mem.updateProduct(productPut[1], body);
  const productStatus = path.match(/^\/products\/(\d+)\/status$/);
  if (method === "patch" && productStatus) return mem.toggleProductStatus(productStatus[1], body);

  // TABLES
  if (method === "get" && path === "/tables") return mem.getTables();
  if (method === "post" && path === "/tables") return mem.createTable(body);
  const tablePut = path.match(/^\/tables\/(\d+)$/);
  if (method === "put" && tablePut) return mem.updateTable(tablePut[1], body);
  const tableStatus = path.match(/^\/tables\/(\d+)\/status$/);
  if (method === "patch" && tableStatus) return mem.updateTableStatus(tableStatus[1], body);

  // DASHBOARD
  if (method === "get" && path === "/dashboard") return mem.getDashboard();

  // RECEIPTS
  if (method === "get" && path === "/receipts") return mem.getReceipts();
  if (method === "post" && path === "/receipts") {
    return mem.createReceipt(body, config.responseType === "blob");
  }

  // COMANDAS
  const comandaTable = path.match(/^\/comandas\/table\/(\d+)$/);
  if (method === "get" && comandaTable) return mem.getComandaByTable(comandaTable[1]);
  if (method === "post" && path === "/comandas") return mem.createComanda(body);
  const comandaItems = path.match(/^\/comandas\/(\d+)\/items$/);
  if (method === "post" && comandaItems) return mem.addComandaItem(comandaItems[1], body);
  const comandaItem = path.match(/^\/comandas\/(\d+)\/items\/(\d+)$/);
  if (method === "put" && comandaItem) return mem.updateComandaItem(comandaItem[1], comandaItem[2], body);
  if (method === "delete" && comandaItem) return mem.deleteComandaItem(comandaItem[1], comandaItem[2]);
  const comandaClose = path.match(/^\/comandas\/(\d+)\/close$/);
  if (method === "post" && comandaClose) return mem.closeComanda(comandaClose[1], body);

  // SALES
  if (method === "post" && path === "/sales") return mem.createSale(body);

  throw Object.assign(new Error(`Endpoint no soportado: ${method?.toUpperCase()} ${path}`), {
    response: { data: { error: `Endpoint no soportado en modo offline: ${method?.toUpperCase()} ${path}` } },
  });
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = !error.response;
    if (isNetworkError) {
      offlineMode = true;
      try {
        const result = handleMemoryRequest(error.config);
        return Promise.resolve({ data: result, status: 200, headers: {}, config: error.config });
      } catch (memError) {
        return Promise.reject(memError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
