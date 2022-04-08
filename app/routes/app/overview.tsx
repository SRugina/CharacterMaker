import { json, LoaderFunction, useLoaderData } from "remix";
import { OverviewSection } from "~/components/OverviewSection";
import { DBEnv, isIDBEnv } from "~/utils/idb.server";
import { OverviewMetadata } from "~/utils/types";

interface loaderData {
  characters: OverviewMetadata[];
}

export const loader: LoaderFunction = async () => {
  if (isIDBEnv(DBEnv)) {
    const characters = await DBEnv.charactersMetadata.list();
    return json({ characters });
  } else {
    // TODO: implement else when Online Functionality is added
    // for now return empty data have the service worker reload it
    return json({ characters: [] });
  }
};

export default function Overview() {
  const { characters } = useLoaderData<loaderData>();
  return (
    <>
      <h1>Overview</h1>
      <OverviewSection
        title="Characters"
        endpoint="/app/characters"
        data={characters}
      />
    </>
  );
}
