/// <reference lib="WebWorker" />

import { createEventHandler } from "run-local";
import * as build from "@remix-run/dev/server-build";
import { EntryRoute } from "@remix-run/react/routes";

// define the type of the self constant so TypeScript can check for type errors
declare const self: ServiceWorkerGlobalScope;

// collect all the assets, and the assets they import, from Remix's Build output
const route_assets = () => {
  let res: string[] = [];
  Object.values<EntryRoute>(build.assets.routes).forEach((route) => {
    res.push(route.module);
    if (route.imports) {
      res.push(...route.imports);
    }
  });
  return res;
};

// collect all the local links that routes rely on from Remix's Build output
const route_links = () => {
  let res: string[] = [];
  Object.values(build.routes).forEach((route) => {
    // @ts-ignore module is populated by __export
    if (route.module.links) {
      // @ts-ignore module is populated by __export
      route.module.links().forEach((link) => {
        if ("href" in link) {
          res.push(link.href);
        }
      });
    }
  });
  return res;
};

// collect every static url that we need to cache into an Array
const STATIC_CACHE_URLS = [
  ...new Set([
    build.assets.url,
    build.assets.entry.module,
    ...build.assets.entry.imports,
    ...route_assets(),
    ...route_links(),
  ]),
];

// when the Service Worker is ready to be installed by the browser,
// the following code will execute
self.addEventListener("install", (event) => {
  // force this service worker to become active
  // (e.g. if the service worker has been updated,
  // the new one should replace the old as soon as possible)
  self.skipWaiting();
  console.log("Service Worker installing.");
  console.log("to cache: ", STATIC_CACHE_URLS);
  // do not end the install event until all static files have been cached,
  // otherwise the activate event (below) could trigger before cache is ready.
  // If the caching process fails, the Service Worker will not be installed.
  event.waitUntil(
    caches.open("assets").then((cache) => cache.addAll(STATIC_CACHE_URLS))
  );
});

// when the service worker has installed successfully,
// the following code will execute
self.addEventListener("activate", (event) => {
  console.log("Now ready to handle fetches!");
  // do not end the activate event until this worker has replaced the old one,
  // if any were present before.
  // If that fails, the (new) Service Worker will not be installed.
  event.waitUntil(
    self.clients.claim().then(() => {
      // delete old cached files that are no longer part of the web app's
      // list of cache urls
      caches.open("assets").then(async (cache) => {
        return Promise.all(
          // based on code from https://stackoverflow.com/a/45468998/11274749
          await cache.keys().then((keys) =>
            keys
              .filter((request, _index, _array) => {
                // Return true if you want to remove this cache,
                // but remember that caches are shared across
                // the whole origin
                return !STATIC_CACHE_URLS.includes(
                  new URL(request.url).pathname
                );
              })
              .map((request, _index, _array) => {
                console.log(
                  "Deleting old cache: ",
                  new URL(request.url).pathname
                );
                return cache.delete(request);
              })
          )
        );
      });
    })
  );
});

// whenever the web app sends a network request, intercept it with this worker
// @ts-ignore build is ServerBuild type, as required - the "missing" default method is added by __export
self.addEventListener("fetch", createEventHandler({ build }));
