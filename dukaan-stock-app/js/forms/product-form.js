import { CATS } from "../data/products.js";
import { esc, val, uid } from "../utils/helpers.js";
import { today } from "../utils/formatters.js";
import { findDuplicate } from "../utils/calculations.js";
import { openModal, closeModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";

import {
  validateProduct,
  validateInitialStock,
  firstValidationError
} from "../utils/validators.js";


function specFields(p, pre) {
  const c = CATS[p.cat] || CATS.Other;

  return `
    <div class="two">
      <div>
        <label id="${pre}sl">${c[1]} (${c[2] || "likho"})</label>
        <input
          id="${pre}spec"
          inputmode="decimal"
          placeholder="e.g. 43"
          value="${esc(p.spec || "")}"
        >
      </div>

      <div>
        <label>Weight (kg) – bade item ka</label>
        <input
          id="${pre}wt"
          inputmode="decimal"
          placeholder="e.g. 9.5"
          value="${esc(p.wt || "")}"
        >
      </div>
    </div>
  `;
}


function catSel(id, current) {
  return `
    <select id="${id}">
      ${Object.keys(CATS)
        .map(
          (key) =>
            `<option value="${esc(key)}" ${
              key === current ? "selected" : ""
            }>${esc(key)}</option>`
        )
        .join("")}
    </select>
  `;
}


export function openItemForm(db, context, id) {
  const p = id
    ? context.product(id)
    : {
        cat: "TV",
        brand: "",
        model: "",
        spec: "",
        wt: "",
        desc: "",
        sell: 0,
        min: 2
      };

  openModal(`
    <h1>${id ? "Item badlo" : "Naya item jodo"}</h1>

    <label>Kis type ka item?</label>
    ${catSel("f_cat", p.cat)}

    <div class="two">
      <div>
        <label>Brand (type karo ya list se chuno)</label>
        <input
          id="f_brand"
          list="brands"
          placeholder="Samsung, LG, Sony"
          value="${esc(p.brand || "")}"
        >
      </div>

      <div>
        <label>Model naam / number</label>
        <input
          id="f_model"
          placeholder="e.g. UA43T5350"
          value="${esc(p.model || "")}"
        >
      </div>
    </div>

    ${specFields(p, "f_")}

    <label>Description (optional)</label>
    <textarea
      id="f_desc"
      rows="2"
      placeholder="Smart LED, 4K, 5 star..."
    >${esc(p.desc || "")}</textarea>

    <div class="two">
      <div>
        <label>Bechne ka rate (₹)</label>
        <input
          id="f_sell"
          inputmode="decimal"
          placeholder="e.g. 25000"
          value="${esc(p.sell ?? "")}"
        >
      </div>

      <div>
        <label>Itne se kam bache to batao</label>
        <input
          id="f_min"
          inputmode="numeric"
          placeholder="e.g. 2"
          value="${p.min == null ? 2 : esc(p.min)}"
        >
      </div>
    </div>

    ${
      id
        ? ""
        : `
          <h2>Pehla stock (agar abhi hai)</h2>

          <div class="two">
            <div>
              <label>Kitne piece?</label>
              <input
                id="f_qty"
                inputmode="numeric"
                placeholder="0"
              >
            </div>

            <div>
              <label>Kharid rate (₹/piece)</label>
              <input
                id="f_buy"
                inputmode="decimal"
                placeholder="e.g. 18000"
              >
            </div>
          </div>

          <label>Kab aaya?</label>
          <input
            id="f_date"
            type="date"
            value="${today()}"
          >
        `
    }

    <div class="btns" style="margin-top:20px">
      <button class="ghost" id="cancelProduct">
        Cancel
      </button>

      <button class="btn" id="saveProduct">
        Save karo
      </button>
    </div>

    ${
      id
        ? `
          <div class="btns">
            <button class="danger" id="deleteProduct">
              Ye item hata do
            </button>
          </div>
        `
        : ""
    }
  `);

  document
    .querySelector("#cancelProduct")
    ?.addEventListener("click", closeModal);


  document
    .querySelector("#f_cat")
    ?.addEventListener("change", () => {
      const c = CATS[val("f_cat")] || CATS.Other;

      const label = document.querySelector("#f_sl");

      if (label) {
        label.textContent =
          c[1] + " (" + (c[2] || "likho") + ")";
      }
    });


  document
    .querySelector("#saveProduct")
    ?.addEventListener("click", () =>
      saveItem(db, context, id)
    );


  document
    .querySelector("#deleteProduct")
    ?.addEventListener("click", async (event) => {
      context.armed(
        event.currentTarget,
        async () => {
          try {
            const result = await context.deleteItem(id);

            if (result === false) {
              showToast("Item delete nahi hua");
              return;
            }

            closeModal();
            context.render();
            showToast("Item delete ho gaya");
          } catch (error) {
            console.error("Delete product error:", error);

            showToast(
              getFirebaseErrorMessage(error, "Item delete nahi hua")
            );
          }
        }
      );
    });
}


/**
 * Save / update product
 */
async function saveItem(db, context, id) {

  // -----------------------------
  // 1. Product data
  // -----------------------------

  const productInput = {
    cat: val("f_cat"),
    brand: val("f_brand"),
    model: val("f_model"),
    spec: val("f_spec"),
    wt: val("f_wt"),
    desc: val("f_desc"),
    sell: val("f_sell"),
    min: val("f_min")
  };


  // -----------------------------
  // 2. Validate product
  // -----------------------------

  const productValidation =
    validateProduct(productInput);

  if (!productValidation.valid) {
    showToast(
      firstValidationError(productValidation.errors)
    );
    focusValidationField(
      productValidation.errors
    );
    return;
  }


  const data = {
    cat: productInput.cat,
    brand: productValidation.values.brand,
    model: productValidation.values.model,
    spec: productValidation.values.spec,
    wt: productValidation.values.wt,
    desc: productValidation.values.desc,
    sell: productValidation.values.sell,
    min: productValidation.values.min
  };


  // -----------------------------
  // 3. Category validation
  // -----------------------------

  if (!CATS[data.cat]) {
    showToast("Please valid category select karo");
    document.querySelector("#f_cat")?.focus();
    return;
  }


  // -----------------------------
  // 4. Duplicate product
  // -----------------------------

  const duplicate = findDuplicate(
    db,
    data.cat,
    data.brand,
    data.model
  );

  if (duplicate && duplicate.id !== id) {
    showToast(
      "Ye item pehle se list mein hai"
    );

    document.querySelector("#f_model")?.focus();

    return;
  }


  // -----------------------------
  // 5. Update existing product
  // -----------------------------

  if (id) {

    const old = context.product(id);

    if (!old) {
      showToast("Item nahi mila");
      return;
    }

    try {
      const saved = await context.put(
        "products",
        {
          ...old,
          ...data
        }
      );

      if (!saved) {
        showToast("Item save nahi hua");
        return;
      }

    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      showToast(
        getFirebaseErrorMessage(
          error,
          "Item update nahi hua"
        )
      );

      return;
    }

    closeModal();
    context.render();

    showToast("Item update ho gaya");
    return;
  }


  // -----------------------------
  // 6. Validate initial stock
  // -----------------------------

  const stockValidation =
    validateInitialStock({
      qty: val("f_qty"),
      buy: val("f_buy"),
      date: val("f_date")
    });


  if (!stockValidation.valid) {
    showToast(
      firstValidationError(
        stockValidation.errors
      )
    );

    focusInitialStockField(
      stockValidation.errors
    );

    return;
  }


  // -----------------------------
  // 7. Create product
  // -----------------------------

  data.id = uid();

  try {

    const saved = await context.put(
      "products",
      data
    );

    if (!saved) {
      showToast("Product save nahi hua");
      return;
    }

  } catch (error) {

    console.error(
      "Create product error:",
      error
    );

    showToast(
      getFirebaseErrorMessage(
        error,
        "Product save nahi hua"
      )
    );

    return;
  }


  // -----------------------------
  // 8. Add initial stock
  // -----------------------------

  const qty = stockValidation.values.qty;

  if (qty > 0) {

    try {

      const savedTransaction =
        await context.put(
          "tx",
          {
            id: uid(),
            ts: Date.now(),
            pid: data.id,
            type: "in",
            date: stockValidation.values.date,
            qty,
            price: stockValidation.values.buy,
            party: "",
            note: "Pehla stock"
          }
        );

      if (!savedTransaction) {

        /*
         * Product already got saved.
         * Do not pretend everything succeeded.
         */
        showToast(
          "Product save ho gaya, lekin initial stock save nahi hua"
        );

        return;
      }

    } catch (error) {

      console.error(
        "Initial stock error:",
        error
      );

      showToast(
        "Product save ho gaya, lekin initial stock save nahi hua"
      );

      return;
    }
  }


  // -----------------------------
  // 9. Done
  // -----------------------------

  closeModal();
  context.render();

  showToast("Product save ho gaya");
}


/**
 * Focus first invalid product field
 */
function focusValidationField(errors) {
  const fieldMap = {
    cat: "f_cat",
    brand: "f_brand",
    model: "f_model",
    spec: "f_spec",
    wt: "f_wt",
    desc: "f_desc",
    sell: "f_sell",
    min: "f_min"
  };

  const firstKey = Object.keys(errors || {})[0];

  const fieldId = fieldMap[firstKey];

  if (fieldId) {
    setTimeout(() => {
      document.querySelector(`#${fieldId}`)?.focus();
    }, 50);
  }
}


/**
 * Focus first invalid initial-stock field
 */
function focusInitialStockField(errors) {
  const fieldMap = {
    qty: "f_qty",
    buy: "f_buy",
    date: "f_date"
  };

  const firstKey = Object.keys(errors || {})[0];

  const fieldId = fieldMap[firstKey];

  if (fieldId) {
    setTimeout(() => {
      document.querySelector(`#${fieldId}`)?.focus();
    }, 50);
  }
}


/**
 * Convert Firebase errors into
 * simple user-friendly messages.
 */
function getFirebaseErrorMessage(
  error,
  fallback = "Something went wrong"
) {
  const code = error?.code || "";

  const messages = {
    "permission-denied":
      "Aapko is action ki permission nahi hai",

    "unauthenticated":
      "Session expire ho gaya. Please login again",

    "unavailable":
      "Internet/Firebase connection available nahi hai",

    "network-request-failed":
      "Network error. Internet connection check karo",

    "failed-precondition":
      "Firebase operation complete nahi ho saki",

    "already-exists":
      "Ye record already exist karta hai",

    "not-found":
      "Record nahi mila",

    "deadline-exceeded":
      "Request mein zyada time lag gaya. Please try again"
  };

  return messages[code] || fallback;
}