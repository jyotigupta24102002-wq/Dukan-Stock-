const KEY = "dukaanStockLocal";

export function saveLocal(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch (_) {}
}

export function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { products: [], tx: [] };
  } catch (_) {
    return { products: [], tx: [] };
  }
}

export function localKey() {
  return KEY;
}
