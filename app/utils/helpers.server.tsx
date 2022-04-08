import { encodeHex, random256bit } from "./crypto.server";
import { DBEnv, isIDBEnv } from "./idb.server";
import { RecursivePartial, StoredSheet } from "./types";

// creates a new character (with metadata) from the provided name
// returns the sheet generated
export async function newCharacter(name: string) {
  // automatically assign a random id (64 hex digits,
  // which should be a sufficiently large space
  // for no two characters to get the same id)
  const id = encodeHex(random256bit());
  const sheet = {
    id,
    name,
  };
  if (isIDBEnv(DBEnv)) {
    await Promise.all([
      DBEnv.charactersMetadata.put(id, sheet),
      DBEnv.characters.put(id, sheet),
    ]);
    return sheet;
  }
  // TODO: implement else when Online Functionality is added
}

// updates a character (and optionally its metadata)
// return true/false for success of the operation
export async function updateCharacter(
  id: string,
  sheet: RecursivePartial<StoredSheet>,
  updateMeta: boolean
) {
  if (isIDBEnv(DBEnv)) {
    try {
      // only update the charactersMetadata objectStore if it is indicated
      await Promise.all(
        updateMeta
          ? [
              DBEnv.charactersMetadata.put(id, { id, name: sheet.name! }),
              DBEnv.characters.put(id, sheet),
            ]
          : [DBEnv.characters.put(id, sheet)]
      );
      return true;
    } catch {
      return false;
    }
  }
  // TODO: implement else when Online Functionality is added
}
