import { useMemo } from "react";
import { Alert, Input, Space, Tag, Typography } from "antd";
import { CampaignTagType, unwrapTag } from "@/types/campaigns.types";
import type { CampaignTag } from "@/types/campaigns.types";

const { Text } = Typography;

/**
 * Croise le mapping d'une campagne avec le catalogue de tags pour lister les
 * tags `type=fixe` référencés, puis affiche un champ de saisie par tag fixe.
 *
 * Clé de `variablesFixes` : nom du tag SANS accolades (ex. "nomOffre").
 */
export function getFixedTagsFromMapping(
  mappingVariables: Record<string, string>,
  tags: CampaignTag[]
): string[] {
  const fixeTagSet = new Set(
    tags.filter((t) => t.type === CampaignTagType.Fixe).map((t) => t.tag)
  );
  const referenced = new Set(Object.values(mappingVariables));
  return [...referenced].filter((tag) => fixeTagSet.has(tag));
}

interface Props {
  /** tags fixes référencés (avec accolades), ex ["{{nomOffre}}"] */
  fixedTags: string[];
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  /** true = valeurs obligatoires (envoi), false = optionnelles (aperçu) */
  required?: boolean;
}

export function FixedVariablesInputs({ fixedTags, value, onChange, required }: Props) {
  const missing = useMemo(
    () => fixedTags.filter((tag) => !value[unwrapTag(tag)]?.trim()),
    [fixedTags, value]
  );

  if (fixedTags.length === 0) {
    return (
      <Text type="secondary">
        Aucune variable fixe dans cette campagne — rien à renseigner.
      </Text>
    );
  }

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={12}>
      {required && missing.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`Valeur manquante pour ${missing.length} variable(s) fixe(s). L'envoi est bloqué tant qu'elles ne sont pas toutes renseignées.`}
        />
      )}
      {fixedTags.map((tag) => {
        const key = unwrapTag(tag);
        return (
          <div key={tag} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Text style={{ minWidth: 160 }}>
              <Tag color="orange" style={{ marginInlineEnd: 0 }}>
                {tag}
              </Tag>
            </Text>
            <Input
              style={{ flex: 1 }}
              placeholder={`Valeur pour ${tag}`}
              value={value[key] ?? ""}
              status={required && !value[key]?.trim() ? "warning" : undefined}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            />
          </div>
        );
      })}
    </Space>
  );
}
