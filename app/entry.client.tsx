import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";
import { swRegister } from "./utils/swRegistration.client";

hydrate(<RemixBrowser />, document);

// if the browser supports SW (all modern browsers do it)
if ("serviceWorker" in navigator) {
  swRegister();
}
