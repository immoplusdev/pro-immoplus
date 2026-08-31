import { useCallback, useEffect, useState } from "react";
import type { CampaignRegistryEntry, CampaignStatut } from "@/types/campaigns.types";

/**
 * Registre local des campagnes créées depuis ce navigateur.
 *
 * L'API n'expose aucun "GET /admin/campaigns" (liste). On persiste donc en
 * localStorage les campagnes créées pour :
 *  - alimenter l'écran de liste ;
 *  - retrouver `mappingVariables` sur l'écran d'envoi (nécessaire pour croiser
 *    les tags fixes avec GET /admin/campaign-templates/tags).
 */

const STORAGE_KEY = "admin_campaigns_registry";
const EVENT = "admin_campaigns_registry_change";

function read(): CampaignRegistryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CampaignRegistryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: CampaignRegistryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(EVENT));
}

export function addCampaignToRegistry(entry: CampaignRegistryEntry) {
  const entries = read().filter((e) => e.campagneId !== entry.campagneId);
  write([entry, ...entries]);
}

export function updateCampaignInRegistry(
  campagneId: string,
  patch: Partial<CampaignRegistryEntry>
) {
  write(read().map((e) => (e.campagneId === campagneId ? { ...e, ...patch } : e)));
}

export function removeCampaignFromRegistry(campagneId: string) {
  write(read().filter((e) => e.campagneId !== campagneId));
}

export function getCampaignFromRegistry(campagneId: string): CampaignRegistryEntry | undefined {
  return read().find((e) => e.campagneId === campagneId);
}

/** Hook réactif : se met à jour quand le registre change (même onglet). */
export function useCampaignRegistry() {
  const [entries, setEntries] = useState<CampaignRegistryEntry[]>(() => read());

  useEffect(() => {
    const sync = () => setEntries(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setStatut = useCallback((campagneId: string, statut: CampaignStatut, audience?: number) => {
    updateCampaignInRegistry(campagneId, audience != null ? { statut, audience } : { statut });
  }, []);

  return {
    entries,
    add: addCampaignToRegistry,
    update: updateCampaignInRegistry,
    remove: removeCampaignFromRegistry,
    get: getCampaignFromRegistry,
    setStatut,
  };
}
