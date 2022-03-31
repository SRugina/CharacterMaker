import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";

hydrate(<RemixBrowser />, document);

// copied from https://sergiodxa.com/articles/using-service-workers-with-remix
// altered with further error logging

// if the browser supports SW (all modern browsers do it)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // we will register it after the page complete the load
    navigator.serviceWorker
      .register("/sw.js")
      .then(function (registration) {
        console.log("Registration successful, scope is:", registration.scope);
      })
      .catch(function (error) {
        console.log("Service worker registration failed, error:", error);
      });
  });
}
