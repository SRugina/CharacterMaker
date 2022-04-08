// check if the service worker is registered.
//
// If not, register the service worker and all future requests should go through it.
//
// If it is registered but not active (e.g. hard-refresh in browser), soft-reload
// the page to make the service worker active.
//
// Use a callback function if ever an inelegant redirect mechanism is needed
// to force the service worker to be used instead of the server, for example.
export const swRegister = (callback?: () => any) => {
  // modified from https://stackoverflow.com/a/62596701/11274749
  // to also register the worker if necessary
  navigator.serviceWorker.getRegistration().then(function (reg) {
    if (typeof reg === "undefined") {
      // copied from https://sergiodxa.com/articles/using-service-workers-with-remix
      // altered with further error logging
      navigator.serviceWorker
        .register("/sw.js")
        .then(function (registration) {
          console.log("Registration successful, scope is:", registration.scope);
          if (typeof callback !== "undefined") callback();
        })
        .catch(function (error) {
          console.log("Service worker registration failed, error:", error);
        });
    } else if (reg.active && !navigator.serviceWorker.controller) {
      // There's an active SW, but no controller for this tab.
      // Perform a soft reload to load everything from the SW and get
      // a consistent set of resources.
      window.location.reload();
    } else {
      // if there is a new service worker available,
      // switch to it once it is available with a soft reload
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing!;
        let reloading = false;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "activated") {
            if (!reloading) {
              window.location.reload();
              reloading = true;
            }
          }
        });
      });
      if (typeof callback !== "undefined") callback();
    }
  });
};
