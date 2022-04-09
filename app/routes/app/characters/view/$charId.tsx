import {
  ActionFunction,
  json,
  Link,
  LoaderFunction,
  redirect,
  useFetcher,
  useLoaderData,
} from "remix";
import { AbilitiesView } from "~/components/AbilitiesView";
import { SkillsView } from "~/components/SkillsView";
import { DBEnv, isIDBEnv } from "~/utils/idb.server";
import { RecursivePartial, StoredSheet } from "~/utils/types";

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method === "DELETE") {
    if (isIDBEnv(DBEnv)) {
      // make sure to delete both the character and it's metadata object
      // from the objectStores
      const res = await Promise.all([
        DBEnv.characters.delete(params.charId!),
        DBEnv.charactersMetadata.delete(params.charId!),
      ]);
      if (res[0] !== true && res[1] !== true) {
        const error = `Failed to delete character with id: ${params.charId!}, response: ${res}`;
        console.error(error);
        return json({ error }, { status: 404 });
      } else {
        return redirect("/app/overview");
      }
    } else {
      // TODO: implement else when Online Functionality is added
      return json(
        { error: "Online Functionality is not yet available" },
        { status: 404 }
      );
    }
  }
};

interface loaderData {
  storedCharacter: RecursivePartial<StoredSheet>;
}

export const loader: LoaderFunction = async ({ params }) => {
  if (isIDBEnv(DBEnv)) {
    const storedCharacter = await DBEnv.characters.get(params.charId!);
    return json({ storedCharacter });
  } else {
    // TODO: implement else when Online Functionality is added
    // for now return empty data have the service worker reload it
    return json({ storedCharacter: {} });
  }
};

export default function RenderCharacter() {
  const { storedCharacter } = useLoaderData<loaderData>();
  const fetcher = useFetcher();
  return (
    <>
      {storedCharacter ? (
        <>
          <h1>
            {storedCharacter.name || "No Name"}
            <Link
              to={`/app/characters/view/${storedCharacter.id}/edit`}
              className="ml-2 inline-block"
              aria-label={`edit character ${storedCharacter.name}`}
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
            <fetcher.Form
              action={`/app/characters/view/${storedCharacter.id}`}
              method="delete"
              className="inline-block"
            >
              <fieldset
                disabled={fetcher.state === "submitting"}
                className="inline-flex"
              >
                <button
                  type="submit"
                  className="text-red-600 ml-4 inline-block"
                  aria-label={`delete character ${storedCharacter.name}`}
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
          </h1>
          <div className="container flex justify-between">
            <AbilitiesView abilities={storedCharacter.abilities || {}} />
            <SkillsView
              abilities={storedCharacter.abilities || {}}
              abilitiesChanged={false}
              setAbilitiesChanged={() => false}
            />
          </div>
        </>
      ) : (
        <h1>Character not Found</h1>
      )}
    </>
  );
}
