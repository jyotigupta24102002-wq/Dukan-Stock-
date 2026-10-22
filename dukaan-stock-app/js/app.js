import { CATS, COMMON } from "./data/products.js";

import { $, armed } from "./utils/helpers.js";

import {
  stock,
  avgCost,
  product
} from "./utils/calculations.js";

import {
  loadLocal,
  saveLocal
} from "./services/storage-service.js";

import {
  initializeFirebase
} from "./firebase/firebase-init.js";

import {
  login as firebaseLogin,
  logout as firebaseLogout,
  onAuthChanged
} from "./firebase/auth.js";

import {
  subscribeCollection,
  setDocument,
  deleteDocument
} from "./firebase/firestore.js";

import { showToast } from "./components/toast.js";

import {
  openItemForm
} from "./forms/product-form.js";

import {
  openMoveForm
} from "./forms/transaction-form.js";

import { homePage } from "./pages/home.js";

import {
  stockPage,
  bindStockPage
} from "./pages/stock.js";

import {
  historyPage,
  bindHistoryPage
} from "./pages/history.js";

import {
  loginPage,
  bindLogin
} from "./pages/login.js";

import {
  initBottomNav,
  updateBottomNav
} from "./components/bottom-nav.js";

import {
  closeModal
} from "./components/modal.js";


/* =========================================================
   APPLICATION STATE
   ========================================================= */

const state = {

  db: {
    products: [],
    tx: []
  },

  mode: "loading",

  loaded: {
    p: false,
    t: false
  },

  canAdmin: true,

  tab: "home",

  q: "",
  fc: "",
  fb: "",
  hf: "",

  firebase: {
    auth: null,
    firestore: null
  },

  unsubs: [],

  initialized: false
};


/* =========================================================
   NAVIGATION
   ========================================================= */

function go(tab) {
  state.tab = tab;

  render();

  window.scrollTo(0, 0);
}


/* =========================================================
   INITIAL APP READY STATE
   ========================================================= */

function markAppReady() {
  document.body.classList.add("app-ready");

  const loader = document.getElementById("appLoader");

  if (loader) {
    loader.remove();
  }
}


/* =========================================================
   SETUP BANNER
   ========================================================= */

function bannerHtml() {

  if (state.mode === "shared") {

    return `
      <div class="banner">

        👥 Team ke saath share hai.
        Sabke phone pe same stock dikhega.

        Internet na ho to bhi entry kar sakte ho,
        net aate hi sync ho jayega.

        <br>

        <button
          class="ghost"
          style="padding:6px 12px;margin-top:6px"
          id="logoutButton"
        >
          Logout
        </button>

      </div>
    `;
  }


  if (state.mode === "local") {

    return `
      <div class="banner w">

        ⚠️ Setup baaki hai (firebase-config.js).

        Abhi data sirf is phone pe save ho raha hai.

      </div>
    `;
  }


  return "";
}


/* =========================================================
   BRAND LIST
   ========================================================= */

function brandList() {

  const brands = new Set(COMMON);

  state.db.products.forEach((p) => {

    if (p.brand) {
      brands.add(p.brand);
    }

  });

  return [...brands].sort(
    (a, b) => a.localeCompare(b)
  );
}


/* =========================================================
   BRAND DATALIST
   ========================================================= */

