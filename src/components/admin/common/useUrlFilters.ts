import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Filtres synchronisés avec l'URL (query string), toutes valeurs en `string`.
 * Un patch à `undefined`/"" retire la clé ; `page` est remise à 1 hors patch de page.
 */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const [params, setParams] = useSearchParams();

  const values = useMemo(() => {
    const out: Partial<Record<K, string>> = {};
    keys.forEach((k) => {
      const v = params.get(k);
      if (v) out[k] = v;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const update = useCallback(
    (patch: Partial<Record<K | "page", string | undefined>>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([k, v]) => {
            if (v === undefined || v === "") next.delete(k);
            else next.set(k, v as string);
          });
          if (!("page" in patch)) next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const reset = useCallback(() => setParams({}, { replace: true }), [setParams]);

  const page = Number(params.get("page")) || 1;

  return { values, update, reset, page };
}
