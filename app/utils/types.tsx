// copied from https://stackoverflow.com/a/51365037/11274749
// makes all properties of a type/interface optional
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

export interface StoredSheet {
  id: string;
  name: string;
  race: StoredRace;
  abilities: StoredAbilities;
  custom?: StoredFeatureList;
}

export interface OverviewMetadata {
  id: string;
  name: string;
}

export interface StoredFeatureList {
  [name: string]: StoredFeature;
}

export interface StoredRace {
  name: string;
  template: TemplateReferenceExternal;
  features: StoredFeatureList;
}

export interface TemplateRace {
  id: string;
  name: string;
  features: TemplateFeatureList;
}

export interface TemplateFeat {
  id: string;
  name: string;
  desc: string;
  mod?: StoredCharacterMod;
  config?: TemplateFeatureConfig;
}

export interface TemplateFeatureList {
  [name: string]: TemplateFeature;
}

export interface TemplateFeature {
  desc: string;
  mod?: StoredCharacterMod;
  config?: TemplateFeatureConfig;
}

export interface TemplateFeatureConfig {
  languages?: TemplateChoice<string>;
  ASI?: TemplateChoiceWithBonus<keyof StoredASIMod, number>;
  skills?: TemplateChoiceWithBonus<string, NumerableWithExpertise>;
  feats?: {
    choose: number;
  };
  tools?: TemplateChoice<string>;
  choice?: TemplateChoice<TemplateFeatureConfig>;
  // TODO: counters?: TemplateChoice<StoredCounterMod>;
}

// TODO: allow more types, e.g. value of skill bonus, raw value of Ability Score, initiative, etc.
type Numerable = number | "prof" | keyof StoredASIMod;
type NumerableWithExpertise = Numerable | "exp";

export interface TemplateChoice<T> {
  choose: Numerable;
  from?: T[];
  choices?: TemplateChoice<T>[];
}

export interface TemplateChoiceWithBonus<T, B> extends TemplateChoice<T> {
  bonus?: B | B[];
}

// stringified form: "type.'name'#id"
export interface TemplateReferenceExternal {
  type: "race" | "feats";
  name: string;
  id: string;
  feature?: string;
}

export interface TemplateReferenceAbilities {
  type: "abilities";
  name: keyof StoredASIMod;
}

export interface TemplateReferenceCustom {
  type: "custom";
}

export interface TemplateReferenceOverride {
  type: "override";
  for: TemplateReference;
}

type TemplateReference =
  | TemplateReferenceExternal
  | TemplateReferenceAbilities
  | TemplateReferenceCustom
  | TemplateReferenceOverride;

export interface FeatureOverride {
  desc?: string;
  mod?: StoredCharacterMod;
  note?: string;
}

export interface StoredFeature {
  desc: string;
  mod: StoredCharacterMod;
  overrides?: FeatureOverride;
}

export interface StoredCharacterMod {
  languages?: string[];
  ASI?: StoredASIMod;
  skills?: StoredSkillsMod;
  feats?: {
    [name: string]: StoredFeatMod;
  };
  tools?: string[];
  counters?: StoredCounterMod;
}

export interface CharacterModChoices extends StoredCharacterMod {
  choice?: StoredCharacterMod;
}

export interface StoredASIMod {
  STR?: number;
  DEX?: number;
  CON?: number;
  INT?: number;
  WIS?: number;
  CHA?: number;
}

export interface StoredSkillsMod {
  [skill: string]: NumerableWithExpertise;
}

export interface StoredFeatMod {
  template: TemplateReferenceExternal;
  desc: string;
  mod: StoredCharacterMod;
}

export interface RenderedFeat extends StoredFeatMod {
  source: TemplateReferenceExternal;
}

export interface StoredCounterMod {
  [name: string]: {
    used: number;
    max: Numerable;
    reset: "shortrest" | "longrest" | "dawn"; // TODO: complex reset behaviours, e.g. 1d4 regained
  };
}

export interface AbilityBonus {
  source: TemplateReference;
  bonus: Omit<Numerable, "prof">;
}

export interface AbilityValue {
  base: number;
  bonuses?: AbilityBonus[];
  dice?: string;
}

export interface StoredAbilities
  extends Record<keyof StoredASIMod, Omit<AbilityValue, "bonuses">> {
  method: "Standard Array" | "Point Buy" | "Rolled" | "Manual";
}