function refreshBrandDatalist() {

  const brands = $("#brands");

  if (!brands) {
    return;
  }

  brands.innerHTML = brandList()
    .map(
      (b) =>
        `<option value="${escapeHtml(b)}">`
    )
    .join("");
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

  return String(value == null ? "" : value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;");
}


/* =========================================================
   THEME
   ========================================================= */

function toggleTheme() {

  const current =
    document.documentElement.dataset.theme;

  const next =
    current === "dark"
      ? "light"
      : "dark";

  document.documentElement.dataset.theme = next;

  localStorage.setItem(
    "dukaanTheme",
    next
  );
}


/* =========================================================
   LOAD THEME
   ========================================================= */

function loadTheme() {

  const saved =
    localStorage.getItem("dukaanTheme");

  if (
    saved === "dark" ||
    saved === "light"
  ) {

    document.documentElement.dataset.theme =
      saved;
  }
}


/* =========================================================
   CHECK WHETHER APP IS READY
   ========================================================= */

function isAppReady() {

  // Login screen is ready immediately.
  if (state.mode === "login") {
    return true;
  }

  // Local mode has already loaded local data.
  if (state.mode === "local") {
    return true;
  }

  // Shared Firebase mode is ready only after
  // both products and transactions have loaded.
  if (
    state.mode === "shared" &&
    state.loaded.p &&
    state.loaded.t
  ) {
    return true;
  }

  return false;
}


/* =========================================================
   RENDER
   ========================================================= */

function render() {

  const active =
    document.activeElement;

  const isSearch =
    active?.id === "qs";

  const cursor =
    isSearch
      ? active.selectionStart
      : 0;


  refreshBrandDatalist();


  let html = "";


  /* =======================================================
     LOGIN
  ====================================================== */

  if (state.mode === "login") {

    html = loginPage({
      login: loginUser
    });

  }


  /* =======================================================
     LOADING
  ====================================================== */

  else if (
    state.mode === "loading" ||
    !state.loaded.p ||
    !state.loaded.t
  ) {

    html = `
      <div class="app-loading-message">

        <div class="app-loading-message-icon">
          ⏳
        </div>

        <div>
          <strong>
            Dukaan Stock
          </strong>

          <p>
            Data load ho raha hai...
          </p>
        </div>

      </div>
    `;

  }


  /* =======================================================
     HOME
  ====================================================== */

  else if (state.tab === "home") {

    html = homePage(
      state.db,
      context()
    );

  }


  /* =======================================================
     STOCK
  ====================================================== */

  else if (state.tab === "stock") {

    html = stockPage(
      state.db,
      context()
    );

  }


  /* =======================================================
     HISTORY
  ====================================================== */

  else if (state.tab === "hist") {

    html = historyPage(
      state.db,
      context()
    );

  }


  /* =======================================================
     UPDATE APP HTML
  ====================================================== */

  $("#app").innerHTML = html;


  /* =======================================================
     BOTTOM NAV
  ====================================================== */


  
/* =======================================================
   BOTTOM NAV
======================================================= */

/* =======================================================
   BOTTOM NAV
======================================================= */

const bottomNav = document.querySelector("#bottomNav");

if (bottomNav) {

  const showNav =
    state.mode === "shared" &&
    state.loaded.p &&
    state.loaded.t;

  if (showNav) {

    bottomNav.style.setProperty(
      "display",
      "grid",
      "important"
    );

    updateBottomNav(
      state.tab,
      true
    );

  } else {

    bottomNav.style.setProperty(
      "display",
      "none",
      "important"
    );

  }
}
  


  /* =======================================================
     PAGE EVENTS
  ====================================================== */

  bindPageEvents();


  /* =======================================================
     RESTORE SEARCH CURSOR
  ====================================================== */

  if (isSearch) {

    const input = $("#qs");

    if (input) {

      input.focus();

      input.setSelectionRange(
        cursor,
        cursor
      );
    }
  }


  /* =======================================================
     REMOVE INITIAL LOADER
     
     IMPORTANT:
     This happens only after the actual app
     is ready, not while Firebase is loading.
  ====================================================== */

  if (isAppReady()) {

    markAppReady();

    state.initialized = true;
  }
}


/* =========================================================
   PAGE CONTEXT
   ========================================================= */

function context() {

  return {

    db: state.db,

    canAdmin:
      state.canAdmin,

    q:
      state.q,

    fc:
      state.fc,

    fb:
      state.fb,

    hf:
      state.hf,


    actions: {

      openMove: (
        type,
        pid
      ) =>
        openMoveForm(
          state.db,
          appContext(),
          type,
          pid
        ),

      openItem: (
        id
      ) =>
        openItemForm(
          state.db,
          appContext(),
          id
        )
    },


    bannerHtml,


    setQuery(value) {

      state.q = value;

      render();
    },


    setCategory(value) {

      state.fc = value;

      render();
    },


    setBrand(value) {

      state.fb = value;

      render();
    },


    setFilter(value) {

      state.hf = value;

      render();
    }
  };
}


/* =========================================================
   APP CONTEXT
   ========================================================= */

function appContext() {

  return {

    db: state.db,


    product: (id) =>
      product(
        state.db,
        id
      ),


    put,


    deleteItem,


    deleteTx,


    render,


    armed,


    login: loginUser,


    logout: logoutUser
  };
}


/* =========================================================
   BIND PAGE EVENTS
   ========================================================= */

function bindPageEvents() {

  document
    .querySelectorAll("[data-action]")
    .forEach((element) => {

      element.addEventListener(
        "click",
        () => {

          const action =
            element.dataset.action;

          const id =
            element.dataset.id;


          switch (action) {

            /* =============================================
               ADD STOCK
            ============================================== */

            case "move-in":

              openMoveForm(
                state.db,
                appContext(),
                "in"
              );

              break;


            /* =============================================
               SELL STOCK
            ============================================== */

            case "move-out":

              openMoveForm(
                state.db,
                appContext(),
                "out"
              );

              break;


            /* =============================================
               STOCK IN FOR PRODUCT
            ============================================== */

            case "stock-in":

              openMoveForm(
                state.db,
                appContext(),
                "in",
                id
              );

              break;


            /* =============================================
               STOCK OUT FOR PRODUCT
            ============================================== */

            case "stock-out":

              openMoveForm(
                state.db,
                appContext(),
                "out",
                id
              );

              break;


            /* =============================================
               THEME
            ============================================== */

            case "theme-toggle":

              toggleTheme();

              break;


            /* =============================================
               NEW PRODUCT
            ============================================== */

            case "new-product":

              openItemForm(
                state.db,
                appContext()
              );

              break;


            /* =============================================
               EDIT PRODUCT
            ============================================== */

            case "edit-product":

              openItemForm(
                state.db,
                appContext(),
                id
              );

              break;


            /* =============================================
               DELETE TRANSACTION
            ============================================== */

            case "delete-tx":

              armed(
                element,
                () =>
                  deleteTx(id)
              );

              break;


            /* =============================================
               CLEAR DATA
            ============================================== */

            case "clear-data":

              armed(
                element,
                clearAll
              );

              break;


            default:

              break;
          }
        }
      );
    });


  /* =======================================================
     LOGOUT
  ====================================================== */

  $("#logoutButton")
    ?.addEventListener(
      "click",
      logoutUser
    );


  /* =======================================================
     STOCK PAGE
  ====================================================== */

  if (state.tab === "stock") {

    bindStockPage({

      setQuery: (value) => {

        state.q = value;

        render();
      },


      setCategory: (value) => {

        state.fc = value;

        render();
      },


      setBrand: (value) => {

        state.fb = value;

        render();
      }
    });
  }


  /* =======================================================
     HISTORY PAGE
  ====================================================== */

  if (state.tab === "hist") {

    bindHistoryPage({

      setFilter: (value) => {

        state.hf = value;

        render();
      }
    });
  }


  /* =======================================================
     LOGIN PAGE
  ====================================================== */

  if (state.mode === "login") {

    bindLogin({

      login: loginUser
    });
  }
}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser(
  email,
  password
) {

  return firebaseLogin(
    state.firebase.auth,
    email,
    password
  );
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

  return firebaseLogout(
    state.firebase.auth
  );
}


/* =========================================================
   SAVE / UPDATE
   ========================================================= */

async function put(
  collection,
  object
) {

  /* =======================================================
     FIREBASE / SHARED MODE
  ====================================================== */

  if (state.mode === "shared") {

    try {

      await setDocument(
        state.firebase.firestore,
        collection,
        object
      );

    } catch (error) {

  console.error(
    "Firestore SAVE ERROR:",
    error
  );

  console.error(
    "Collection:",
    collection
  );

  console.error(
    "Object:",
    object
  );

  showToast(
    "Save nahi hua — Console check karo"
  );

  return false;
}

    return true;
  }


  /* =======================================================
     LOCAL MODE
  ====================================================== */

  const key =
    collection === "tx"
      ? "tx"
      : "products";


  const array =
    state.db[key];


  const index =
    array.findIndex(
      (x) =>
        x.id === object.id
    );


  if (index >= 0) {

    array[index] =
      object;

  } else {

    array.push(
      object
    );
  }


  saveLocal(
    state.db
  );


  render();


  return true;
}


/* =========================================================
   DELETE
   ========================================================= */

async function del(
  collection,
  id
) {

  /* =======================================================
     FIREBASE / SHARED MODE
  ====================================================== */

  if (state.mode === "shared") {

    try {

      await deleteDocument(
        state.firebase.firestore,
        collection,
        id
      );

    } catch (_) {

      showToast(
        "Hata nahi paaye, access check karo"
      );

      return false;
    }

    return true;
  }


  /* =======================================================
     LOCAL MODE
  ====================================================== */

  const key =
    collection === "tx"
      ? "tx"
      : "products";


  state.db[key] =
    state.db[key].filter(
      (item) =>
        item.id !== id
    );


  saveLocal(
    state.db
  );


  render();


  return true;
}


/* =========================================================
   DELETE PRODUCT
   ========================================================= */

async function deleteItem(id) {

  const transactions =
    state.db.tx.filter(
      (t) =>
        t.pid === id
    );


  for (
    const transaction
    of transactions
  ) {

    await del(
      "tx",
      transaction.id
    );
  }


  if (
    await del(
      "products",
      id
    )
  ) {

    closeModal();

    render();
  }
}


/* =========================================================
   DELETE TRANSACTION
   ========================================================= */

async function deleteTx(id) {

  if (
    await del(
      "tx",
      id
    )
  ) {

    showToast(
      "Entry hata di"
    );
  }
}


/* =========================================================
   CLEAR ALL DATA
   ========================================================= */

async function clearAll() {

  /* =======================================================
     DELETE TRANSACTIONS
  ====================================================== */

  for (
    const transaction
    of state.db.tx.slice()
  ) {

    await del(
      "tx",
      transaction.id
    );
  }


  /* =======================================================
     DELETE PRODUCTS
  ====================================================== */

  for (
    const p
    of state.db.products.slice()
  ) {

    await del(
      "products",
      p.id
    );
  }


  render();
}


/* =========================================================
   FIRESTORE SUBSCRIPTIONS
   ========================================================= */

function subscribeFirestore() {

  const productError = (error) => {

    console.error("Products Firestore error:", error);

    state.loaded.p = true;

    showToast(
      "Products load nahi ho paaye"
    );

    render();
  };


  const transactionError = (error) => {

    console.error("Transactions Firestore error:", error);

    state.loaded.t = true;

    showToast(
      "Hisaab load nahi ho paaya"
    );

    render();
  };


  /* =======================================================
     PRODUCTS
  ====================================================== */

  state.unsubs.push(

    subscribeCollection(

      state.firebase.firestore,

      "products",

      (snapshot) => {

        state.db.products =
          snapshot.docs.map(
            (doc) => ({

              ...doc.data(),

              id: doc.id

            })
          );


        state.loaded.p = true;

        render();

      },

      productError

    )

  );


  /* =======================================================
     TRANSACTIONS
  ====================================================== */

  state.unsubs.push(

    subscribeCollection(

      state.firebase.firestore,

      "tx",

      (snapshot) => {

        state.db.tx =
          snapshot.docs.map(
            (doc) => ({

              ...doc.data(),

              id: doc.id

            })
          );


        state.loaded.t = true;

        render();

      },

      transactionError

    )

  );
}


/* =========================================================
   UNSUBSCRIBE FIREBASE
   ========================================================= */

function unsubscribeAll() {

  state.unsubs.forEach(
    (unsubscribe) =>
      unsubscribe()
  );

  state.unsubs = [];
}


/* =========================================================
   INITIALIZE APPLICATION
   ========================================================= */

async function init() {

  state.canAdmin = true;


  /* =======================================================
     INITIALIZE FIREBASE
  ====================================================== */

  const firebase =
    await initializeFirebase();


  /* =======================================================
     LOCAL MODE
  ====================================================== */

  if (!firebase.enabled) {

    state.mode = "local";

    state.db =
      loadLocal();


    state.loaded = {

      p: true,

      t: true

    };


    render();

    return;
  }


  /* =======================================================
     FIREBASE AVAILABLE
  ====================================================== */

  state.firebase.auth =
    firebase.auth;

  state.firebase.firestore =
    firebase.firestore;


  /* =======================================================
     AUTH STATE
  ====================================================== */

  onAuthChanged(

    state.firebase.auth,

    (user) => {

      unsubscribeAll();


      /* ===================================================
         LOGGED IN
      ================================================== */

      if (user) {

        state.mode =
          "shared";


        state.loaded = {

          p: false,

          t: false

        };


        subscribeFirestore();

      }


      /* ===================================================
         NOT LOGGED IN
      ================================================== */

      else {

        state.mode =
          "login";


        state.db = {

          products: [],

          tx: []

        };


        state.loaded = {

          p: true,

          t: true

        };
      }


      render();
    }
  );
}


/* =========================================================
   INITIAL APPLICATION SETUP
   ========================================================= */

loadTheme();

init();

initBottomNav(go);


/* =========================================================
   MODAL BACKDROP
   ========================================================= */

$("#modal")
  ?.addEventListener(
    "click",
    (event) => {

      if (
        event.target.id === "modal"
      ) {

        closeModal();
      }
    }
  );


/* =========================================================
   SERVICE WORKER
   ========================================================= */

if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register(
          "sw.js?v=5"
        )
        .catch(() => {});

    }
  );
}