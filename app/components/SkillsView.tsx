import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  abilityScoreToModifier,
  applyAbilities,
  formatNumber,
} from "~/utils/helpers";
import {
  AbilityBonus,
  RecursivePartial,
  RenderedSheet,
  StoredAbilities,
} from "~/utils/types";

// React's `useEffect` does not run with `abilities` as a dependency,
// most likely due to it being an object. Instead, we use the below
// boolean to trigger these effects were necessary.
export interface SkillsViewProps {
  abilities: RecursivePartial<Omit<StoredAbilities, "method">>;
  abilitiesChanged: boolean;
  setAbilitiesChanged: Dispatch<SetStateAction<boolean>>;
}

export const SkillsView = ({
  abilities,
  abilitiesChanged,
  setAbilitiesChanged,
}: SkillsViewProps) => {
  const [sheet, setSheet] = useState<RecursivePartial<RenderedSheet>>(() => {
    const tempSheet: RecursivePartial<RenderedSheet> = {};
    // it doesn't matter what method we pass, we only want the resulting
    // skills that will be inserted into the above sheet
    applyAbilities(
      { ...abilities, method: "Manual" } as StoredAbilities,
      tempSheet
    );
    return tempSheet;
  });
  useEffect(() => {
    if (abilitiesChanged) {
      setSheet(() => {
        const tempSheet: RecursivePartial<RenderedSheet> = {};
        // it doesn't matter what method we pass, we only want the resulting
        // skills that will be inserted into the above sheet
        applyAbilities(
          { ...abilities, method: "Manual" } as StoredAbilities,
          tempSheet
        );
        return tempSheet;
      });
    }
    setAbilitiesChanged(false);
  }, [abilities, abilitiesChanged, setAbilitiesChanged]);
  // convert array of AbilityBonus into the sum of all the bonuses
  const processBonuses = (bonuses: AbilityBonus[]) => {
    return bonuses.reduce(
      (res, bonus) =>
        res +
        (typeof bonus.bonus === "number"
          ? bonus.bonus
          : abilityScoreToModifier(
              (
                abilities[bonus.bonus as keyof typeof abilities] || {
                  base: NaN, // we check for NaN below
                }
              ).base!,
              false
            )),
      0
    );
  };
  // convert array of AbilityBonus into a message to show in a tooltip
  // of what sources the bonuses came from
  const processSources = (bonuses: AbilityBonus[]) => {
    let res = "Sources:\n";
    for (const bonus of bonuses) {
      res += `${"name" in bonus.source ? bonus.source.name : "custom"}: ${
        typeof bonus.bonus === "number"
          ? bonus.bonus
          : isNaN(
              abilityScoreToModifier(
                (
                  abilities[bonus.bonus as keyof typeof abilities] || {
                    base: NaN,
                  }
                ).base!,
                false
              )
            )
          ? "?"
          : abilityScoreToModifier(
              (
                abilities[bonus.bonus as keyof typeof abilities] || {
                  base: NaN,
                }
              ).base!,
              false
            )
      }\n`;
    }
    return res;
  };

  return (
    <div className="flex flex-col">
      <h3 className="!mt-0">Skills</h3>
      {Object.entries(sheet.skills!).map(([skill, data]) => (
        <span key={skill} className="outline outline-offset-1 outline-1">
          <span className="font-bold float-left ml-1">{skill}</span>
          <span
            className="underline decoration-dotted cursor-help float-right mr-1"
            title={processSources(data!.bonuses!)} // provides tooltip on hover on desktop
          >
            {formatNumber(processBonuses(data!.bonuses!)) !== "+NaN"
              ? formatNumber(processBonuses(data!.bonuses!))
              : "?"}
          </span>
        </span>
      ))}
    </div>
  );
};
