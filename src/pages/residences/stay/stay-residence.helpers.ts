/**
 * Résidences « séjour » (nouveau flow de création, `bookingMode != null`).
 *
 * En lecture (GET /residences/:id) l'API renvoie les colonnes de la résidence
 * (`prixReservation`, `heureEntree`, `dureeMinSejour`…) ; en écriture (PATCH) elle attend
 * les noms du flow (`baseNightlyPrice`, `checkInFrom`, `minNights`…). Le formulaire travaille
 * sous la clé `stay`, avec les noms d'écriture, pour que les erreurs de l'API
 * (`errors[].property`, ex. `capacity.maxGuests`) tombent directement sur le bon champ.
 *
 * Une résidence historique ne doit recevoir aucun de ces champs : l'API la traiterait
 * comme une résidence séjour et exigerait l'annonce complète.
 */

/** Limites de l'API (`stay-listing.rules.ts`). */
export const STAY_LIMITS = {
  capacity: {
    bedrooms: { min: 0, max: 50 },
    livingRooms: { min: 0, max: 20 },
    bathrooms: { min: 0, max: 30 },
    maxGuests: { min: 1, max: 100 },
  },
  roomCount: { min: 0, max: 50 },
  amenitiesMaxItems: 200,
  nightlyPrice: { min: 1000, max: 100_000_000 },
  nights: { min: 1, max: 365 },
  advanceNoticeDays: [0, 1, 2, 3, 7],
  sameDayCutoffs: ["12:00", "18:00", "22:00", "23:59"],
  preparationNights: [0, 1, 2],
  bookingHorizonDays: [30, 90, 180, 365],
  weeklyDiscountPercents: [0, 5, 10, 15],
} as const;

export type BookingMode = "INSTANT" | "REQUEST";

export const BOOKING_MODE_LABELS: Record<BookingMode, string> = {
  INSTANT: "Réservation instantanée",
  REQUEST: "Sur demande",
};

/** Mode proposé par le flow : REQUEST est désactivé côté application (`enabled=false`). */
export const ENABLED_BOOKING_MODES: readonly BookingMode[] = ["INSTANT"];

export type StayCapacity = {
  bedrooms: number;
  livingRooms: number;
  bathrooms: number;
  maxGuests: number;
};

/** Valeurs du formulaire, sous `stay`, avec les noms attendus par le PATCH. */
export type StayFormValues = {
  propertyType?: string | null;
  capacity?: Partial<StayCapacity>;
  roomCounts?: Record<string, number | null | undefined>;
  amenityCodes?: string[];
  bookingMode?: BookingMode | null;
  advanceNoticeDays?: number | null;
  sameDayCutoff?: string | null;
  bookingHorizonDays?: number | null;
  preparationNights?: number | null;
  baseNightlyPrice?: number | null;
  weekendPricingEnabled?: boolean;
  weekendNightlyPrice?: number | null;
  weeklyDiscountPercent?: number | null;
  minNights?: number | null;
  maxNights?: number | null;
  checkInFrom?: string | null;
  checkOutBefore?: string | null;
  petsAllowed?: boolean;
  partiesAllowed?: boolean;
};

/** Clés du PATCH qui font basculer l'API en validation séjour. */
export const STAY_PATCH_KEYS = [
  "propertyType",
  "amenityCodes",
  "capacity",
  "roomCounts",
  "baseNightlyPrice",
  "checkInFrom",
  "checkOutBefore",
  "petsAllowed",
  "partiesAllowed",
  "bookingMode",
  "advanceNoticeDays",
  "sameDayCutoff",
  "minNights",
  "maxNights",
  "bookingHorizonDays",
  "preparationNights",
  "weekendPricingEnabled",
  "weekendNightlyPrice",
  "weeklyDiscountPercent",
] as const;

type ResidenceLike = Record<string, any> | null | undefined;

export function isStayResidence(residence: ResidenceLike): boolean {
  return residence?.bookingMode != null;
}

/** GET (colonnes de la résidence) → valeurs du formulaire (noms d'écriture). */
export function toStayFormValues(residence: ResidenceLike): StayFormValues {
  const r = residence ?? {};
  const capacity = r.capacity ?? {};
  return {
    propertyType: r.propertyTypeCode ?? null,
    capacity: {
      bedrooms: capacity.bedrooms ?? 0,
      livingRooms: capacity.livingRooms ?? 0,
      bathrooms: capacity.bathrooms ?? 0,
      maxGuests: capacity.maxGuests,
    },
    roomCounts: { ...(r.roomCounts ?? {}) },
    amenityCodes: [...(r.amenityCodes ?? [])],
    bookingMode: r.bookingMode ?? null,
    advanceNoticeDays: r.advanceNoticeDays ?? null,
    sameDayCutoff: r.sameDayCutoff ?? null,
    bookingHorizonDays: r.bookingHorizonDays ?? null,
    preparationNights: r.preparationNights ?? null,
    baseNightlyPrice: r.prixReservation ?? null,
    weekendPricingEnabled: r.weekendNightlyPrice != null,
    weekendNightlyPrice: r.weekendNightlyPrice ?? null,
    weeklyDiscountPercent: r.weeklyDiscountPercent ?? null,
    minNights: r.dureeMinSejour ?? null,
    maxNights: r.dureeMaxSejour ?? null,
    checkInFrom: r.heureEntree ?? null,
    checkOutBefore: r.heureDepart ?? null,
    petsAllowed: Boolean(r.animauxAutorises),
    partiesAllowed: Boolean(r.fetesAutorises),
  };
}

