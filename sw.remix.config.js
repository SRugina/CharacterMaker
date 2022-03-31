/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildTarget: "cloudflare-workers",
  server: "./service-worker/sw.ts",
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: [".*"],
  // appDirectory: "app",
  assetsBuildDirectory: "worker-build/public/build",
  serverBuildPath: "public/sw.js",
  // publicPath: "/build/",
};
