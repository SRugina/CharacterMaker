import { RecursivePartial, StoredSheet, OverviewMetadata } from "./types";
import { DBEnv, IDBObjectState, isIDBEnv } from "./idb.server";

// implement our local objectStores as Cloudflare Durable Objects
// so that when Online Functionality is added, we can use these same classes

export class CharacterMetaStore implements DurableObject {
  constructor(public state: IDBObjectState, public env: DBEnv) {}

  // TODO: Implement when Online Functionality is added
  async fetch(_request: Request) {
    return new Response(null, { status: 200 });
  }

  async list() {
    if (isIDBEnv(this.env))
      return (await this.env.DATABASE).getAllFromIndex(
        "charactersMetadata",
        "by_name"
      );
    // TODO: implement else when Online Functionality is added
  }

  async put(key: string, val: OverviewMetadata) {
    // hopefully, this will work both locally and on Cloudflare
    // as the storage type for both is effectively the same
    return await this.state.storage.put(key, val);
  }

  async delete(key: string) {
    return await this.state.storage.delete(key);
  }
}

export class CharacterStore implements DurableObject {
  constructor(public state: IDBObjectState, public env: DBEnv) {}

  // TODO: Implement when Online Functionality is added
  async fetch(_request: Request) {
    return new Response(null, { status: 200 });
  }

  async put(key: string, val: RecursivePartial<StoredSheet>) {
    return await this.state.storage.put(key, val);
  }

  async get(key: string) {
    return await this.state.storage.get<RecursivePartial<StoredSheet>>(key);
  }

  async delete(key: string) {
    return await this.state.storage.delete(key);
  }
}
