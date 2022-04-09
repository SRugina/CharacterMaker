import { abilityScoreToModifier } from "~/utils/helpers";
import { RecursivePartial, StoredAbilities } from "~/utils/types";

export interface AbilitiesViewProps {
  abilities: RecursivePartial<Omit<StoredAbilities, "method">>;
}

// TODO: account for bonuses from Race, Class, etc.

export const AbilitiesView = ({ abilities }: AbilitiesViewProps) => {
  return (
    <div className="flex flex-col">
      <h3 className="!mt-0">Abilities</h3>
      {Object.entries(abilities).map(([ability, data]) => (
        <span key={ability} className="outline outline-offset-1 outline-1">
          <span className="font-bold float-left ml-1">{ability}</span>
          <span
            className="underline decoration-dotted cursor-help float-right mr-1"
            title={"Sources:\nComing Soon"}
          >
            {data.base
              ? `${data.base} (${abilityScoreToModifier(data.base, true)})`
              : "?"}
          </span>
        </span>
      ))}
    </div>
  );
};
