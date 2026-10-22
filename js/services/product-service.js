import { findDuplicate, product } from "../utils/calculations.js";

export function getProducts(db) {
  return db.products;
}

export function getProduct(db, id) {
  return product(db, id);
}

export function findProductDuplicate(db, cat, brand, model) {
  return findDuplicate(db, cat, brand, model);
}
