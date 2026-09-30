import { describe, expect, it } from "vitest";
import {
  buildReminderParams,
  conversionRate,
  describeStepTimings,
  failedChannels,
  formatApproxDuration,
  formatReminderDate,
  isSendingInProgress,
  normalizeReminderSettings,
  parseReminderEvent,
  reminderDotColor,
  reminderFailureNotice,
  sanitizeReminderFilters,
  sortChronologically,
  toBooleanSetting,
  toReminderFormValues,
  toReminderSettingsPayload,
} from "./reservation-reminders.helper";

describe("formatReminderDate", () => {
  it("affiche l'heure d'Abidjan (UTC)", () => {
    expect(formatReminderDate("2026-09-28T14:27:30.000Z")).toBe("28/09/2026 14:27");
  });

  it("renvoie la valeur brute si la date est illisible", () => {
    expect(formatReminderDate("pas une date")).toBe("pas une date");
  });
});

describe("sanitizeReminderFilters", () => {
  it("garde les valeurs connues", () => {
    expect(
      sanitizeReminderFilters({
        status: "valide",
        kind: "PAY_2",
        trigger: "AUTO",
        dateFrom: "2026-09-01",
        dateTo: "2026-09-30",
      })
    ).toEqual({ status: "valide", kind: "PAY_2", trigger: "AUTO", dateFrom: "2026-09-01", dateTo: "2026-09-30" });
  });

  it("ignore les valeurs inconnues et les dates invalides", () => {
    expect(
      sanitizeReminderFilters({ status: "paye", kind: "PAY_3", trigger: "auto", dateFrom: "01/09/2026", dateTo: "2026-02-30" })
    ).toEqual({ status: undefined, kind: undefined, trigger: undefined, dateFrom: undefined, dateTo: undefined });
  });

  it("remet une période inversée dans l'ordre", () => {
    const f = sanitizeReminderFilters({ dateFrom: "2026-09-30", dateTo: "2026-09-01" });
    expect([f.dateFrom, f.dateTo]).toEqual(["2026-09-01", "2026-09-30"]);
  });
});

describe("buildReminderParams", () => {
  it("n'envoie aucun param vide", () => {
    expect(buildReminderParams({ status: undefined, dateFrom: "" })).toEqual({});
  });

  it("transmet les filtres renseignés", () => {
    expect(
      buildReminderParams({
        status: "terminee" as never,
        kind: "OWN_1",
        trigger: "MANUAL",
        dateFrom: "2026-09-01",
        dateTo: "2026-09-30",
        page: 2,
        perPage: 100,
      })
    ).toEqual({
      status: "terminee",
      kind: "OWN_1",
      trigger: "MANUAL",
      dateFrom: "2026-09-01",
      dateTo: "2026-09-30",
      page: 2,
      perPage: 100,
    });
  });
});

describe("conversionRate", () => {
  it("arrondit au dixième", () => {
    expect(conversionRate(134, 45)).toBe(33.6);
  });

  it("renvoie null sans relance", () => {
    expect(conversionRate(0, 0)).toBeNull();
  });
});

describe("canaux et timeline", () => {
  it("liste les canaux en échec dans l'ordre d'affichage", () => {
    expect(failedChannels({ email: "failed", push: "sent", whatsapp: "failed", message: "skipped" })).toEqual([
      "whatsapp",
      "email",
    ]);
  });

  it("détecte un envoi en cours (rapport vide)", () => {
    expect(isSendingInProgress({})).toBe(true);
    expect(isSendingInProgress({ push: "sent" })).toBe(false);
  });

  it("colore le point : rouge si échec, sinon selon le déclenchement", () => {
    expect(reminderDotColor({ trigger: "AUTO", channels: { push: "failed" } })).toBe("red");
    expect(reminderDotColor({ trigger: "AUTO", channels: { push: "sent" } })).toBe("blue");
    expect(reminderDotColor({ trigger: "MANUAL", channels: {} })).toBe("purple");
  });

  it("trie du plus ancien au plus récent sans muter l'entrée", () => {
    const items = [{ sentAt: "2026-09-28T15:00:00Z" }, { sentAt: "2026-09-28T14:00:00Z" }];
    expect(sortChronologically(items).map((i) => i.sentAt)).toEqual(["2026-09-28T14:00:00Z", "2026-09-28T15:00:00Z"]);
    expect(items[0].sentAt).toBe("2026-09-28T15:00:00Z");
  });
});

