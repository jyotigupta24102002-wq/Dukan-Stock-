export function getTransactions(db) {
  return db.tx;
}

export function sortTransactions(list) {
  return [...list].sort(
    (a, b) => b.date.localeCompare(a.date) || b.ts - a.ts
  );
}
