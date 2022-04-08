import { ActionFunction, json, redirect } from "remix";
import { newCharacter } from "~/utils/helpers.server";
import { DBEnv, isIDBEnv } from "~/utils/idb.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method === "POST") {
    if (isIDBEnv(DBEnv)) {
      const { id } = (await newCharacter("Placeholder Name"))!;
      return redirect(`/app/characters/view/${id}/edit`);
    } else {
      // TODO: implement else when Online Functionality is added
      return json(
        { error: "Online Functionality is not yet available" },
        { status: 404 }
      );
    }
  }
};
