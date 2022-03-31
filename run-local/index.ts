import "./globals";

// copied from https://github.com/remix-run/remix/blob/0523d32a20a354c49858765fed45b35976cdcf95/packages/remix-cloudflare-workers/index.ts

export type { GetLoadContextFunction, RequestHandler } from "./worker";
export {
  createEventHandler,
  createRequestHandler,
  handleAsset,
} from "./worker";