describe("temps réel", () => {
  const raw = {
    reminderId: "r1",
    reservationId: "res1",
    kind: "PAY_1",
    trigger: "AUTO",
    target: "CLIENT",
    channels: { push: "sent", whatsapp: "failed" },
    at: "2026-09-28T14:27:30.000Z",
  };

  it("rejette un payload sans reservationId", () => {
    expect(parseReminderEvent(null)).toBeNull();
    expect(parseReminderEvent({ ...raw, reservationId: "" })).toBeNull();
  });

  it("construit la notification d'échec", () => {
    const event = parseReminderEvent(raw);
    expect(event && reminderFailureNotice(event)).toEqual({
      title: "Relance PAY_1 : échec WhatsApp",
      description: "Destinataire : Client",
    });
  });

  it("ne notifie pas un envoi réussi", () => {
    const event = parseReminderEvent({ ...raw, channels: { push: "sent", whatsapp: "skipped" } });
    expect(event && reminderFailureNotice(event)).toBeNull();
  });
});

describe("paramètres", () => {
  it("convertit 0/1 en booléen", () => {
    expect(toBooleanSetting(0, true)).toBe(false);
    expect(toBooleanSetting("1", false)).toBe(true);
    expect(toBooleanSetting(null, true)).toBe(true);
  });

  it("applique les défauts sur les colonnes null", () => {
    expect(
      normalizeReminderSettings({
        relancesEnabled: null,
        relanceStepsPercent: null,
        relanceManualMax: null,
        relanceManualMinIntervalMinutes: null,
        relanceFailClientDelayMinutes: null,
      })
    ).toEqual({
      relancesEnabled: true,
      relanceStepsPercent: [40, 75],
      relanceManualMax: 2,
      relanceManualMinIntervalMinutes: 2,
      relanceFailClientDelayMinutes: 15,
    });
  });

  it("lit les seuils comme l'API (triés, 2 au plus, hors bornes ignorés)", () => {
    expect(normalizeReminderSettings({ relanceStepsPercent: [80, 0, 30, 50] }).relanceStepsPercent).toEqual([30, 50]);
    expect(normalizeReminderSettings({ relancesEnabled: 0, relanceManualMax: 0 })).toMatchObject({
      relancesEnabled: false,
      relanceManualMax: 0,
    });
  });

  it("n'envoie que les champs de relance, 2e seuil facultatif", () => {
    const values = toReminderFormValues(normalizeReminderSettings({ relanceStepsPercent: [50] }));
    expect(values.step2).toBeNull();
    expect(Object.keys(toReminderSettingsPayload(values)).sort()).toEqual([
      "relanceFailClientDelayMinutes",
      "relanceManualMax",
      "relanceManualMinIntervalMinutes",
      "relanceStepsPercent",
      "relancesEnabled",
    ]);
    expect(toReminderSettingsPayload(values).relanceStepsPercent).toEqual([50]);
  });
});

describe("moment d'envoi des relances", () => {
  it("formate les durées approximatives", () => {
    expect(formatApproxDuration(4)).toBe("~4 min");
    expect(formatApproxDuration(7.5)).toBe("~7 min 30");
    expect(formatApproxDuration(576)).toBe("~9 h 36");
    expect(formatApproxDuration(0.5)).toBe("~30 s");
  });

  it("décrit les seuils pour un délai", () => {
    expect(describeStepTimings("Paiement", 10, [40, 75])).toBe("Paiement (10 min) : relances à ~4 min et ~7 min 30");
    expect(describeStepTimings("Réponse pro", "20", [50, null])).toBe("Réponse pro (20 min) : relance à ~10 min");
  });

  it("ne décrit rien sans délai ni seuil", () => {
    expect(describeStepTimings("Paiement", undefined, [40])).toBeNull();
    expect(describeStepTimings("Paiement", 10, [null, null])).toBeNull();
  });
});