const toInt = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? Math.round(value) : undefined;

/** Valeurs du formulaire → champs séjour du PATCH (noms d'écriture). */
export function toStayPatch(values: StayFormValues): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  const set = (key: string, value: unknown) => {
    if (value !== undefined) patch[key] = value;
  };

  if (values.propertyType) set("propertyType", values.propertyType);
  if (values.capacity) {
    set("capacity", {
      bedrooms: toInt(values.capacity.bedrooms) ?? 0,
      livingRooms: toInt(values.capacity.livingRooms) ?? 0,
      bathrooms: toInt(values.capacity.bathrooms) ?? 0,
      maxGuests: toInt(values.capacity.maxGuests),
    });
  }
  if (values.roomCounts) {
    // L'API ignore les compteurs à 0 : on n'envoie que les pièces présentes.
    const roomCounts: Record<string, number> = {};
    for (const [key, raw] of Object.entries(values.roomCounts)) {
      const count = toInt(raw);
      if (count) roomCounts[key] = count;
    }
    set("roomCounts", roomCounts);
  }
  if (values.amenityCodes) set("amenityCodes", [...new Set(values.amenityCodes)]);
  if (values.bookingMode) set("bookingMode", values.bookingMode);

  const advanceNoticeDays = toInt(values.advanceNoticeDays);
  set("advanceNoticeDays", advanceNoticeDays);
  // L'heure limite n'a de sens que pour un préavis « le jour même » ; sinon l'API la remet à null.
  if (advanceNoticeDays === 0) set("sameDayCutoff", values.sameDayCutoff ?? null);

  set("bookingHorizonDays", toInt(values.bookingHorizonDays));
  set("preparationNights", toInt(values.preparationNights));
  set("baseNightlyPrice", toInt(values.baseNightlyPrice));

  if (values.weekendPricingEnabled !== undefined) {
    set("weekendPricingEnabled", values.weekendPricingEnabled);
    set(
      "weekendNightlyPrice",
      values.weekendPricingEnabled ? toInt(values.weekendNightlyPrice) ?? null : null,
    );
  }

  set("weeklyDiscountPercent", toInt(values.weeklyDiscountPercent));
  set("minNights", toInt(values.minNights));
  set("maxNights", toInt(values.maxNights));
  if (values.checkInFrom) set("checkInFrom", values.checkInFrom);
  if (values.checkOutBefore) set("checkOutBefore", values.checkOutBefore);
  if (values.petsAllowed !== undefined) set("petsAllowed", values.petsAllowed);
  if (values.partiesAllowed !== undefined) set("partiesAllowed", values.partiesAllowed);
  return patch;
}

/**
 * Valeurs du formulaire d'édition → payload du PATCH.
 * Historique : la clé `stay` et tout champ séjour sont retirés.
 * Séjour : les champs de `stay` sont envoyés avec les noms d'écriture.
 */
export function buildResidencePatch(
  values: Record<string, any>,
  isStay: boolean,
): Record<string, unknown> {
  const { stay, ...rest } = values ?? {};
  if (!isStay) {
    const legacy: Record<string, unknown> = { ...rest };
    for (const key of STAY_PATCH_KEYS) delete legacy[key];
    return legacy;
  }
  return { ...rest, ...toStayPatch(stay ?? {}) };
}

export type FieldErrorTarget = { name: (string | number)[]; errors: string[] };

export type MappedApiErrors = {
  /** Erreurs rattachées à un champ du formulaire. */
  fields: FieldErrorTarget[];
  /** Erreurs sans champ éditable sur cette page (photos, adresse, position…). */
  general: string[];
};

const STAY_FIELD_ROOTS = new Set<string>(STAY_PATCH_KEYS);

/** Champs historiques du formulaire que l'API peut citer sous leur nom de flow. */
const LEGACY_FIELD_PATHS: Record<string, (string | number)[]> = {
  description: ["description"],
};

/**
 * Erreur de validation de l'API (`PROPERTY_VALIDATION_FAILED`) :
 * `{ errors: [{ property: "capacity.maxGuests", constraints: { invalid: "…" } }] }`.
 */
export function mapStayApiErrors(error: unknown): MappedApiErrors {
  const err = error as any;
  const body = err?.response?.data ?? err?.data ?? err;
  const rawErrors: any[] = Array.isArray(body?.errors) ? body.errors : [];
  const fields = new Map<string, FieldErrorTarget>();
  const general: string[] = [];

  for (const item of rawErrors) {
    const property = typeof item?.property === "string" ? item.property : "";
    const messages = Object.values(item?.constraints ?? {}).filter(
      (m): m is string => typeof m === "string" && m.length > 0,
    );
    if (!messages.length) continue;

    const root = property.split(/[.[]/)[0];
    let name: (string | number)[] | undefined;
    if (STAY_FIELD_ROOTS.has(root)) name = ["stay", ...property.split(".")];
    else if (LEGACY_FIELD_PATHS[property]) name = LEGACY_FIELD_PATHS[property];

    if (!name) {
      general.push(...messages);
      continue;
    }
    const key = name.join(".");
    const existing = fields.get(key);
    if (existing) existing.errors.push(...messages);
    else fields.set(key, { name, errors: [...messages] });
  }

  return { fields: [...fields.values()], general };
}

export function formatAdvanceNotice(days: number): string {
  return days === 0 ? "Le jour même" : `${days} jour${days > 1 ? "s" : ""} avant`;
}

export function rangeOptions(min: number, max: number) {
  return Array.from({ length: max - min + 1 }, (_, i) => ({ value: min + i, label: String(min + i) }));
}
