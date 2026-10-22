// Dukaan Stock Tracker
// Service worker

const CACHE_NAME = "dukaan-v2";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", (event) => {

  event.waitUntil(

    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())

  );

});


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches
      .keys()
      .then((keys) => {

        return Promise.all(

          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))

        );

      })
      .then(() => self.clients.claim())

  );

});


/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", (event) => {

  const request = event.request;

  if (request.method !== "GET") {
    return;
  }


  const url = new URL(request.url);


  /*
   * Don't interfere with Firebase / Google APIs.
   */

  if (
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("firebasedatabase.app")
  ) {
    return;
  }


  /*
   * Only handle our own application files.
   */

  if (url.origin !== self.location.origin) {
    return;
  }


  /*
   * HTML navigation:
   * Always try network first so users get
   * the latest application version.
   */

  if (request.mode === "navigate") {

    event.respondWith(

      fetch(request)

        .then((response) => {

          if (response && response.ok) {

            const copy = response.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => {
                cache.put("./index.html", copy);
              });

          }

          return response;

        })

        .catch(() => {

          return caches.match("./index.html");

        })

    );

    return;
  }


  /*
   * JS / CSS / other assets:
   * Network first, cache fallback.
   */

  event.respondWith(

    fetch(request)

      .then((response) => {

        if (response && response.ok) {

          const copy = response.clone();

          caches
            .open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, copy);
            });

        }

        return response;

      })

      .catch(() => {

        return caches.match(request);

      })

  );

});