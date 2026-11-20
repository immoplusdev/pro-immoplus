import { describe, expect, it, vi } from "vitest";
import {
  addDays,
  buildCreationPayload,
  createAdminReservationSubmission,
  createReservationUrl,
  describeInitialStatus,
  findBlockedNights,
  getCreationErrorFeedback,
  isArrivalDisabled,
  isDepartureDisabled,
  isResidenceBookable,
  localIsoDay,
  nightsBetween,
  noteAdminError,
  previewTriggerKey,
  toNightPayload,
  toOccupiedSet,
  usesOverride,
  validateCreationForm,
  type AdminReservationFormValues,
} from "./admin-reservation-creation.helper";
import type { AdminReservationRequestBody, AdminReservationResult } from "@/types/admin-reservation-creation.types";

/** Erreur telle que produite par `toHttpError` (HttpError refine + réponse axios). */
const httpError = (status: number, body: Record<string, unknown>) => ({
  message: Array.isArray(body.message) ? body.message.join(", ") : body.message,
  statusCode: status,
  code: body.code,
  data: body.data,
  response: { status, data: { statusCode: status, ...body } },
});
/** Pas de réponse HTTP : `toHttpError(error, 500)` sans `response`. */
const networkError = () => ({ message: "Network Error", statusCode: 500, code: undefined, data: undefined });

const base: AdminReservationFormValues = {
  clientId: "client-1",
  residenceId: "res-1",
  nights: ["2026-12-25", "2026-12-24"],
};

