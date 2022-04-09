import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "remix";
import type { MetaFunction } from "remix";
import styles from "./tailwind.css";
import { useEffect } from "react";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "CharacterMaker",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  useEffect(() => {
    const checkDarkMode = () => {
      const theme = localStorage.getItem("theme");
      // copied from https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually
      // On page load or when changing themes, best to add inline in `head` to avoid FOUC
      if (
        theme === "dark" ||
        (theme === null &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    // call on first render
    checkDarkMode();

    // call subsequently when the toggle in `./routes/app.tsx` is clicked
    // and when the OS preference changes
    window.addEventListener("storage", checkDarkMode);
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", checkDarkMode);

    return () => {
      // when the page re-renders, disconnect the listeners
      // so that they do not conflict with the ones made by the new render
      window.removeEventListener("storage", checkDarkMode);
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", checkDarkMode);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-100 dark:bg-slate-800">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
