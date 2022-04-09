import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "remix";

// copied from https://stackoverflow.com/a/53914092/11274749
// we use it to track when the "dark" class is added to the page
// due to the user toggling the theme / OS preference
class ClassWatcher {
  observer: MutationObserver | null;
  lastClassState: boolean;

  constructor(
    public targetNode: HTMLElement,
    public classToWatch: string,
    public classAddedCallback: () => void,
    public classRemovedCallback: () => void
  ) {
    this.observer = new MutationObserver(this.mutationCallback);
    this.lastClassState = targetNode.classList.contains(this.classToWatch);

    this.observe();
  }

  observe() {
    this.observer!.observe(this.targetNode, { attributes: true });
  }

  disconnect() {
    this.observer!.disconnect();
  }

  mutationCallback: MutationCallback = (mutationsList) => {
    for (let mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        let currentClassState = (
          mutation.target as HTMLElement
        ).classList.contains(this.classToWatch);
        if (this.lastClassState !== currentClassState) {
          this.lastClassState = currentClassState;
          if (currentClassState) {
            this.classAddedCallback();
          } else {
            this.classRemovedCallback();
          }
        }
      }
    }
  };
}

export default function App() {
  const navigate = useNavigate();
  useEffect(() => {
    // service worker is not supported, return to landing page
    // where more information is about the user's unsupported
    // browser is shown
    if (!("serviceWorker" in navigator)) {
      navigate("/", { replace: true });
    } else if (location.pathname === "/app" || location.pathname === "/app/") {
      // this route is just a wrapper for all the sub-pages under `/app/`
      // so send to the overview page if a user mistakenly arrives here
      navigate("/app/overview", { replace: true });
    }
  }, [navigate]);
  // keep track of whether dark mode is set or not
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const watcher = new ClassWatcher(
      document.documentElement,
      "dark",
      () => {
        // this function is called when the "dark" class gets added
        setDark(true);
      },
      () => {
        // this function is called when the "dark" class is removed
        setDark(false);
      }
    );
    return () => {
      // when the page re-renders, disconnect the watcher
      // so that it does not conflict with the one made by the new render
      watcher.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen justify-between">
      <div className="mb-auto prose lg:prose-xl dark:prose-invert container mx-auto px-4">
        <nav className="not-prose mx-auto !mt-3 flex justify-between">
          <Link
            to="/app/overview"
            className="font-bold bg-cyan-600 rounded-lg text-gray-100 p-1 mx-auto"
          >
            To the Overview Page
          </Link>
          <button
            className="font-bold bg-slate-800 text-slate-100 dark:bg-slate-100 dark:text-slate-800 rounded-lg p-1 mx-auto"
            onClick={() => {
              localStorage.setItem("theme", dark ? "light" : "dark");
              // the "storage" event only triggers from other tabs by default,
              // so force it to trigger here so that the current tab updates the theme
              window.dispatchEvent(new Event("storage"));
            }}
          >
            Toggle Theme
          </button>
        </nav>
        <Outlet />
      </div>
    </div>
  );
}
