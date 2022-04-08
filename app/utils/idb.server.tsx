import {
  DBSchema,
  IDBPDatabase,
  openDB,
  StoreNames,
} from "idb/with-async-ittr";
import { RecursivePartial, StoredSheet, OverviewMetadata } from "./types";
import { CharacterMetaStore, CharacterStore } from "./charStores.server";

// specify our database schema for TypeScript compiler checks
export interface IDBSchema extends DBSchema {
  charactersMetadata: {
    key: string;
    value: OverviewMetadata;
    indexes: {
      by_name: string;
    };
  };
  characters: {
    key: string;
    // a Sheet might be incomplete, we should still store it though
    value: RecursivePartial<StoredSheet>;
  };
}

// locally, we do not need to implement the transaction property
// of the Cloudflare Durable Object Storage API
export interface IDBObjectStorage
  extends Omit<DurableObjectStorage, "transaction"> {}

// locally, we only need to implement the storage property
// of the Cloudflare Durable Object State API
export interface IDBObjectState {
  storage: IDBObjectStorage;
}

// simple wrapper to create the local, Durable Object-like, state object
export const makeIDBState = (storage: IDBObjectStorage): IDBObjectState => {
  return {
    storage: storage,
  };
};

// define a global variable that will hold access to our local database
export interface IDBEnv {
  DATABASE: Promise<IDBPDatabase<IDBSchema>>;
  charactersMetadata: CharacterMetaStore;
  characters: CharacterStore;
}

export class IDBEnvClass implements IDBEnv {
  charactersMetadata: CharacterMetaStore;
  characters: CharacterStore;
  DATABASE = openDB<IDBSchema>("CharacterMaker", 1, {
    upgrade(db) {
      // this is called when a database of the specified version (here, `1`)
      // is opened for the first time. Hence, let's implement our Schema
      // from earlier.

      // the character's unique randomly-generated id
      // is stored within the object, so specify `keyPath`
      db.createObjectStore("characters", {
        keyPath: "id",
        autoIncrement: false,
      });
      // so we do not have to fetch the entire character for previews
      // also store metadata objects about characters
      const charactersMetadataStore = db.createObjectStore(
        "charactersMetadata",
        {
          keyPath: "id",
          autoIncrement: false,
        }
      );
      // to allow, in future, easy sorting of characters by name
      charactersMetadataStore.createIndex("by_name", "name");
    },
  });

  constructor() {
    // set up the database when this class is constructed
    (async () => await this.DATABASE)();
    // add our Durable Object classes to this class
    this.charactersMetadata = new CharacterMetaStore(
      makeIDBState(this.genIDBStorage("charactersMetadata")),
      this
    );
    this.characters = new CharacterStore(
      makeIDBState(this.genIDBStorage("characters")),
      this
    );
  }

  // mostly mimic the Durable Object Storage API to allow for easier
  // implementation of Online Functionality in the future
  public genIDBStorage(store: StoreNames<IDBSchema>): IDBObjectStorage {
    return new (class {
      // annoyingly, the Cloudflare type for Storage uses an odd generic type T
      // that cannot be set here as it can be overridden when called, so
      // below we keep this T generic to match the Clodflare Type Definition

      // should return the value(s) for the specified key(s)
      async get<T>(key: string): Promise<T>;
      async get<T>(keys: string[]): Promise<T>;
      async get(keys: string | string[]) {
        if (typeof keys === "string") {
          return (await (DBEnv as IDBEnv).DATABASE).get(store, keys);
        } else {
          return Promise.all(
            keys.map(async (key: string) =>
              (await (DBEnv as IDBEnv).DATABASE).get(store, key)
            )
          );
        }
      }
      // should return all entries in an objectStore
      async list<T>(): Promise<Map<string, T>> {
        const tx = (await (DBEnv as IDBEnv).DATABASE).transaction(
          store,
          "readonly"
        );
        return Promise.all([tx.store.getAllKeys(), tx.store.getAll(), tx.done])
          .then(([keys, values]) =>
            keys.map<[string, T]>((key, i) => [key, values[i] as unknown as T])
          )
          .then((res) => {
            return new Map(res);
          });
      }
      // should update the value(s) at the specified key(s), creating the entry
      // if the key does not exist
      async put(
        key: string,
        value: IDBSchema[typeof store]["value"]
      ): Promise<void>;
      async put<T>(entries: Record<string, T>): Promise<void>;
      async put(
        entries: string | Record<string, IDBSchema[typeof store]["value"]>,
        value?: IDBSchema[typeof store]["value"]
      ) {
        if (typeof entries === "string") {
          // indexedDB returns an error if you specify a key when the objectstore
          // uses `keyPath`, so here we check for `id` and do not specify the key
          // if it is present
          return (await (DBEnv as IDBEnv).DATABASE)
            .put(store, value!, "id" in value! ? undefined : entries)
            .then(() => {});
        } else {
          return Promise.all(
            Object.entries(entries).map(async ([key, value]) =>
              (await (DBEnv as IDBEnv).DATABASE).put(
                store,
                value,
                "id" in value! ? undefined : key
              )
            )
          ).then(() => {});
        }
      }
      // should delete the entry(/ies) at the specified key(s)
      // returning true/false for if it was successful for one key
      // and returning the number of deleted entries for multiple keys
      async delete(key: string): Promise<boolean>;
      async delete(keys: string[]): Promise<number>;
      async delete(keys: string | string[]) {
        if (typeof keys === "string") {
          return (await (DBEnv as IDBEnv).DATABASE)
            .delete(store, keys)
            .then(() => true)
            .catch(() => false);
        } else {
          // Promise.allSettled will return an array of the results
          // whereas Promise.all will fail if any one of the requests fails
          return Promise.allSettled(
            keys.map(async (key: string) =>
              (await (DBEnv as IDBEnv).DATABASE).delete(store, key)
            )
          ).then((results) => {
            let count = 0;
            results.forEach((res) => {
              if (res.status === "fulfilled") count++;
            });
            return count;
          });
        }
      }
      // should delete all entries in an objectStore
      async deleteAll() {
        return (await (DBEnv as IDBEnv).DATABASE).clear(store);
      }
    })();
  }
}

// TODO: specify the type of the Durable Object env
// when Online Functionality is added, instead of `{}`
export type DBEnv = IDBEnv | {};

let _DBEnv: { DBEnv?: DBEnv } = {};
// if indexedDB does not exist, this code is running in the cloud
// and thus does not have access to indexedDB
if (typeof indexedDB !== "undefined") {
  _DBEnv.DBEnv = new IDBEnvClass();
} else {
  _DBEnv.DBEnv = {};
}

// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentionally naming the variable the same as the type
export const { DBEnv } = _DBEnv;

// helper function for TypeScript compiler checking
export const isIDBEnv = (env: DBEnv): env is IDBEnv => {
  return Object.getOwnPropertyNames(env).length !== 0;
};
