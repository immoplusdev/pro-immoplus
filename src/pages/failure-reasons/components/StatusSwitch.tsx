import React, { useEffect, useState } from "react";
import { Switch, Tooltip } from "antd";
import { SYSTEM_LOCK_MESSAGE, canToggleStatus } from "../rules";
import type { FailureReason } from "../types";

interface StatusSwitchProps {
  reason: Pick<FailureReason, "id" | "code" | "isActive" | "isSystem">;
  /** Enregistre le statut ; `false` si l'appel a échoué. */
  onChange: (reason: Pick<FailureReason, "id">, isActive: boolean) => Promise<boolean>;
}

/** Statut dans la ligne : mise à jour optimiste, ancienne valeur remise en cas d'erreur. */
export const StatusSwitch: React.FC<StatusSwitchProps> = ({ reason, onChange }) => {
  const [checked, setChecked] = useState(reason.isActive);
  const [pending, setPending] = useState(false);

  // Resynchronise sur la valeur serveur (après rechargement de la liste).
  useEffect(() => setChecked(reason.isActive), [reason.isActive]);

  const locked = !canToggleStatus(reason);

  const handleChange = async (next: boolean) => {
    const previous = checked;
    setChecked(next);
    setPending(true);
    const saved = await onChange(reason, next);
    if (!saved) setChecked(previous);
    setPending(false);
  };

  const control = (
    <Switch
      size="small"
      checked={checked}
      loading={pending}
      disabled={locked || pending}
      onChange={handleChange}
      aria-label={`Statut du motif ${reason.code}`}
    />
  );

  if (!locked) return control;

  return (
    <Tooltip title={SYSTEM_LOCK_MESSAGE}>
      <span>{control}</span>
    </Tooltip>
  );
};
