import {
  Numerable,
  RecursivePartial,
  RenderedAbilities,
  RenderedSheet,
  StoredAbilities,
  StoredASIMod,
  StoredSkillsMod,
  TemplateReference,
  TemplateReferenceAbilities,
} from "./types";

// format positive number with a + sign (negative numbers already have a - sign)
export const formatNumber = (number: number) => {
  return number < 0 ? number.toString() : `+${number}`;
};

// convert an Ability Score into its respective Modifier
export function abilityScoreToModifier(score: number, format: true): string;
export function abilityScoreToModifier(score: number, format: false): number;
export function abilityScoreToModifier(score: number, format: boolean) {
  const res = Math.floor((score - 10) / 2);
  if (format) {
    return formatNumber(res);
  } else {
    return res;
  }
}

export const abilityNameToShorthand = (ability: string): string => {
  switch (ability) {
    case "Strength":
      return "STR";
    case "Dexterity":
      return "DEX";
    case "Constitution":
      return "CON";
    case "Intelligence":
      return "INT";
    case "Wisdom":
      return "WIS";
    case "Charisma":
      return "CHA";
  }
  return "ERROR";
};

// a list of the default D&D 5e Skills,
// and the abilities they are tied to
const DEFAULT_SKILLS: StoredSkillsMod = {
  acrobatics: "DEX",
  "animal handling": "WIS",
  arcana: "INT",
  athletics: "STR",
  deception: "CHA",
  history: "INT",
  insight: "WIS",
  intimidation: "CHA",
  investigation: "INT",
  medicine: "WIS",
  nature: "INT",
  perception: "WIS",
  performance: "CHA",
  persuasion: "CHA",
  religion: "INT",
  "sleight of Hand": "DEX",
  stealth: "DEX",
  survival: "WIS",
};

// apply the provided abilities to the sheet,
// handling the default skills too
export const applyAbilities = (
  baseAbilities: StoredAbilities,
  sheet: RecursivePartial<RenderedSheet>
): void => {
  if (!sheet.abilities) {
    sheet.abilities = {};
  }
  for (let abilityOrMethod in baseAbilities) {
    if (abilityOrMethod === "method") {
      sheet.abilities.method = baseAbilities.method;
      continue;
    }
    let ability = abilityOrMethod as keyof Omit<RenderedAbilities, "method">;
    if (!sheet.abilities[ability]) {
      sheet.abilities[ability] = {};
    }
    sheet.abilities[ability]!.base = baseAbilities[ability].base;
  }
  const source = (name: keyof StoredASIMod): TemplateReferenceAbilities => {
    return {
      type: "abilities",
      name,
    };
  };
  for (let skill in DEFAULT_SKILLS) {
    processModSkills(
      { [skill]: DEFAULT_SKILLS[skill] },
      sheet,
      source(DEFAULT_SKILLS[skill] as keyof StoredASIMod)
    );
  }
};

// apply the provided skills to the sheet, handling proficiency and expertise,
// and bonuses with their source attributed to as well
export const processModSkills = (
  skills: StoredSkillsMod,
  sheet: RecursivePartial<RenderedSheet>,
  source: TemplateReference
): void => {
  if (!sheet.skills) {
    sheet.skills = {};
  }
  for (let skill in skills) {
    if (!sheet.skills[skill]) {
      sheet.skills[skill] = {};
    }
    if (skills[skill] === "prof" || skills[skill] === "exp") {
      sheet.skills[skill]![skills[skill] as "prof" | "exp"] = source;
    } else {
      if (!sheet.skills[skill]!.bonuses) {
        sheet.skills[skill]!.bonuses = [];
      }
      sheet.skills[skill]!.bonuses!.push({
        source,
        bonus: skills[skill] as Omit<Numerable, "prof">,
      });
    }
  }
};
