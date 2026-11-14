/**
 * Cycle de vie d'une clé d'idempotence côté backoffice.
 *
 * Une clé = une intention utilisateur. Elle est générée au premier envoi, puis réutilisée pour
 * tout renvoi du même contenu (double-clic, retry après timeout / erreur réseau / 5xx).
 * Elle est renouvelée après un succès, quand le contenu change (l'API refuserait la clé en 409)
 * ou après un `409 IDEMPOTENCY_KEY_REUSED`.
 */

export type IdempotencyErrorKind =
  | "key-required" // 400 IDEMPOTENCY_KEY_REQUIRED : bug du client
  | "key-reused" // 409 IDEMPOTENCY_KEY_REUSED : clé déjà utilisée avec un autre contenu
  | "in-progress" // 409 OPERATION_IN_PROGRESS : la même opération est en cours de traitement
  | "funds-not-releasable" // 409 RESERVATION_FUNDS_NOT_RELEASABLE
  | "other";

const ERROR_KINDS: Record<string, IdempotencyErrorKind> = {
  IDEMPOTENCY_KEY_REQUIRED: "key-required",
  IDEMPOTENCY_KEY_REUSED: "key-reused",
  OPERATION_IN_PROGRESS: "in-progress",
  RESERVATION_FUNDS_NOT_RELEASABLE: "funds-not-releasable",
};

/** Code métier d'une erreur : HttpError refine (`code`) ou erreur axios brute (`response.data.code`). */
export const getApiErrorCode = (error: unknown): string | undefined => {
  const e = error as { code?: unknown; response?: { data?: { code?: unknown } } } | undefined;
  const fromBody = e?.response?.data?.code;
  if (typeof fromBody === "string") return fromBody;
  return typeof e?.code === "string" ? e.code : undefined;
};

export const getIdempotencyErrorKind = (error: unknown): IdempotencyErrorKind =>
  ERROR_KINDS[getApiErrorCode(error) ?? ""] ?? "other";

/** Sérialisation stable (clés triées, champs undefined ignorés) pour comparer deux contenus. */
export const fingerprint = (value: unknown): string =>
  JSON.stringify(value, (_key, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.keys(v)
          .sort()
          .reduce<Record<string, unknown>>((acc, k) => {
            acc[k] = (v as Record<string, unknown>)[k];
            return acc;
          }, {})
      : v,
  ) ?? "";

const defaultGenerateKey = () => crypto.randomUUID();

export interface IdempotencyKeyStore {
  /** Clé à utiliser pour ce contenu : la même tant que le contenu ne change pas. */
  keyFor(payload: unknown): string;
  /** Oublie la clé courante : le prochain envoi aura une nouvelle clé. */
  reset(): void;
}

export const createIdempotencyKeyStore = (
  generateKey: () => string = defaultGenerateKey,
): IdempotencyKeyStore => {
  let current: { key: string; fingerprint: string } | null = null;
  return {
    keyFor(payload) {
      const fp = fingerprint(payload);
      if (!current || current.fingerprint !== fp) {
        current = { key: generateKey(), fingerprint: fp };
      }
      return current.key;
    },
    reset() {
      current = null;
    },
  };
};

export type IdempotentSubmitResult<R> =
  | { status: "success"; data: R }
  | { status: "ignored" } // un envoi est déjà en cours (double-clic)
  | { status: "error"; kind: IdempotencyErrorKind; error: unknown };

export interface IdempotentSubmitter<P, R> {
  submit(payload: P): Promise<IdempotentSubmitResult<R>>;
  isSubmitting(): boolean;
  /** À appeler si l'intention est abandonnée (formulaire réinitialisé, modale fermée…). */
  reset(): void;
}

export interface IdempotentSubmitterOptions<P, R> {
  send: (payload: P, idempotencyKey: string) => Promise<R>;
  generateKey?: () => string;
  onKeyRequired?: (error: unknown) => void;
}

/**
 * Envoie une opération idempotente : un seul envoi à la fois, clé stable pour les renvois.
 * Indépendant de React pour pouvoir être testé ; voir `useIdempotentSubmit` pour les écrans.
 */
export const createIdempotentSubmitter = <P, R>({
  send,
  generateKey,
  onKeyRequired = (error) =>
    console.error("[idempotency] Idempotency-Key absente de la requête (bug client)", error),
}: IdempotentSubmitterOptions<P, R>): IdempotentSubmitter<P, R> => {
  const store = createIdempotencyKeyStore(generateKey);
  let inFlight = false;

  return {
    async submit(payload) {
      if (inFlight) return { status: "ignored" };
      inFlight = true;
      const key = store.keyFor(payload);
      try {
        const data = await send(payload, key);
        // Succès, y compris un rejeu 2xx d'une clé déjà exécutée : nouvelle intention ensuite.
        store.reset();
        return { status: "success", data };
      } catch (error) {
        const kind = getIdempotencyErrorKind(error);
        if (kind === "key-reused") store.reset();
        if (kind === "key-required") onKeyRequired(error);
        // Toute autre erreur (réseau, timeout, 5xx, 409 en cours…) garde la clé pour le renvoi.
        return { status: "error", kind, error };
      } finally {
        inFlight = false;
      }
    },
    isSubmitting: () => inFlight,
    reset: () => store.reset(),
  };
};