describe("nuits", () => {
  it("nightsBetween : arrivée incluse, départ exclu, passage de mois et d'année", () => {
    expect(nightsBetween("2026-12-30", "2027-01-02")).toEqual(["2026-12-30", "2026-12-31", "2027-01-01"]);
    expect(nightsBetween("2026-12-24", "2026-12-24")).toEqual([]);
    expect(nightsBetween("2026-12-25", "2026-12-24")).toEqual([]);
    expect(nightsBetween("bad", "2026-12-24")).toEqual([]);
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("toNightPayload : une entrée par nuit à minuit UTC, triée et sans doublon", () => {
    expect(toNightPayload(["2026-12-25", "2026-12-24", "2026-12-25"])).toEqual([
      { date: "2026-12-24T00:00:00.000Z" },
      { date: "2026-12-25T00:00:00.000Z" },
    ]);
  });

  it("toOccupiedSet accepte les dates ISO complètes ou courtes", () => {
    expect([...toOccupiedSet([{ date: "2026-12-26T00:00:00.000Z" }, { date: "2026-12-27" }])]).toEqual([
      "2026-12-26",
      "2026-12-27",
    ]);
    expect(toOccupiedSet(undefined).size).toBe(0);
  });

  it("localIsoDay : jour local du navigateur", () => {
    expect(localIsoDay(new Date(2026, 10, 20, 23, 30))).toBe("2026-11-20");
  });

  const context = { occupied: new Set(["2026-12-26", "2026-12-27"]), today: "2026-11-20" };

  it("arrivée : jours passés et nuits prises désactivés", () => {
    expect(isArrivalDisabled("2026-11-19", context)).toBe(true);
    expect(isArrivalDisabled("2026-11-20", context)).toBe(false);
    expect(isArrivalDisabled("2026-12-26", context)).toBe(true);
  });

  it("départ : jamais au-delà d'une nuit prise, mais le jour du départ peut être occupé", () => {
    expect(isDepartureDisabled("2026-12-24", "2026-12-24", context)).toBe(true);
    expect(isDepartureDisabled("2026-12-26", "2026-12-24", context)).toBe(false);
    expect(isDepartureDisabled("2026-12-27", "2026-12-24", context)).toBe(true);
    expect(isDepartureDisabled("2026-12-30", "2026-12-24", context)).toBe(true);
    expect(isDepartureDisabled("2027-12-01", "2026-11-20", { ...context, occupied: new Set() })).toBe(true); // > 366 nuits
  });

  it("findBlockedNights repère les nuits devenues indisponibles", () => {
    expect(findBlockedNights(["2026-11-19", "2026-12-25", "2026-12-26"], context)).toEqual(["2026-11-19", "2026-12-26"]);
  });
});

describe("formulaire", () => {
  it("un formulaire complet sans contournement est valide sans note interne", () => {
    expect(validateCreationForm(base)).toEqual([]);
    expect(usesOverride(base)).toBe(false);
  });

  it("client, résidence et nuits sont obligatoires", () => {
    expect(validateCreationForm({}).map((e) => e.field)).toEqual(["clientId", "residenceId", "nights"]);
  });

  it.each([
    ["forcerRegles", { forcerRegles: true }],
    ["ignorerLimiteReservations", { ignorerLimiteReservations: true }],
    ["prixManuel", { prixManuel: 50_000 }],
  ])("note interne obligatoire dès qu'un contournement est utilisé (%s)", (_name, override) => {
    const values = { ...base, ...override };
    expect(usesOverride(values)).toBe(true);
    expect(noteAdminError(values)).toMatch(/obligatoire/);
    expect(noteAdminError({ ...values, noteAdmin: "   " })).toMatch(/obligatoire/);
    expect(validateCreationForm(values).map((e) => e.field)).toEqual(["noteAdmin"]);
    expect(validateCreationForm({ ...values, noteAdmin: "Client au téléphone" })).toEqual([]);
  });

  it("prix manuel 0 compte comme un contournement (et est refusé)", () => {
    const fields = validateCreationForm({ ...base, prixManuel: 0, noteAdmin: "n" }).map((e) => e.field);
    expect(fields).toEqual(["prixManuel"]);
  });

  it("bornes du prix manuel, du délai et des textes", () => {
    const fields = validateCreationForm({
      ...base,
      prixManuel: 100_000_001,
      delaiPaiementMinutes: 4,
      notes: "x".repeat(2001),
      noteAdmin: "y".repeat(1001),
    }).map((e) => e.field);
    expect(fields).toEqual(["notes", "prixManuel", "delaiPaiementMinutes", "noteAdmin"]);
    expect(validateCreationForm({ ...base, delaiPaiementMinutes: 12.5 }).map((e) => e.field)).toEqual([
      "delaiPaiementMinutes",
    ]);
    expect(validateCreationForm({ ...base, delaiPaiementMinutes: 2880, prixManuel: 1, noteAdmin: "n" })).toEqual([]);
  });

  it("plus de 366 nuits refusées", () => {
    const nights = nightsBetween("2027-01-01", "2028-01-03");
    expect(nights.length).toBe(367);
    expect(validateCreationForm({ ...base, nights }).map((e) => e.field)).toEqual(["nights"]);
  });

  it("corps de requête : exactement les champs du DTO, textes nettoyés", () => {
    expect(buildCreationPayload({ ...base, notes: "  ", noteAdmin: "" })).toEqual({
      clientId: "client-1",
      residenceId: "res-1",
      datesReservation: [{ date: "2026-12-24T00:00:00.000Z" }, { date: "2026-12-25T00:00:00.000Z" }],
      ignorerLimiteReservations: false,
      forcerRegles: false,
      prixManuel: null,
      delaiPaiementMinutes: null,
    });
    const full = buildCreationPayload({
      ...base,
      notes: " Arrivée tardive ",
      prixManuel: 75_000,
      forcerRegles: true,
      ignorerLimiteReservations: true,
      delaiPaiementMinutes: 30,
      noteAdmin: " Accord au téléphone ",
    });
    expect(Object.keys(full ?? {}).sort()).toEqual(
      [
        "clientId",
        "residenceId",
        "datesReservation",
        "notes",
        "ignorerLimiteReservations",
        "forcerRegles",
        "prixManuel",
        "delaiPaiementMinutes",
        "noteAdmin",
      ].sort(),
    );
    expect(full).toMatchObject({ notes: "Arrivée tardive", noteAdmin: "Accord au téléphone", prixManuel: 75_000 });
  });

  it("corps de requête : null tant que client, résidence ou nuits manquent", () => {
    expect(buildCreationPayload({ ...base, clientId: null })).toBeNull();
    expect(buildCreationPayload({ ...base, residenceId: undefined })).toBeNull();
    expect(buildCreationPayload({ ...base, nights: [] })).toBeNull();
  });

  it("l'aperçu se relance sur les paramètres, pas sur la saisie des textes", () => {
    const key = previewTriggerKey(base);
    expect(previewTriggerKey({ ...base, nights: ["2026-12-24", "2026-12-25"] })).toBe(key);
    expect(previewTriggerKey({ ...base, notes: "autre texte" })).toBe(key);
    expect(previewTriggerKey({ ...base, noteAdmin: "a" })).not.toBe(key);
    expect(previewTriggerKey({ ...base, noteAdmin: "a" })).toBe(previewTriggerKey({ ...base, noteAdmin: "ab" }));
    expect(previewTriggerKey({ ...base, prixManuel: 10 })).not.toBe(key);
    expect(previewTriggerKey({ ...base, forcerRegles: true })).not.toBe(key);
    expect(previewTriggerKey({ ...base, ignorerLimiteReservations: true })).not.toBe(key);
    expect(previewTriggerKey({ ...base, clientId: "client-2" })).not.toBe(key);
    expect(previewTriggerKey({ ...base, residenceId: "res-2" })).not.toBe(key);
  });

  it("lien de création avec client pré-sélectionné", () => {
    expect(createReservationUrl()).toBe("/reservations/create");
    expect(createReservationUrl("a b")).toBe("/reservations/create?clientId=a%20b");
  });

  it("résidence réservable : validée et disponible", () => {
    const r = { id: "r", nom: "R", miniature: null };
    expect(isResidenceBookable(r)).toBe(true);
    expect(isResidenceBookable({ ...r, statusValidation: "en_attente_validation" })).toBe(false);
    expect(isResidenceBookable({ ...r, statusValidation: "valide", residenceDisponible: false })).toBe(false);
  });
});

describe("statut de départ", () => {
  it("libellés en clair avec le délai", () => {
    const deadline = "2026-12-01T10:00:00.000Z";
    expect(
      describeInitialStatus({
        statutInitial: "en_attente_reponse_proprietaire",
        delaisProprietaireReponse: deadline,
        delaisPaiementClient: null,
      }).label,
    ).toBe("Le propriétaire doit valider (avant 01/12/2026 10:00)");
    expect(
      describeInitialStatus({
        statutInitial: "en_attente_paiement_client",
        delaisProprietaireReponse: null,
        delaisPaiementClient: deadline,
      }).label,
    ).toBe("Le client doit payer dans l'app avant 01/12/2026 10:00");
    expect(
      describeInitialStatus({
        statutInitial: "confirmee_paiement_arrivee",
        delaisProprietaireReponse: null,
        delaisPaiementClient: null,
      }).label,
    ).toBe("Confirmée, paiement à l'arrivée");
  });
});

describe("erreurs métier", () => {
  it.each([
    ["NOT_FOUND", "Ce client est introuvable."],
    ["DELETED", "Le compte de ce client a été supprimé."],
    ["BLOCKED", "Le compte de ce client est bloqué."],
    ["NOT_CUSTOMER", "Ce compte n'est pas un compte client."],
  ])("CLIENT_NOT_ELIGIBLE %s", (raison, message) => {
    const feedback = getCreationErrorFeedback(
      httpError(409, { code: "CLIENT_NOT_ELIGIBLE", message: "Ce client ne peut pas…", data: { raison } }),
    );
    expect(feedback).toMatchObject({ message, action: "pick-client" });
  });

  it("RESIDENCE_NOT_BOOKABLE : choisir une autre résidence", () => {
    const feedback = getCreationErrorFeedback(httpError(409, { code: "RESIDENCE_NOT_BOOKABLE", message: "Non réservable" }));
    expect(feedback).toMatchObject({ message: "Non réservable", action: "pick-residence" });
  });

  it("STAY_DATES_NOT_BOOKABLE : liste les règles et propose de forcer", () => {
    const feedback = getCreationErrorFeedback(
      httpError(400, {
        code: "STAY_DATES_NOT_BOOKABLE",
        message: "Durée minimum",
        data: { violations: [{ code: "MIN_NIGHTS", message: "Durée minimum" }, { code: "ADVANCE_NOTICE", message: "Préavis" }] },
      }),
    );
    expect(feedback.action).toBe("suggest-force");
    expect(feedback.details).toEqual(["Durée minimum", "Préavis"]);
  });

  it("STAY_DATES_NOT_BOOKABLE avec une date passée : pas de « Forcer », changer les dates", () => {
    const feedback = getCreationErrorFeedback(
      httpError(400, {
        code: "STAY_DATES_NOT_BOOKABLE",
        message: "Date passée",
        data: { violations: [{ code: "PAST_DATE", message: "Date passée" }] },
      }),
    );
    expect(feedback.action).toBe("change-dates");
  });

  it("ADMIN_RESERVATION_NOTE_REQUIRED : focus sur la note interne", () => {
    expect(getCreationErrorFeedback(httpError(400, { code: "ADMIN_RESERVATION_NOTE_REQUIRED", message: "Note" })).action).toBe(
      "focus-note-admin",
    );
  });

  it("clés d'idempotence : bugs du front, messages explicites", () => {
    expect(getCreationErrorFeedback(httpError(400, { code: "IDEMPOTENCY_KEY_REQUIRED", message: "x" }))).toMatchObject({
      action: "key-bug",
      message: expect.stringMatching(/absente/),
    });
    expect(getCreationErrorFeedback(httpError(409, { code: "IDEMPOTENCY_KEY_REUSED", message: "x" }))).toMatchObject({
      action: "key-reused",
      message: expect.stringMatching(/déjà servi/),
    });
  });

  it("ADMIN_RESERVATION_IN_PROGRESS, réseau et 5xx : réessayer avec la même clé", () => {
    expect(getCreationErrorFeedback(httpError(409, { code: "ADMIN_RESERVATION_IN_PROGRESS", message: "x" }))).toMatchObject({
      action: "retry-same-key",
      message: "Création en cours.",
    });
    expect(getCreationErrorFeedback(networkError())).toMatchObject({
      action: "retry-same-key",
      message: expect.stringMatching(/réseau/),
    });
    expect(getCreationErrorFeedback(httpError(502, { message: "Bad gateway" })).action).toBe("retry-same-key");
  });

  it("autre 400 sans code : limite de réservations actives, proposer « Ignorer la limite »", () => {
    const feedback = getCreationErrorFeedback(httpError(400, { message: "Vous avez atteint la limite de 3 réservations" }));
    expect(feedback).toMatchObject({ action: "suggest-ignore-limit", message: "Vous avez atteint la limite de 3 réservations" });
  });

  it("400 « date déjà prise » (data.date) : changer les dates, pas de contournement", () => {
    const feedback = getCreationErrorFeedback(
      httpError(400, { message: "Date déjà prise", data: { date: "2026-12-24T00:00:00.000Z" } }),
    );
    expect(feedback).toMatchObject({ action: "change-dates", details: ["2026-12-24"] });
  });

  it("400 de validation du DTO (message en tableau) : pas confondu avec la limite", () => {
    const feedback = getCreationErrorFeedback(httpError(400, { message: ["property foo should not exist"] }));
    expect(feedback.action).toBe("stay");
  });

  it("403 : masquer la fonctionnalité", () => {
    expect(getCreationErrorFeedback(httpError(403, { message: "Forbidden" })).action).toBe("hide");
  });
});

describe("idempotence", () => {
  const payload = buildCreationPayload(base) as AdminReservationRequestBody;
  const other = buildCreationPayload({ ...base, nights: ["2026-12-28"] }) as AdminReservationRequestBody;
  const result: AdminReservationResult = { creationId: "c1", replayed: false, reservation: { id: "resa-1" } };

  const setup = () => {
    let n = 0;
    const generateKey = vi.fn(() => `key-${++n}`);
    const send = vi.fn<(body: AdminReservationRequestBody, key: string) => Promise<AdminReservationResult>>();
    const onKeyRequired = vi.fn();
    const submission = createAdminReservationSubmission({ send, generateKey, onKeyRequired });
    return { submission, send, generateKey, onKeyRequired };
  };

  it("la clé est générée à l'ouverture du formulaire", () => {
    const { submission, generateKey } = setup();
    expect(generateKey).toHaveBeenCalledTimes(1);
    expect(submission.currentKey()).toBe("key-1");
  });

  it("double clic : un seul envoi, le second est ignoré", async () => {
    const { submission, send } = setup();
    let resolve: (value: AdminReservationResult) => void = () => undefined;
    send.mockReturnValue(new Promise((r) => (resolve = r)));
    const first = submission.submit(payload);
    const second = await submission.submit(payload);
    expect(second).toEqual({ status: "ignored" });
    expect(submission.isSubmitting()).toBe(true);
    resolve(result);
    await expect(first).resolves.toEqual({ status: "success", data: result });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(payload, "key-1");
    expect(submission.isSubmitting()).toBe(false);
  });

  it("deux clics successifs après succès : même clé (le serveur rejoue, pas de doublon)", async () => {
    const { submission, send } = setup();
    send.mockResolvedValueOnce(result).mockResolvedValueOnce({ ...result, replayed: true });
    await submission.submit(payload);
    const replay = await submission.submit(payload);
    expect(send.mock.calls.map((call) => call[1])).toEqual(["key-1", "key-1"]);
    expect(replay).toEqual({ status: "success", data: { ...result, replayed: true } });
  });

  it("erreur réseau puis renvoi : même clé", async () => {
    const { submission, send } = setup();
    send.mockRejectedValueOnce(networkError()).mockResolvedValueOnce({ ...result, replayed: true });
    const failed = await submission.submit(payload);
    expect(failed.status === "error" && failed.feedback.action).toBe("retry-same-key");
    await submission.submit(payload);
    expect(send.mock.calls.map((call) => call[1])).toEqual(["key-1", "key-1"]);
  });

  it("ADMIN_RESERVATION_IN_PROGRESS puis renvoi : même clé", async () => {
    const { submission, send } = setup();
    send
      .mockRejectedValueOnce(httpError(409, { code: "ADMIN_RESERVATION_IN_PROGRESS", message: "en cours" }))
      .mockResolvedValueOnce({ ...result, replayed: true });
    await submission.submit(payload);
    await submission.submit(payload);
    expect(send.mock.calls.map((call) => call[1])).toEqual(["key-1", "key-1"]);
  });

  it("contenu modifié après une erreur réseau : même clé (le serveur refusera si la 1re a abouti)", async () => {
    const { submission, send } = setup();
    send.mockRejectedValueOnce(networkError()).mockResolvedValueOnce(result);
    await submission.submit(payload);
    await submission.submit(other);
    expect(send.mock.calls.map((call) => call[1])).toEqual(["key-1", "key-1"]);
  });

  it("erreur de validation puis même contenu : même clé", async () => {
    const { submission, send } = setup();
    send
      .mockRejectedValueOnce(httpError(400, { message: "Vous avez atteint la limite de 3 réservations" }))
      .mockResolvedValueOnce(result);
    await submission.submit(payload);
    await submission.submit(payload);
    expect(send.mock.calls.map((call) => call[1])).toEqual(["key-1", "key-1"]);
  });

  it("erreur de validation puis contenu modifié : nouvelle clé", async () => {
    const { submission, send } = setup();
    const forced = { ...payload, forcerRegles: true, noteAdmin: "ok" };
    send
      .mockRejectedValueOnce(
        httpError(400, { code: "STAY_DATES_NOT_BOOKABLE", message: "x", data: { violations: [{ code: "MIN_NIGHTS", message: "x" }] } }),
      )
      .mockResolvedValueOnce(result)
      .mockResolvedValueOnce({ ...result, replayed: true });
    await submission.submit(payload);
    await submission.submit(forced);
    // Le contenu ne change plus : la clé reste celle de la création réussie.
    await submission.submit(forced);
    expect(send.mock.calls.map((call) => call[1])).toEqual(["key-1", "key-2", "key-2"]);
  });

  it("IDEMPOTENCY_KEY_REUSED : clé gardée tant que l'admin ne demande pas une nouvelle clé", async () => {
    const { submission, send } = setup();
    send.mockRejectedValue(httpError(409, { code: "IDEMPOTENCY_KEY_REUSED", message: "x" }));
    await submission.submit(payload);
    expect(submission.currentKey()).toBe("key-1");
    expect(submission.renewKey()).toBe("key-2");
    await submission.submit(payload);
    expect(send.mock.calls.map((call) => call[1])).toEqual(["key-1", "key-2"]);
  });

  it("IDEMPOTENCY_KEY_REQUIRED est signalé comme un bug", async () => {
    const { submission, send, onKeyRequired } = setup();
    const error = httpError(400, { code: "IDEMPOTENCY_KEY_REQUIRED", message: "x" });
    send.mockRejectedValue(error);
    await submission.submit(payload);
    expect(onKeyRequired).toHaveBeenCalledWith(error);
  });

  it("nouvelle création : nouvelle clé", () => {
    const { submission } = setup();
    submission.reset();
    expect(submission.currentKey()).toBe("key-2");
  });
});
