// copied from https://github.com/remix-run/remix/blob/0523d32a20a354c49858765fed45b35976cdcf95/packages/remix-cloudflare/globals.ts

// https://stackoverflow.com/a/59499895
export {};

declare global {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
  }

  interface WorkerGlobalScope {
    process: { env: ProcessEnv };
  }
}
