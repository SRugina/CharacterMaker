import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "remix";
import { swRegister } from "~/utils/swRegistration.client";

export default function Index() {
  const [supported, setSupported] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setSupported(false);
    }
  }, []);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const params = new URLSearchParams(location.search);
      if (params.get("redirect") !== null) {
        swRegister(() => {
          navigate(params.get("redirect")!, { replace: true });
        });
      }
    }
  }, [location.search, navigate]);
  return (
    <div className="flex flex-col h-screen justify-between">
      <div className="mb-auto prose lg:prose-xl dark:prose-invert container mx-auto">
        <h1 className="text-center">Welcome to the CharacterMaker</h1>
        <p>
          This is an extremely simple proof-of-concept for an offline-first web
          app that allows one to create Dungeons & Dragons Character Makers.
        </p>
        {supported ? (
          <div className="not-prose container mx-auto text-center">
            <Link
              to="/app/overview"
              className="font-bold bg-cyan-600 rounded-lg text-gray-100 p-1 mx-auto"
            >
              To the Overview Page
            </Link>
          </div>
        ) : (
          <p>
            Unfortunately, your browser does not support Service Workers, which
            this web app requires to function. Try updating to the latest
            version, checking your settings, or using another browser.
          </p>
        )}
      </div>
      <footer className="text-center prose dark:prose-invert container mx-auto">
        <a
          href="https://github.com/SRugina/CharacterMaker"
          className="underline"
        >
          To the source code (GitHub)
        </a>
      </footer>
    </div>
  );
}
