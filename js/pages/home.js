import { inr, today } from "../utils/formatters.js";
import { stock, avgCost } from "../utils/calculations.js";
import { esc } from "../utils/helpers.js";

export function homePage(db, context) {
  const t = today();

  // ---------------------------------------------------------
  // STOCK VALUE
  // ---------------------------------------------------------

  const value = db.products.reduce(
    (total, product) =>
      total + stock(db, product.id) * avgCost(db, product.id),
    0
  );

  // ---------------------------------------------------------
  // TOTAL STOCK
  // ---------------------------------------------------------

  const pieces = db.products.reduce(
    (total, product) =>
      total + Math.max(0, stock(db, product.id)),
    0
  );

  // ---------------------------------------------------------
  // TODAY'S SALES
  // ---------------------------------------------------------

  const sale = db.tx
    .filter(
      (transaction) =>
        transaction.type === "out" &&
        transaction.date === t
    )
    .reduce(
      (total, transaction) =>
        total + transaction.qty * transaction.price,
      0
    );

  // ---------------------------------------------------------
  // TOTAL PROFIT
  // ---------------------------------------------------------

  const profit = db.tx
    .filter(
      (transaction) =>
        transaction.type === "out"
    )
    .reduce(
      (total, transaction) =>
        total +
        transaction.qty *
          (
            transaction.price -
            avgCost(db, transaction.pid)
          ),
      0
    );

  // ---------------------------------------------------------
  // LOW STOCK ITEMS
  // ---------------------------------------------------------

  const lows = db.products.filter(
    (product) =>
      stock(db, product.id) <= (+product.min || 0)
  );

  // ---------------------------------------------------------
  // PROFIT STATE
  // ---------------------------------------------------------

  const profitClass =
    profit < 0
      ? "metric-card--danger"
      : "metric-card--success";

  // ---------------------------------------------------------
  // GREETING
  // ---------------------------------------------------------

  const hour = new Date().getHours();

  let greeting = "Good day";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  return `
    <section class="home-page">

      <!-- =================================================
           HEADER
      ================================================== -->

      <header class="home-header">

        <div class="home-header-content">

          <div class="home-eyebrow">
            ${greeting} <span>👋</span>
          </div>

          <h1 class="home-title">
            Dukaan ka dashboard
          </h1>

          <p class="home-subtitle">
            Aaj ka stock aur hisaab ek nazar mein.
          </p>

        </div>

        <button
          type="button"
          class="theme-toggle"
          data-action="theme-toggle"
          aria-label="Toggle theme"
          title="Theme change karo"
        >
          <span class="theme-toggle-icon">◐</span>
        </button>

      </header>


      <!-- =================================================
           FIREBASE / SETUP MESSAGE
      ================================================== -->

      <div class="home-banner">
        ${context.bannerHtml()}
      </div>


      <!-- =================================================
           QUICK ACTIONS
      ================================================== -->

      <section class="home-section">

        <div class="section-heading">

          <div>
            <div class="section-eyebrow">
              Quick actions
            </div>

            <h2 class="section-title">
              Aaj kya karna hai?
            </h2>
          </div>

        </div>


        <div class="quick-actions">

          <!-- MAAL AAYA -->

          <button
            type="button"
            class="quick-action quick-action--in"
            data-action="move-in"
          >

            <div class="quick-action-top">

              <div class="quick-action-icon">
                +
              </div>

              <span class="quick-action-arrow">
                →
              </span>

            </div>

            <div class="quick-action-content">

              <div class="quick-action-title">
                Maal Aaya
              </div>

              <div class="quick-action-subtitle">
                Stock receive karo
              </div>

            </div>

          </button>


          <!-- MAAL BIKA -->

          <button
            type="button"
            class="quick-action quick-action--out"
            data-action="move-out"
          >

            <div class="quick-action-top">

              <div class="quick-action-icon">
                −
              </div>

              <span class="quick-action-arrow">
                →
              </span>

            </div>

            <div class="quick-action-content">

              <div class="quick-action-title">
                Maal Bika
              </div>

              <div class="quick-action-subtitle">
                Sale entry karo
              </div>

            </div>

          </button>

        </div>

      </section>


      <!-- =================================================
           OVERVIEW
      ================================================== -->

      <section class="home-section">

        <div class="section-heading">

          <div>

            <div class="section-eyebrow">
              Overview
            </div>

            <h2 class="section-title">
              Business snapshot
            </h2>

          </div>

          <span class="live-status">
            <span class="live-dot"></span>
            Live data
          </span>

        </div>


        <div class="metric-grid">

          <!-- TOTAL STOCK -->

          <article class="metric-card">

            <div class="metric-card-top">

              <div class="metric-card-icon metric-card-icon--blue">
                ▦
              </div>

              <span class="metric-card-label">
                Total stock
              </span>

            </div>

            <div class="metric-card-value">
              ${pieces}
              <span class="metric-unit">
                pcs
              </span>
            </div>

            <div class="metric-card-footer">
              Available quantity
            </div>

          </article>


          <!-- STOCK VALUE -->

          <article class="metric-card">

            <div class="metric-card-top">

              <div class="metric-card-icon metric-card-icon--purple">
                ₹
              </div>

              <span class="metric-card-label">
                Stock value
              </span>

            </div>

            <div class="metric-card-value">
              ${inr(value)}
            </div>

            <div class="metric-card-footer">
              Current inventory value
            </div>

          </article>


          <!-- TODAY SALES -->

          <article class="metric-card">

            <div class="metric-card-top">

              <div class="metric-card-icon metric-card-icon--orange">
                ↗
              </div>

              <span class="metric-card-label">
                Aaj ki bikri
              </span>

            </div>

            <div class="metric-card-value">
              ${inr(sale)}
            </div>

            <div class="metric-card-footer">
              Today's sales
            </div>

          </article>


          <!-- PROFIT -->

          <article class="metric-card ${profitClass}">

            <div class="metric-card-top">

              <div class="metric-card-icon metric-card-icon--green">
                ₹
              </div>

              <span class="metric-card-label">
                Total munafa
              </span>

            </div>

            <div class="metric-card-value">
              ${inr(profit)}
            </div>

            <div class="metric-card-footer">
              Overall profit
            </div>

          </article>

        </div>

      </section>


      <!-- =================================================
           STOCK ALERT
      ================================================== -->

      <section class="home-section">

        <div class="section-heading">

          <div>

            <div class="section-eyebrow">
              Inventory health
            </div>

            <h2 class="section-title">
              Stock alert
            </h2>

          </div>

          <span
            class="
              alert-count
              ${lows.length ? "alert-count--danger" : "alert-count--success"}
            "
          >
            ${lows.length}
            ${lows.length === 1 ? "item" : "items"}
          </span>

        </div>


        ${
          lows.length
            ? `
              <div class="stock-alert-list">

                ${lows
                  .map(
                    (product) => {

                      const currentStock =
                        stock(db, product.id);

                      const minimumStock =
                        +product.min || 0;

                      return `
                        <article class="stock-alert-card">

                          <div class="stock-alert-icon">
                            !
                          </div>

                          <div class="stock-alert-content">

                            <div class="stock-alert-title">
                              ${esc(
                                product.brand +
                                " " +
                                product.model
                              )}
                            </div>

                            <div class="stock-alert-meta">

                              ${esc(product.cat)}

                              ${
                                product.spec
                                  ? ` · ${esc(product.spec)}`
                                  : ""
                              }

                            </div>

                            <div class="stock-alert-warning">
                              Stock minimum level ke paas hai
                            </div>

                          </div>


                          <div class="stock-alert-quantity">

                            <strong>
                              ${currentStock}
                            </strong>

                            <span>
                              / ${minimumStock}
                            </span>

                            <small>
                              pcs
                            </small>

                          </div>

                        </article>
                      `;
                    }
                  )
                  .join("")}

              </div>
            `
            : `
              <div class="healthy-stock-card">

                <div class="healthy-stock-icon">
                  ✓
                </div>

                <div class="healthy-stock-content">

                  <h3>
                    Stock healthy hai
                  </h3>

                  <p>
                    Koi item minimum level se neeche nahi hai.
                  </p>

                </div>

              </div>
            `
        }

      </section>


      <!-- =================================================
           EMPTY INVENTORY
      ================================================== -->

      ${
        db.products.length === 0
          ? `
            <section class="home-empty-card">

              <div class="home-empty-icon">
                📦
              </div>

              <div class="home-empty-content">

                <div class="home-empty-eyebrow">
                  Let's get started
                </div>

                <h2>
                  Abhi stock empty hai
                </h2>

                <p>
                  Apna pehla product add karke
                  inventory manage karna shuru karo.
                </p>

                <button
                  type="button"
                  class="primary-button"
                  data-action="move-in"
                >
                  <span>+</span>
                  Pehla maal jodo
                </button>

              </div>

            </section>
          `
          : ""
      }


      <!-- =================================================
           ADMIN SETTINGS
      ================================================== -->

      ${
        db.products.length && context.canAdmin
          ? `
            <section class="home-section admin-section">

              <div class="section-heading">

                <div>

                  <div class="section-eyebrow">
                    Administration
                  </div>

                  <h2 class="section-title">
                    Settings
                  </h2>

                </div>

              </div>

              <button
                type="button"
                class="danger-button"
                data-action="clear-data"
              >

                <span class="danger-button-icon">
                  ×
                </span>

                <span>
                  Sab data mita do
                </span>

              </button>

            </section>
          `
          : ""
      }

    </section>
  `;
}