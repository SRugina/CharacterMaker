import * as fs from "fs/promises";

const run = async () => {
  try {
    // switch out the cloudflare pages remix config
    await fs.rename("./remix.config.js", "./cf.remix.config.js");
    // bring in the service worker remix config
    await fs.rename("./sw.remix.config.js", "./remix.config.js");
    console.log("successfully switched to worker config");
  } catch (error: any) {
    console.error("there was an error:", error.message);
  }
};

run();
