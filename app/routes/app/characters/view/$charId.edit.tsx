import {
  FormEventHandler,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  useFetcher,
  useLoaderData,
} from "remix";
import { SkillsView } from "~/components/SkillsView";
import { StandardArraySelection } from "~/components/StandardArraySelection";
import { updateCharacter } from "~/utils/helpers.server";
import { DBEnv, isIDBEnv } from "~/utils/idb.server";
import {
  RecursivePartial,
  StoredAbilities,
  StoredAbilitiesMethod,
  StoredSheet,
} from "~/utils/types";

// we will insert the id into the sheet before updating the character
// in the Action function, otherwise a request could technically assign
// a sheet a different id to the one it is stored under.
// Thus there is no id property on this interface.
interface StoredSheetEditRequest
  extends Omit<RecursivePartial<StoredSheet>, "id"> {
  updateMeta: boolean;
}

// method is too general a name, so when more functionality is added to
// this page it could cause clashes. For now, rename to abilityGenMethod
interface StoredSheetFormData extends Omit<StoredAbilities, "method"> {
  name: string;
  updateMeta: boolean;
  abilityGenMethod?: StoredAbilitiesMethod;
}

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method === "POST") {
    if (isIDBEnv(DBEnv)) {
      // extract our request "body" from our headers, due to a bug in Remix,
      // possibly due to us running it in a service worker, where the Action
      // function does not receive the request body that was sent
      let body = request.headers.get("Body-Data");
      if (body !== null) {
        const { updateMeta, ...sheet } = JSON.parse(
          body
        ) as StoredSheetEditRequest;
        if ("name" in sheet) {
          console.log("sheet", sheet);
          const success = await updateCharacter(
            params.charId!,
            { ...sheet, id: params.charId! },
            updateMeta ?? true // if updateMeta is not defined, assume we do
          );
          return json({ success }, { status: 200 });
        } else {
          return json(
            {
              error: "a sheet object must include at least a name",
            },
            { status: 422 }
          );
        }
      } else {
        return json(
          { error: "must provide request body in the `Body-Data` HTTP Header" },
          { status: 400 }
        );
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

export default function EditCharacter() {
  // initially populate fields with the stored data
  const { storedCharacter } = useLoaderData<loaderData>();
  const [sheetName, setSheetName] = useState(
    "name" in (storedCharacter || {})
      ? storedCharacter.name
      : "Placeholder Name"
  );
  const [abilityGenMethod, setAbilityGenMethod] = useState(
    "abilities" in (storedCharacter || {})
      ? "method" in storedCharacter.abilities!
        ? storedCharacter.abilities.method
        : "Standard Array"
      : "Standard Array"
  );
  const [abilities, setAbilities] = useState<
    RecursivePartial<Omit<StoredAbilities, "method">>
  >(
    "abilities" in (storedCharacter || {})
      ? (() => {
          const { method, ...storedCharacterAbilities } =
            storedCharacter.abilities!;
          return storedCharacterAbilities;
        })()
      : {}
  );

  // set up variables needed to handle data from the `fetcher.Form`
  const fetcher = useFetcher();
  // we need to store a reference to the Form for the saveToLocal function
  // below to know where to point to for the form data
  const formRef = useRef<HTMLFormElement>();

  // React optimisation, the function will not be recreated on rerender
  // but only if the values in the dependency array change
  const saveToLocal = useCallback(
    (form: HTMLFormElement) => {
      // extract form inputs into a JSON object
      const formData = Object.fromEntries(
        new FormData(form)
      ) as unknown as StoredSheetFormData;

      // for now, the sheet name is the only changeable piece of data
      // stored in both the characters and charactersMetadata objectStores
      if (formData.name !== storedCharacter.name) {
        formData.updateMeta = true;
      } else {
        formData.updateMeta = false;
      }

      // `formDataAbilities` will have the base values as strings, so later
      // we override `formDataAbilities` with the `abilities` object, which has
      // the user selected options as numbers
      const { name, updateMeta, abilityGenMethod, ...formDataAbilities } =
        formData;

      // reorganise formData into format expected by Action Function
      const data: StoredSheetEditRequest = {
        name,
        abilities: {
          method: formData.abilityGenMethod,
          ...formDataAbilities,
          ...abilities, // override formDataAbilities with user-selected numbers
        },
        updateMeta,
      };

      console.log("request", data);

      let url = new URL(window.location.href);
      // this forces Remix to respond with our Action's response, not the HTML below
      url.searchParams.set("_data", "routes/app/characters/view/$charId.edit");

      // due to a bug with Remix, or at least Remix when running inside a Browser's Service Worker
      // `useFetcher` or even attaching a request body below has no effect on the Action's request
      // i.e. the Action function never receives the Request's body.
      // Thus, we instead attach the request data as a header until the above issue is fixed.
      const request = new Request(url.href, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Body-Data": JSON.stringify(data),
        },
      });

      // add the above request to the end of the queue
      setUpdateQueue((oldQueue) => [...oldQueue, request]);
    },
    [storedCharacter.name, abilities]
  );

  // setup browser prompt when changes haven't yet been saved
  // and the user is trying to leave
  const [hasChanged, setHasChanged] = useState(false);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      // only prompt the user if we have not yet saved their changes
      if (hasChanged) {
        // copied from https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
        // Cancel the event
        event.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        event.returnValue = "";

        // hopefully this request completes by the time the user accepts
        // the above browser prompt
        saveToLocal(formRef.current!);
      } else {
        // copied from https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
        // the absence of a returnValue property on the event will guarantee the browser unload happens
        delete event["returnValue"];
      }
    };

    // if the user tries leaving the page, save their changes
    // to the local database first
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [hasChanged, saveToLocal]);

  // React optimisation, the function will not be recreated on rerender
  // but only if the values in the dependency array change
  const saveFetch = useCallback(async (request: Request) => {
    console.log("calling for request", request);
    // indicate a request is occuring, so do not send any others from
    // the queue until this is done
    setStoring(true);
    return fetch(request).then((rawResponse) => {
      rawResponse.json().then((response) => {
        console.log("response", response);
        // remove the request that just completed (i.e. oldQueue[0])
        setUpdateQueue((oldQueue) => oldQueue.slice(1));

        setStoring(false);
      });
    });
  }, []);

  // updateQueue that executes Requests made by the user sequentially
  const [storing, setStoring] = useState(false);
  const [updateQueue, setUpdateQueue] = useState<Request[]>([]);
  // specifying updateQueue in the dependency array means this Effect
  // will be called whenever the value of updateQueue changes
  useEffect(() => {
    console.log("queue", updateQueue);
    if (updateQueue.length === 0) {
      // no more changes to store
      setHasChanged(false);
    } else if (!storing) {
      // not currently storing, so send the next queued request
      const request = updateQueue[0];
      (async () => await saveFetch(request))();
    } else {
      // otherwise, a request is currently being sent
      // so do nothing for now other than indicate that
      // changes are being made
      setHasChanged(true);
    }
  }, [updateQueue, storing, saveFetch]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    // `event.currentTarget` is the `<fetcher.Form>` below
    saveToLocal(event.currentTarget);
  };

  // when the user modifies the form, assume changes have been made
  const handleChange = () => {
    setHasChanged(true);
  };

  // React's `useEffect` does not run with `abilities` as a dependency,
  // most likely due to it being an object. Instead, we use the below
  // boolean to trigger these effects were necessary.
  const [abilitiesChanged, setAbilitiesChanged] = useState(false);

  return (
    <>
      {storedCharacter ? (
        <>
          <h1>Edit Character</h1>
          <p>
            If you leave/reload the page without saving your changes, we will
            try our best to save them for you when the browser popup appears.
          </p>
          <fetcher.Form
            method="post"
            onSubmit={handleSubmit}
            onChange={handleChange}
            ref={formRef as MutableRefObject<HTMLFormElement>}
          >
            <label>
              <span>Character Name</span>
              <input
                type="text"
                name="name"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
              />
            </label>
            <h2>Ability Scores</h2>
            <div className="container flex justify-between">
              <div>
                <label className="block">
                  <span>Generation Method</span>
                  <select
                    className="block mt-1"
                    name="abilityGenMethod"
                    value={abilityGenMethod}
                    onChange={(e) =>
                      setAbilityGenMethod(
                        e.target.value as StoredAbilitiesMethod
                      )
                    }
                  >
                    <option value="Standard Array">Standard Array</option>
                    <option disabled title="Coming Soon" value="Point Buy">
                      Point Buy
                    </option>
                    <option disabled title="Coming Soon" value="Rolled">
                      Rolled
                    </option>
                    <option disabled title="Coming Soon" value="Manual">
                      Manual
                    </option>
                  </select>
                </label>
                {abilityGenMethod === "Standard Array" ? (
                  <div>
                    <StandardArraySelection
                      abilities={abilities}
                      setAbilities={(newAbilities) => {
                        setAbilitiesChanged(true);
                        setAbilities(newAbilities);
                      }}
                    />
                  </div>
                ) : (
                  <>{/* TODO: other generation methods */}</>
                )}
              </div>
              <SkillsView
                abilities={abilities}
                abilitiesChanged={abilitiesChanged}
                setAbilitiesChanged={setAbilitiesChanged}
              />
            </div>
            <button
              type="submit"
              className="mt-1 mb-2 font-bold bg-cyan-600 rounded-lg text-gray-100 p-1 mx-auto"
            >
              Update
            </button>
          </fetcher.Form>
        </>
      ) : (
        <h1>Character not Found</h1>
      )}
    </>
  );
}
