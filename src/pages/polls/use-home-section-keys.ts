import { useCustom, useApiUrl } from "@refinedev/core";
import { HOME_SECTION_KEYS_STATIC } from "./types";

interface HomeSection {
  key: string;
  title?: string;
  label?: string;
  name?: string;
}

interface HomeFeedResponse {
  sections?: HomeSection[];
}

function humanize(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// GET /me/home ne sert ici qu'à extraire les clés de section réellement actives
// (statiques + dynamiques villes/communes) — il n'existe pas de /polls/metadata
// dédié côté backend (voir docs/drafts/docss.md §2.4/§2.6).
export function useHomeSectionKeys() {
  const apiUrl = useApiUrl();

  const { data, isLoading, isError } = useCustom<HomeFeedResponse>({
    url: `${apiUrl}/me/home`,
    method: "get",
    queryOptions: { staleTime: 5 * 60 * 1000 },
  });

  const sections = data?.data?.sections;

  const options =
    sections && sections.length > 0
      ? sections.map((s) => ({
          label: s.title ?? s.label ?? s.name ?? humanize(s.key),
          value: s.key,
        }))
      : HOME_SECTION_KEYS_STATIC.map((key) => ({ label: humanize(key), value: key }));

  return { options, isLoading, isError };
}
