import { useState } from "react";
import { useSubmit } from "remix";
import { OverviewMetadata } from "~/utils/types";
import { OverviewCard } from "./OverviewCard";

export interface OverviewSectionProps {
  title: string;
  endpoint: string;
  data: OverviewMetadata[];
}

// svg icons used from https://heroicons.com

export const OverviewSection = ({
  title,
  endpoint,
  data,
}: OverviewSectionProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const submit = useSubmit();

  // the submit method handles the redirect that the new action
  // returns for us
  const newSheet = () => {
    submit(null, { method: "post", action: `${endpoint}/new` });
  };
  return (
    <div className="container mx-auto text-left">
      <h2 className="flex" onClick={() => setCollapsed(!collapsed)}>
        <span>
          {collapsed ? (
            <>
              {/* chevron right icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 lg:h-10 lg:w-10"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          ) : (
            <>
              {/* chevron down icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 lg:h-10 lg:w-10"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          )}
        </span>{" "}
        {title}
      </h2>
      <div
        className={`container mx-auto flex flex-wrap${
          collapsed ? " hidden" : ""
        }`}
        aria-expanded={!collapsed}
      >
        {data.map((meta) => {
          return <OverviewCard key={meta.id} meta={meta} endpoint={endpoint} />;
        })}
        <button
          type="button"
          aria-label="create new character sheet"
          onClick={newSheet}
          className="ml-2 mt-2 font-semibold text-9xl sm:text-6xl flex justify-center items-center bg-slate-300 dark:bg-slate-600 rounded-lg h-52 w-80 sm:h-32 sm:w-48 lg:h-28 lg:w-44 no-underline"
        >
          +
        </button>
      </div>
    </div>
  );
};
