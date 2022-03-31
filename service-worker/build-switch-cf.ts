import * as fs from "fs/promises";

const run = async () => {
  try {
    // switch out the service worker remix config
    await fs.rename("./remix.config.js", "./sw.remix.config.js");
    // bring back the cloudflare pages remix config
    await fs.rename("./cf.remix.config.js", "./remix.config.js");
    // delete build artefacts that are not needed
    await fs.rm("./worker-build", { recursive: true, force: true });
    console.log("successfully switched to cloudflare config");
  } catch (error: any) {
    console.error("there was an error:", error.message);
  }
};

run();
