import { useEffect } from "react";
import { Outlet, useNavigate } from "remix";

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

  return (
    <div className="flex flex-col h-screen justify-between">
      <div className="mb-auto prose lg:prose-xl dark:prose-invert container mx-auto px-4">
        {/* TODO: <nav>NAVBAR</nav> */}
        <Outlet />
      </div>
    </div>
  );
}
