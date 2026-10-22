export function stock(db, id) {
  return db.tx
    .filter((t) => t.pid === id)
    .reduce((a, t) => a + (t.type === "in" ? t.qty : -t.qty), 0);
}

export function avgCost(db, id) {
  const incoming = db.tx.filter((t) => t.pid === id && t.type === "in");
  const totalQty = incoming.reduce((a, t) => a + t.qty, 0);

  return totalQty
    ? incoming.reduce((a, t) => a + t.qty * t.price, 0) / totalQty
    : 0;
}

export function lastIn(db, id) {
  return db.tx
    .filter((t) => t.pid === id && t.type === "in")
    .sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts)[0];
}

export function product(db, id) {
  return db.products.find((p) => p.id === id);
}

export function findDuplicate(db, cat, brand, model) {
  return db.products.find(
    (p) =>
      p.cat === cat &&
      p.brand.toLowerCase() === brand.toLowerCase() &&
      p.model.toLowerCase() === model.toLowerCase()
  );
}
