import { inr, dfmt } from "../utils/formatters.js";
import { product, avgCost } from "../utils/calculations.js";
import { esc, armed } from "../utils/helpers.js";

export function historyPage(db, context) {
  const list = db.tx
    .filter((t) => !context.hf || t.type === context.hf)
    .sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts);

  return `
    <div class="d-flex align-items-end justify-content-between gap-3 mb-3">
      <div>
        <div class="small text-muted fw-semibold mb-1">TRANSACTIONS</div>
        <h1>Hisaab</h1>
      </div>
      <span class="badge rounded-pill text-bg-light border text-dark">
        ${list.length} entries
      </span>
    </div>

    <div class="seg mb-3">
      <button class="${context.hf === "" ? "on" : ""}" data-history-filter="">
        Sab
      </button>
      <button class="${context.hf === "in" ? "on" : ""}" data-history-filter="in">
        Aaya
      </button>
      <button class="${context.hf === "out" ? "on out" : ""}" data-history-filter="out">
        Bika
      </button>
    </div>

    ${
      list.length
        ? list
            .map((t) => {
              const p = product(db, t.pid);
              const profit =
                t.type === "out"
                  ? (t.price - avgCost(db, t.pid)) * t.qty
                  : 0;

              return `
                <div class="card">
                  <div class="d-flex justify-content-between gap-3">
                    <div>
                      <span class="tag ${t.type}">
                        ${t.type === "in" ? "AAYA" : "BIKA"}
                      </span>
                      <span class="muted ms-1">${dfmt(t.date)}</span>
                    </div>
                    <b>${inr(t.qty * t.price)}</b>
                  </div>

                  <div class="mt-3">
                    <b>${p ? esc(p.brand + " " + p.model) : "(item deleted)"}</b>
                  </div>

                  <div class="muted mt-1">
                    ${t.qty} piece × ${inr(t.price)}
                  </div>

                  ${
                    t.party
                      ? `<div class="muted mt-2">
                          ${t.type === "in" ? "Supplier" : "Customer"}:
                          ${esc(t.party)}
                        </div>`
                      : ""
                  }

                  ${
                    t.note
                      ? `<div class="muted">${esc(t.note)}</div>`
                      : ""
                  }

                  ${
                    t.type === "out"
                      ? `<div class="small fw-semibold mt-2 ${
                          profit < 0 ? "minus" : "plus"
                        }">
                          Munafa: ${inr(profit)}
                        </div>`
                      : ""
                  }

                  <div class="btns">
                    <button class="danger" data-action="delete-tx" data-id="${t.id}">
                      Entry hatao
                    </button>
                  </div>
                </div>
              `;
            })
            .join("")
        : `
          <div class="card text-center py-5">
            <div class="fs-1 mb-2">📒</div>
            <b>Abhi koi entry nahi hai</b>
            <div class="muted mt-1">Maal aane ya bikne par yahan history dikhegi.</div>
          </div>
        `
    }
  `;
}

export function bindHistoryPage(context) {
  document.querySelectorAll("[data-history-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      context.setFilter(button.dataset.historyFilter);
    });
  });
}
