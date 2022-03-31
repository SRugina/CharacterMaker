// copied from https://github.com/remix-run/remix/blob/0523d32a20a354c49858765fed45b35976cdcf95/packages/remix-cloudflare-workers/worker.ts
// with some minor alterations (e.g. replacing Cloudflare KV code for Assets)

import type { AppLoadContext, ServerBuild } from "@remix-run/server-runtime";
import { createRequestHandler as createRemixRequestHandler } from "@remix-run/server-runtime";

/**
 * A function that returns the value to use as `context` in route `loader` and
 * `action` functions.
 *
 * You can think of this as an escape hatch that allows you to pass
 * environment/platform-specific values through to your loader/action.
 */
export interface GetLoadContextFunction {
  (event: FetchEvent): AppLoadContext;
}

export type RequestHandler = ReturnType<typeof createRequestHandler>;

/**
 * Returns a request handler for the Cloudflare runtime that serves the
 * Remix SSR response.
 */
export function createRequestHandler({
  build,
  getLoadContext,
  mode,
}: {
  build: ServerBuild;
  getLoadContext?: GetLoadContextFunction;
  mode?: string;
}) {
  let handleRequest = createRemixRequestHandler(build, mode);

  return (event: FetchEvent) => {
    let loadContext =
      typeof getLoadContext === "function" ? getLoadContext(event) : undefined;
    // MODIFIED: to allow directly navigating to the web app when offline,
    // we must reconstruct the network request as same-origin so that Remix
    // can process the request
    let request = event.request.clone();
    if (request.mode === "navigate") {
      request = new Request(request, { mode: "same-origin" });
    }

    return handleRequest(request, loadContext);
  };
}

// MODIFIED: replaced Cloudflare KV code with asset handling code from
// https://sergiodxa.com/articles/using-service-workers-with-remix
// but modified to not respond to the event immediately, as that is handled
// in the createRequestHandler function below, and to explicitly return null
// otherwise so that it is caught by if statements in createRequestHandler
export async function handleAsset(event: FetchEvent, _build: ServerBuild) {
  let url = new URL(event.request.url);
  let method = event.request.method;

  // any non GET request is ignored
  if (method.toLowerCase() !== "get") return null;

  // If the request is for the favicons, fonts, or the built files (which are hashed in the name)
  if (
    url.pathname.startsWith("/favicons/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/build/")
  ) {
    // we will open the assets cache
    return caches.open("assets").then(async (cache) => {
      // if the request is cached we will use the cache
      let cacheResponse = await cache.match(event.request);
      if (cacheResponse) return cacheResponse;

      // if it's not cached we will run the fetch, cache it and return it
      // this way the next time this asset it's needed it will load from the cache
      let fetchResponse = await fetch(event.request);
      cache.put(event.request, fetchResponse.clone());

      return fetchResponse;
    });
  }

  return null;
}

// NOTE: this is the main part of the Service Worker that responds
// to network requests with either static assets or Remix generated pages
export function createEventHandler({
  build,
  getLoadContext,
  mode,
}: {
  build: ServerBuild;
  getLoadContext?: GetLoadContextFunction;
  mode?: string;
}) {
  let handleRequest = createRequestHandler({
    build,
    getLoadContext,
    mode,
  });

  let handleEvent = async (event: FetchEvent) => {
    let response = await handleAsset(event, build);

    if (!response) {
      response = await handleRequest(event);
    }

    return response;
  };

  return (event: FetchEvent) => {
    try {
      event.respondWith(handleEvent(event));
    } catch (e: any) {
      if (process.env.NODE_ENV === "development") {
        event.respondWith(
          new Response(e.message || e.toString(), {
            status: 500,
          })
        );
        return;
      }

      event.respondWith(new Response("Internal Error", { status: 500 }));
    }
  };
}
