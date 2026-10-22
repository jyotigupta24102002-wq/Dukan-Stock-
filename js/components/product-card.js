import { CATS } from "../data/products.js";
import { esc } from "../utils/helpers.js";
import { inr, dfmt } from "../utils/formatters.js";
import { stock, lastIn } from "../utils/calculations.js";

export function productCard(db, p) {
  const s = stock(db, p.id);
  const c = CATS[p.cat] || CATS.Other;
  const li = lastIn(db, p.id);
  const low = s <= 0 ? "zero" : s <= (+p.min || 0) ? "low" : "";

  const spec = p.spec
    ? p.spec + (c[2] ? " " + c[2] : "")
    : "";

  const chips = [p.brand, p.cat, spec, p.wt ? p.wt + " kg" : ""]
    .filter(Boolean)
    .map((x) => `<span class="chip">${esc(x)}</span>`)
    .join("");

  return `
    <div class="card">
      <div class="row">
        <div class="ico">${c[0]}</div>

        <div class="grow">
          <div class="d-flex justify-content-between gap-2">
            <div>
              <b>${esc(p.brand + " " + p.model)}</b>
              <div class="chips">${chips}</div>
            </div>
            <div class="qty ${low}">
              ${s}
              <small>piece</small>
            </div>
          </div>

          ${p.desc ? `<div class="muted">${esc(p.desc)}</div>` : ""}
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-center mt-3 small">
        <span class="muted">
          ${
            li
              ? "Last buy: " + inr(li.price) + " · " + dfmt(li.date)
              : "Abhi tak maal nahi aaya"
          }
        </span>
        ${p.sell ? `<span class="chip">Sell ${inr(p.sell)}</span>` : ""}
      </div>

      ${
        low
          ? `<div class="mt-2 small fw-semibold" style="color:var(--danger)">
              ${s <= 0 ? "Stock khatam hai!" : "Stock kam hai, maal mangwao"}
             </div>`
          : ""
      }

      <div class="btns">
        <button class="btn in" data-action="stock-in" data-id="${p.id}">
          + Aaya
        </button>

        <button class="btn out" data-action="stock-out" data-id="${p.id}">
          − Bika
        </button>

        <button class="ghost" style="flex:0 0 48px"
          data-action="edit-product" data-id="${p.id}">
          ✎
        </button>
      </div>
    </div>
  `;
}
