import { CATS } from "../data/products.js";
import { esc, val, uid } from "../utils/helpers.js";
import { today, inr } from "../utils/formatters.js";
import { findDuplicate, lastIn, stock } from "../utils/calculations.js";
import { openModal, closeModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";

import {
  validateProduct,
  validateTransaction,
  firstValidationError
} from "../utils/validators.js";


let moveState = {
  type: "in",
  isNew: false
};


/* ---------------------------------------------
   Specification fields
--------------------------------------------- */

function specFields(p, pre) {
  const c = CATS[p.cat] || CATS.Other;

  return `
    <div class="two">
      <div>
        <label id="${pre}sl">
          ${c[1]} (${c[2] || "likho"})
        </label>

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


/* ---------------------------------------------
   Category select
--------------------------------------------- */

function catSel(id, current) {
  return `
    <select id="${id}">
      ${Object.keys(CATS)
        .map(
          (key) =>
            `<option value="${esc(key)}" ${
              key === current ? "selected" : ""
            }>
              ${esc(key)}
            </option>`
        )
        .join("")}
    </select>
  `;
}


/* ---------------------------------------------
   Open transaction modal
--------------------------------------------- */

export function openMoveForm(db, context, type, pid) {

  moveState = {
    type,
    isNew: type === "in" && !db.products.length
  };

  const p = { cat: "TV" };

  openModal(`
    <h1>Maal ka hisaab likho</h1>

    <div class="seg">
      <button id="b_in">＋ Maal Aaya</button>
      <button id="b_out">－ Maal Bika</button>
    </div>

    <div class="seg" id="newseg">
      <button id="b_old">Purana item</button>
      <button id="b_new">➕ Naya item</button>
    </div>

    <div id="oldbox">
      <label>Kaun sa item?</label>

      <select id="m_pid">
        ${db.products
          .map(
            (x) =>
              `<option value="${esc(x.id)}" ${
                x.id === pid ? "selected" : ""
              }>
                ${esc(
                  x.brand +
                    " " +
                    x.model +
                    (x.spec ? " (" + x.spec + ")" : "")
                )}
              </option>`
          )
          .join("")}
      </select>
    </div>


    <div id="newbox" style="display:none">

      <label>Kis type ka item?</label>
      ${catSel("n_cat", "TV")}

      <div class="two">

        <div>
          <label>Brand (type karo ya list se chuno)</label>

          <input
            id="n_brand"
            list="brands"
            placeholder="Sony, Samsung..."
          >
        </div>

        <div>
          <label>Model naam / number</label>

          <input
            id="n_model"
            placeholder="e.g. KD-43X75"
          >
        </div>

      </div>

      ${specFields(p, "n_")}

      <label>Description (optional)</label>

      <input
        id="n_desc"
        maxlength="250"
        placeholder="Smart LED, 4K, 5 star..."
      >

      <label>Bechne ka rate (₹, optional)</label>

      <input
        id="n_sell"
        inputmode="decimal"
        placeholder="e.g. 25000"
      >

    </div>


    <div class="two">

      <div>
        <label>Kitne piece?</label>

        <input
          id="m_qty"
          inputmode="numeric"
          value="1"
          min="1"
        >
      </div>

      <div>

        <label id="m_pl">
          Rate (₹/piece)
        </label>

        <input
          id="m_price"
          inputmode="decimal"
          placeholder="e.g. 1000"
        >

      </div>

    </div>


    <label>Date</label>

    <input
      id="m_date"
      type="date"
      value="${today()}"
    >


    <label id="m_ptl">
      Kisse liya?
    </label>

    <input
      id="m_party"
      maxlength="100"
      placeholder="Naam (optional)"
    >


    <label>Note (optional)</label>

    <input
      id="m_note"
      maxlength="250"
      placeholder="Bill number, warranty..."
    >


    <div class="hint" id="m_hint"></div>


    <div class="btns" style="margin-top:20px">

      <button class="ghost" id="cancelMove">
        Cancel
      </button>

      <button class="btn" id="m_save">
        Save karo
      </button>

    </div>
  `);


  document
    .querySelector("#b_in")
    ?.addEventListener("click", () =>
      setType(db, context, "in")
    );


  document
    .querySelector("#b_out")
    ?.addEventListener("click", () =>
      setType(db, context, "out")
    );


  document
    .querySelector("#b_old")
    ?.addEventListener("click", () =>
      setNew(db, context, false)
    );


  document
    .querySelector("#b_new")
    ?.addEventListener("click", () =>
      setNew(db, context, true)
    );


  document
    .querySelector("#m_pid")
    ?.addEventListener("change", () =>
      moveFill(db, context)
    );


  document
    .querySelector("#m_qty")
    ?.addEventListener("input", () =>
      moveCalc(db)
    );


  document
    .querySelector("#m_price")
    ?.addEventListener("input", () =>
      moveCalc(db)
    );


  document
    .querySelector("#cancelMove")
    ?.addEventListener("click", closeModal);


  document
    .querySelector("#m_save")
    ?.addEventListener("click", () =>
      saveMove(db, context)
    );


  setType(db, context, type);
}


/* ---------------------------------------------
   Transaction type
--------------------------------------------- */

function setType(db, context, type) {

  moveState.type = type;

  if (type === "out") {
    moveState.isNew = false;
  }

  if (type === "in" && !db.products.length) {
    moveState.isNew = true;
  }


  const inButton =
    document.querySelector("#b_in");

  const outButton =
    document.querySelector("#b_out");

  if (inButton) {
    inButton.className =
      type === "in" ? "on in" : "";
  }

  if (outButton) {
    outButton.className =
      type === "out" ? "on out" : "";
  }


  const priceLabel =
    document.querySelector("#m_pl");

  const partyLabel =
    document.querySelector("#m_ptl");

  const saveButton =
    document.querySelector("#m_save");

  const newSegment =
    document.querySelector("#newseg");


  if (priceLabel) {
    priceLabel.textContent =
      type === "in"
        ? "Kharid rate (₹/piece)"
        : "Bechne ka rate (₹/piece)";
  }


  if (partyLabel) {
    partyLabel.textContent =
      type === "in"
        ? "Kisse liya? (supplier)"
        : "Kisko becha? (customer)";
  }


  if (saveButton) {
    saveButton.className =
      "btn " + type;
  }


  if (newSegment) {
    newSegment.style.display =
      type === "in" && db.products.length
        ? "grid"
        : "none";
  }


  setNew(
    db,
    context,
    moveState.isNew
  );
}


/* ---------------------------------------------
   Existing / New item
--------------------------------------------- */

function setNew(db, context, isNew) {

  moveState.isNew = isNew;

  const oldButton =
    document.querySelector("#b_old");

  const newButton =
    document.querySelector("#b_new");

  const oldBox =
    document.querySelector("#oldbox");

  const newBox =
    document.querySelector("#newbox");


  if (oldButton) {
    oldButton.className =
      !isNew ? "on" : "";
  }

  if (newButton) {
    newButton.className =
      isNew ? "on" : "";
  }


  if (oldBox) {
    oldBox.style.display =
      isNew ? "none" : "block";
  }

  if (newBox) {
    newBox.style.display =
      isNew ? "block" : "none";
  }


  const hint =
    document.querySelector("#m_hint");


  if (
    !db.products.length &&
    moveState.type === "out" &&
    hint
  ) {
    hint.textContent =
      'Pehle "Maal Aaya" mein item jodo.';
  }


  moveFill(db, context);
}


/* ---------------------------------------------
   Auto-fill price
--------------------------------------------- */

function moveFill(db, context) {

  const pid =
    document.querySelector("#m_pid")?.value;

  const p =
    pid && context.product(pid);


  if (moveState.isNew) {

    const price =
      document.querySelector("#m_price");

    if (price) {
      price.value = "";
    }

  } else if (p) {

    const li =
      lastIn(db, p.id);

    const price =
      document.querySelector("#m_price");


    if (price) {
      price.value =
        moveState.type === "in"
          ? li
            ? li.price
            : ""
          : p.sell || "";
    }
  }


  moveCalc(db);
}


/* ---------------------------------------------
   Calculation preview
--------------------------------------------- */

function moveCalc(db) {

  const qtyRaw =
    document.querySelector("#m_qty")?.value || "";

  const priceRaw =
    document.querySelector("#m_price")?.value || "";

  const qty =
    Number(qtyRaw);

  const price =
    Number(priceRaw);

  const pid =
    document.querySelector("#m_pid")?.value;


  const safeQty =
    Number.isFinite(qty) ? qty : 0;

  const safePrice =
    Number.isFinite(price) ? price : 0;


  let html =
    `Total: <b>${inr(
      safeQty * safePrice
    )}</b>`;


  if (!moveState.isNew && pid) {

    html =
      `Abhi stock mein: <b>${
        stock(db, pid)
      } piece</b><br>` +
      html;


    if (
      moveState.type === "out" &&
      safePrice > 0
    ) {

      html +=
        `<br>Munafa: <b>${inr(
          (safePrice -
            contextAvgCost(db, pid)) *
            safeQty
        )}</b>`;
    }
  }


  const hint =
    document.querySelector("#m_hint");

  if (hint) {
    hint.innerHTML = html;
  }
}


/* ---------------------------------------------
   Average cost
--------------------------------------------- */

function contextAvgCost(db, pid) {

  const incoming =
    db.tx.filter(
      (t) =>
        t.pid === pid &&
        t.type === "in"
    );


  const totalQty =
    incoming.reduce(
      (a, t) =>
        a + Number(t.qty || 0),
      0
    );


  return totalQty
    ? incoming.reduce(
        (a, t) =>
          a +
          Number(t.qty || 0) *
            Number(t.price || 0),
        0
      ) / totalQty
    : 0;
}


/* ---------------------------------------------
   SAVE TRANSACTION
--------------------------------------------- */

async function saveMove(db, context) {

  /* -------------------------------------------
     1. Basic transaction validation
  ------------------------------------------- */

  const transactionInput = {
    pid:
      document.querySelector("#m_pid")?.value ||
      "",

    qty:
      val("m_qty"),

    price:
      val("m_price"),

    date:
      val("m_date"),

    party:
      val("m_party"),

    note:
      val("m_note")
  };


  const validation =
    validateTransaction(
      transactionInput
    );


  if (!validation.valid) {

    showToast(
      firstValidationError(
        validation.errors
      )
    );

    focusTransactionField(
      validation.errors
    );

    return;
  }


  const qty =
    validation.values.qty;

  const price =
    validation.values.price;


  let pid;


  /* -------------------------------------------
     2. New product
  ------------------------------------------- */

  if (
    moveState.type === "in" &&
    moveState.isNew
  ) {

    const productInput = {

      cat:
        val("n_cat"),

      brand:
        val("n_brand"),

      model:
        val("n_model"),

      spec:
        val("n_spec"),

      wt:
        val("n_wt"),

      desc:
        val("n_desc"),

      sell:
        val("n_sell"),

      min: 2
    };


    /* Category check */

    if (!CATS[productInput.cat]) {

      showToast(
        "Please valid category select karo"
      );

      document
        .querySelector("#n_cat")
        ?.focus();

      return;
    }


    /* Product validation */

    const productValidation =
      validateProduct(
        productInput
      );


    if (!productValidation.valid) {

      showToast(
        firstValidationError(
          productValidation.errors
        )
      );

      focusNewProductField(
        productValidation.errors
      );

      return;
    }


    const brand =
      productValidation.values.brand;

    const model =
      productValidation.values.model;


    /* Duplicate check */

    const existing =
      findDuplicate(
        db,
        productInput.cat,
        brand,
        model
      );


    if (existing) {

      /*
       * If duplicate exists,
       * use the existing product instead
       * of creating another one.
       */

      pid = existing.id;

    } else {

      const p = {

        id: uid(),

        cat:
          productInput.cat,

        brand,

        model,

        spec:
          productValidation.values.spec,

        wt:
          productValidation.values.wt,

        desc:
          productValidation.values.desc,

        sell:
          productValidation.values.sell,

        min: 2
      };


      try {

        const saved =
          await context.put(
            "products",
            p
          );

        if (!saved) {

          showToast(
            "New item save nahi hua"
          );

          return;
        }

      } catch (error) {

        console.error(
          "New product error:",
          error
        );

        showToast(
          getFirebaseErrorMessage(
            error,
            "New item save nahi hua"
          )
        );

        return;
      }


      pid = p.id;
    }
  }


  /* -------------------------------------------
     3. Existing product
  ------------------------------------------- */

  else {

    pid =
      transactionInput.pid;


    if (!pid) {

      showToast(
        "Pehle item chuno"
      );

      document
        .querySelector("#m_pid")
        ?.focus();

      return;
    }


    const product =
      context.product(pid);


    if (!product) {

      showToast(
        "Selected item nahi mila"
      );

      return;
    }
  }


  /* -------------------------------------------
     4. Sale stock validation
  ------------------------------------------- */

  if (moveState.type === "out") {

    const currentStock =
      stock(db, pid);


    if (currentStock <= 0) {

      showToast(
        "Is item ka stock khatam hai"
      );

      return;
    }


    if (qty > currentStock) {

      showToast(
        `Itna stock nahi hai! Bacha hai: ${currentStock} piece`
      );

      document
        .querySelector("#m_qty")
        ?.focus();

      return;
    }
  }


  /* -------------------------------------------
     5. Save transaction
  ------------------------------------------- */

  const transaction = {

    id: uid(),

    ts: Date.now(),

    pid,

    type:
      moveState.type,

    date:
      validation.values.date,

    qty,

    price,

    party:
      validation.values.party,

    note:
      validation.values.note
  };


  try {

    const saved =
      await context.put(
        "tx",
        transaction
      );


    if (!saved) {

      showToast(
        "Transaction save nahi hui"
      );

      return;
    }

  } catch (error) {

    console.error(
      "Transaction save error:",
      error
    );

    showToast(
      getFirebaseErrorMessage(
        error,
        "Transaction save nahi hui"
      )
    );

    return;
  }


  /* -------------------------------------------
     6. Success
  ------------------------------------------- */

  closeModal();

  context.render();


  showToast(
    moveState.type === "in"
      ? "Maal add ho gaya"
      : "Bikri likh li"
  );
}


/* ---------------------------------------------
   Focus transaction validation field
--------------------------------------------- */

function focusTransactionField(errors) {

  const fieldMap = {

    pid: "m_pid",

    qty: "m_qty",

    price: "m_price",

    date: "m_date",

    party: "m_party",

    note: "m_note"
  };


  const firstKey =
    Object.keys(errors || {})[0];


  const fieldId =
    fieldMap[firstKey];


  if (fieldId) {

    setTimeout(() => {

      document
        .querySelector(`#${fieldId}`)
        ?.focus();

    }, 50);
  }
}


/* ---------------------------------------------
   Focus new-product field
--------------------------------------------- */

function focusNewProductField(errors) {

  const fieldMap = {

    cat: "n_cat",

    brand: "n_brand",

    model: "n_model",

    spec: "n_spec",

    wt: "n_wt",

    desc: "n_desc",

    sell: "n_sell"
  };


  const firstKey =
    Object.keys(errors || {})[0];


  const fieldId =
    fieldMap[firstKey];


  if (fieldId) {

    setTimeout(() => {

      document
        .querySelector(`#${fieldId}`)
        ?.focus();

    }, 50);
  }
}


/* ---------------------------------------------
   Firebase error handling
--------------------------------------------- */

function getFirebaseErrorMessage(
  error,
  fallback = "Something went wrong"
) {

  const code =
    error?.code || "";


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


  return (
    messages[code] ||
    fallback
  );
}