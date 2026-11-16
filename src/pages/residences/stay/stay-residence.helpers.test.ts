import { describe, expect, it } from "vitest";
import {
  STAY_PATCH_KEYS,
  buildResidencePatch,
  isStayResidence,
  mapStayApiErrors,
  toStayFormValues,
  toStayPatch,
} from "./stay-residence.helpers";

const stayResidence = {
  id: "r1",
  bookingMode: "INSTANT",
  propertyTypeCode: "APARTMENT",
  amenityCodes: ["WIFI", "AC"],
  capacity: { bedrooms: 2, livingRooms: 1, bathrooms: 1, maxGuests: 4 },
  roomCounts: { doubleBeds: 2 },
  advanceNoticeDays: 1,
  sameDayCutoff: null,
  bookingHorizonDays: 90,
  preparationNights: 0,
  weekendNightlyPrice: 30000,
  weeklyDiscountPercent: 10,
  prixReservation: 25000,
  heureEntree: "14:00",
  heureDepart: "12:00",
  dureeMinSejour: 1,
  dureeMaxSejour: 30,
  animauxAutorises: false,
  fetesAutorises: true,
  reduction: 5,
};

describe("isStayResidence", () => {
  it("reconnaît une résidence du nouveau flow à bookingMode", () => {
    expect(isStayResidence(stayResidence)).toBe(true);
    expect(isStayResidence({ bookingMode: null })).toBe(false);
    expect(isStayResidence(undefined)).toBe(false);
  });
});

describe("toStayFormValues", () => {
  it("convertit les noms de lecture en noms d'écriture", () => {
    expect(toStayFormValues(stayResidence)).toMatchObject({
      propertyType: "APARTMENT",
      baseNightlyPrice: 25000,
      checkInFrom: "14:00",
      checkOutBefore: "12:00",
      minNights: 1,
      maxNights: 30,
      petsAllowed: false,
      partiesAllowed: true,
      weekendPricingEnabled: true,
      weekendNightlyPrice: 30000,
    });
  });

  it("désactive le tarif week-end quand il est null", () => {
    expect(toStayFormValues({ ...stayResidence, weekendNightlyPrice: null }).weekendPricingEnabled).toBe(false);
  });
});

describe("toStayPatch", () => {
  it("n'envoie sameDayCutoff que pour un préavis le jour même", () => {
    expect(toStayPatch({ advanceNoticeDays: 1, sameDayCutoff: "18:00" })).not.toHaveProperty("sameDayCutoff");
    expect(toStayPatch({ advanceNoticeDays: 0, sameDayCutoff: "18:00" }).sameDayCutoff).toBe("18:00");
  });

  it("met le tarif week-end à null quand l'interrupteur est coupé", () => {
    expect(toStayPatch({ weekendPricingEnabled: false, weekendNightlyPrice: 30000 })).toMatchObject({
      weekendPricingEnabled: false,
      weekendNightlyPrice: null,
    });
  });

  it("retire les compteurs de pièces vides ou à 0", () => {
    expect(toStayPatch({ roomCounts: { doubleBeds: 2, singleBeds: 0, sofaBeds: null } }).roomCounts).toEqual({
      doubleBeds: 2,
    });
  });
});

describe("buildResidencePatch", () => {
  it("n'envoie aucun champ séjour pour une résidence historique", () => {
    const patch = buildResidencePatch(
      { description: "x", score: 3, stay: toStayFormValues(stayResidence), bookingMode: "INSTANT" },
      false,
    );
    expect(patch).toEqual({ description: "x", score: 3 });
    for (const key of STAY_PATCH_KEYS) expect(patch).not.toHaveProperty(key);
  });

  it("aplatit la clé stay pour une résidence séjour", () => {
    const patch = buildResidencePatch({ description: "x", stay: toStayFormValues(stayResidence) }, true);
    expect(patch).not.toHaveProperty("stay");
    expect(patch).toMatchObject({ description: "x", baseNightlyPrice: 25000, propertyType: "APARTMENT" });
    expect(patch).not.toHaveProperty("prixReservation");
  });
});

describe("mapStayApiErrors", () => {
  it("rattache les erreurs aux champs et garde les autres en erreurs générales", () => {
    const error = {
      response: {
        data: {
          code: "PROPERTY_VALIDATION_FAILED",
          errors: [
            { property: "capacity.maxGuests", constraints: { invalid: "Le nombre de voyageurs …" } },
            { property: "maxNights", constraints: { invalid: "Le maximum …" } },
            { property: "description", constraints: { invalid: "La description …" } },
            { property: "photoFileIds", constraints: { invalid: "Ajoutez entre 5 et 25 photos." } },
          ],
        },
      },
    };
    const { fields, general } = mapStayApiErrors(error);
    expect(fields).toEqual([
      { name: ["stay", "capacity", "maxGuests"], errors: ["Le nombre de voyageurs …"] },
      { name: ["stay", "maxNights"], errors: ["Le maximum …"] },
      { name: ["description"], errors: ["La description …"] },
    ]);
    expect(general).toEqual(["Ajoutez entre 5 et 25 photos."]);
  });

  it("ignore une erreur sans détail", () => {
    expect(mapStayApiErrors(new Error("boom"))).toEqual({ fields: [], general: [] });
  });
});
