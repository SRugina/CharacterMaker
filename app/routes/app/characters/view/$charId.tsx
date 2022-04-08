import { ActionFunction, json, LoaderFunction, useLoaderData } from "remix";
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
        return new Response(null, { status: 200 });
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
  return (
    <>
      {storedCharacter ? (
        <>
          <h1>{storedCharacter.name || "No Name"}</h1>
        </>
      ) : (
        <h1>Character not Found</h1>
      )}
    </>
  );
}
