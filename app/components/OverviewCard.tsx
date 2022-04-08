import { Link, useFetcher } from "remix";
import { OverviewMetadata } from "~/utils/types";

export interface OverviewCardProps {
  meta: OverviewMetadata;
  endpoint: string;
}

// svg icons used from https://heroicons.com

export const OverviewCard = ({ meta, endpoint }: OverviewCardProps) => {
  // by using Remix's `fetcher.Form`, the page will not redirect when the delete button is clicked
  // but gracefully load the updated data once the request is complete instead
  // without any visible page reloading
  const fetcher = useFetcher();
  return (
    <div className="relative ml-2 mt-2 font-bold bg-slate-400 dark:bg-slate-500 rounded-lg h-52 w-80 sm:h-32 sm:w-48 lg:h-28 lg:w-44">
      <Link
        to={`${endpoint}/view/${meta.id}`}
        className="inline-block h-full w-full lg:prose-base"
      >
        <h2 className="text-ellipsis line-clamp-2 overflow-hidden break-words leading-tight">
          {meta.name}
        </h2>
      </Link>
      <div className="absolute z-2 top-0 right-0 flex w-full justify-between">
        <Link
          to={`${endpoint}/view/${meta.id}/edit`}
          className=""
          aria-label={`edit character ${meta.name}`}
        >
          {/* edit icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path
              fillRule="evenodd"
              d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
        <fetcher.Form action={`${endpoint}/view/${meta.id}`} method="delete">
          <fieldset disabled={fetcher.state === "submitting"}>
            <button
              type="submit"
              className="text-red-600"
              aria-label={`delete character ${meta.name}`}
            >
              {fetcher.state === "submitting" ? (
                <>
                  {/* refresh (i.e. loading) icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              ) : (
                <>
                  {/* trash bin icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </button>
          </fieldset>
        </fetcher.Form>
      </div>
    </div>
  );
};
