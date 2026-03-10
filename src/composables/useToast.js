import { reactive } from "vue";

const toasts = reactive([]);
let _id = 0;

function add(type, msg, duration = 3000) {
  const id = _id++;
  toasts.push({ id, type, msg });
  setTimeout(() => remove(id), duration);
}

function remove(id) {
  const i = toasts.findIndex((t) => t.id === id);
  if (i !== -1) toasts.splice(i, 1);
}

export function useToast() {
  return {
    toasts,
    success: (msg) => add("success", msg),
    error: (msg) => add("error", msg, 4500),
    info: (msg) => add("info", msg),
    remove,
  };
}
