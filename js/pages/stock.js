import { productCard } from "../components/product-card.js";
import { emptyState } from "../components/empty-state.js";
import { esc } from "../utils/helpers.js";

export function stockPage(db, context) {
  const cats = [...new Set(db.products.map((p) => p.cat))];
  const brands = [...new Set(db.products.map((p) => p.brand))].sort();

  const list = db.products.filter(
    (p) =>
      (!context.fc || p.cat === context.fc) &&
      (!context.fb || p.brand === context.fb) &&
      (p.brand + " " + p.model + " " + p.desc)
        .toLowerCase()
        .includes(context.q.toLowerCase())
  );

  return `
    <div class="d-flex align-items-end justify-content-between gap-3 mb-3">
      <div>
        <div class="small text-muted fw-semibold mb-1">Inventory</div>
        <h1>Mera Stock</h1>
      </div>
      <span class="badge rounded-pill text-bg-light border text-dark">
        ${list.length} items
      </span>
    </div>

    ${context.bannerHtml()}

    <div class="card mb-3">
      <div class="input-group">
        <span class="input-group-text bg-transparent border-end-0">⌕</span>
        <input id="qs"
          class="form-control border-start-0"
          placeholder="Brand ya model search karo"
          value="${esc(context.q)}">
      </div>

      <div class="two mt-3">
        <select id="categoryFilter">
          <option value="">Sab type</option>
          ${cats
            .map(
              (c) =>
                `<option value="${esc(c)}" ${
                  c === context.fc ? "selected" : ""
                }>${esc(c)}</option>`
            )
            .join("")}
        </select>

        <select id="brandFilter">
          <option value="">Sab brand</option>
          ${brands
            .map(
              (b) =>
                `<option value="${esc(b)}" ${
                  b === context.fb ? "selected" : ""
                }>${esc(b)}</option>`
            )
            .join("")}
        </select>
      </div>
    </div>

<button
  class="btn"
  data-action="new-product"
  style="width:100%;margin-bottom:12px"
>
  + Naya item jodo
</button>

    ${
      list.length
        ? list.map((p) => productCard(db, p, context.actions)).join("")
        : emptyState("⌕", "Kuch nahi mila.")
    }
  `;
}

export function bindStockPage(context) {
  const search = document.querySelector("#qs");

  if (search) {
    search.addEventListener("input", () => {
      context.setQuery(search.value);
    });
  }

  document
    .querySelector("#categoryFilter")
    ?.addEventListener("change", (e) => {
      context.setCategory(e.target.value);
    });

  document
    .querySelector("#brandFilter")
    ?.addEventListener("change", (e) => {
      context.setBrand(e.target.value);
    });
}
