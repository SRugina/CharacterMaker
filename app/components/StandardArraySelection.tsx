import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  abilityNameToShorthand,
  abilityScoreToModifier,
} from "~/utils/helpers";
import { RecursivePartial, StoredAbilities } from "~/utils/types";

export interface StandardArraySelectionProps {
  abilities: RecursivePartial<Omit<StoredAbilities, "method">>;
  setAbilities: Dispatch<
    SetStateAction<RecursivePartial<Omit<StoredAbilities, "method">>>
  >;
}

export const StandardArraySelection = ({
  abilities,
  setAbilities,
}: StandardArraySelectionProps) => {
  const abilityNames = [
    "Strength",
    "Dexterity",
    "Constitution",
    "Intelligence",
    "Wisdom",
    "Charisma",
  ];
  // get a list of the initially set ability score values (numbers)
  // from the provided object
  const initialChoicesUsed = Object.values(abilities).map((v) => v.base);
  // create the Standard Array, alongside their modifier value in brackets
  // useMemo is a react optimisation so that the constant is not remade
  // on every render
  const standardArrayChoices = useMemo(
    () => [
      `15 (${abilityScoreToModifier(15, true)})`,
      `14 (${abilityScoreToModifier(14, true)})`,
      `13 (${abilityScoreToModifier(13, true)})`,
      `12 (${abilityScoreToModifier(12, true)})`,
      `10 (${abilityScoreToModifier(10, true)})`,
      `8 (${abilityScoreToModifier(8, true)})`,
    ],
    []
  );
  // this is used to set the available choices. Initially set to the options
  // that begin with values already set in the initialChoicesUsed variable
  const [standardArrayChoicesUsed, setStandardArrayChoicesUsed] = useState<
    string[]
  >(
    standardArrayChoices.filter((v) =>
      initialChoicesUsed.includes(Number(v.split(" ")[0]))
    )
  );
  // string is the choice (from standardArrayChoices),
  // boolean is whether it is selectable
  const [availableChoices, setAvailableChoices] = useState<[string, boolean][]>(
    standardArrayChoices.map((v) => [
      v,
      !initialChoicesUsed.includes(Number(v.split(" ")[0])),
    ])
  );
  // whenever the used choices changes, update the available choices
  // based on the ones that have been used so far
  useEffect(() => {
    const newAvailableChoices: [string, boolean][] = standardArrayChoices.map(
      (v) => [v, !standardArrayChoicesUsed.includes(v)]
    );
    setAvailableChoices(newAvailableChoices);
  }, [standardArrayChoices, standardArrayChoicesUsed]);

  return (
    <div className="flex flex-col">
      {abilityNames.map((ability) => {
        return (
          <label key={ability}>
            <span>{ability}</span>
            <select
              className="block mt-1 bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100"
              name={abilityNameToShorthand(ability)}
              onChange={(e) => {
                setStandardArrayChoicesUsed((old) => {
                  // get text value with code from https://stackoverflow.com/a/34091754/11274749
                  const text = e.target.options[e.target.selectedIndex].text;
                  let res = [];
                  if (
                    (abilityNameToShorthand(ability) as keyof Omit<
                      StoredAbilities,
                      "method"
                    >) in abilities
                  ) {
                    // user wants to deselect their current option (making it available elsewhere)
                    // so we need to find and re-show the option
                    res = old.filter(
                      (v) =>
                        Number(v.split(" ")[0]) !==
                        abilities[
                          abilityNameToShorthand(ability) as keyof Omit<
                            StoredAbilities,
                            "method"
                          >
                        ]!.base
                    );
                    // as long as the user isn't resetting to the unselected option,
                    // we should add their new choice to the used choices array
                    if (text !== "---") {
                      res = res.includes(text) ? res : [...res, text];
                    }
                  } else {
                    // user is selecting an option for the first time,
                    // so add it to the used choices array ("---" is the default
                    // selection so cannot be picked without picking something
                    // else first, in which case the first part of this if statement
                    // executes instead)
                    res = old.includes(text) ? old : [...old, text];
                  }
                  const val = e.target.value;
                  setAbilities((old) => {
                    // as long as the user hasn't reset to the "---" default option,
                    // update ability score's base value
                    if (val !== "") {
                      old[
                        abilityNameToShorthand(ability) as keyof Omit<
                          StoredAbilities,
                          "method"
                        >
                      ] = { base: Number(val) };
                    } else {
                      // if the user resets to the "---" option, reset the value
                      // in abilities
                      delete old[
                        abilityNameToShorthand(ability) as keyof Omit<
                          StoredAbilities,
                          "method"
                        >
                      ];
                    }
                    return old;
                  });
                  return res;
                });
              }}
              value={
                (
                  abilities[
                    abilityNameToShorthand(ability) as keyof Omit<
                      StoredAbilities,
                      "method"
                    >
                  ] || { base: "" }
                ).base
              }
            >
              <option value="">---</option>
              {availableChoices.map((value) => {
                return (
                  <option
                    key={Number(value[0].split(" ")[0])}
                    value={Number(value[0].split(" ")[0])}
                    hidden={!value[1]}
                  >
                    {value}
                  </option>
                );
              })}
            </select>
          </label>
        );
      })}
    </div>
  );
};
