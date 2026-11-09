# Endpoints Admin — Configuration du Home Feed (`GET /me/home`)

Ce document couvre les endpoints admin permettant de piloter l'écran d'accueil agrégé
(`GET /me/home`, voir `HOME-FEED-AGGREGATOR.md`) sans déploiement : **ordre des sections**,
**nombre d'items par section**, **sections masquées**, et une poignée de **réglages globaux**
(nombre de sections par page, rayon `near_you`, nombre de cartes ville, plafond de pubs par section).

Aucun de ces réglages n'est requis pour que `/me/home` fonctionne — une section jamais configurée
garde son comportement actuel (10 items, position historique, visible), et les réglages globaux
ont tous une valeur par défaut seedée (identique aux anciennes constantes codées en dur).

---

## 1. Vue d'ensemble

| Endpoint | Méthode | Auth | Usage |
|----------|---------|------|-------|
| `/admin/home-feed-sections` | GET | JWT + rôle Admin | Lire la configuration effective |
| `/admin/home-feed-sections` | PUT | JWT + rôle Admin | Remplacer toute la configuration |

Deux niveaux de réglage dans la même ressource :

- **Global** (5 champs à plat, pas dans un sous-objet) :
  | Champ | Défaut | Rôle |
  |-------|--------|------|
  | `defaultSectionsPageSize` | 10 | Nombre de *sections* par page (racine de la réponse, scroll vertical) — utilisé seulement si le client n'envoie pas `?limit=` sur `GET /me/home`. |
  | `defaultItemsPerSection` | 10 | Nombre d'items par section quand une section n'a pas d'`itemsLimit` propre (`null`). |
  | `locationRowsLimit` | 5 | Nombre de "cartes ville" dans les sections groupées par localisation (`residences_by_ville`/`_commune`, `biens_a_louer/acheter_par_ville`/`_commune`). |
  | `nearYouRadiusKm` | 15 | Rayon de recherche (km) de la section `near_you`. |
  | `maxAdsPerSection` | 2 | Nombre maximum de pubs par section/emplacement (inline ou bannière avant/après) — voir `PUBS-HOME-FEED-PARAMS-ET-POLLS-ADMIN.md`. |
- **Par section** : une entrée par valeur de `HomeSectionKey` — `position` (ordre d'affichage),
  `itemsLimit` (nombre d'items dans le carrousel de cette section, override de `defaultItemsPerSection`),
  `enabled` (visible ou non).

Les 12 clés de section actuelles (`HomeSectionKey`) : `near_you`, `available_now`, `top_rated`,
`new_this_week`, `residences_by_ville`, `residences_by_commune`, `biens_a_louer_par_ville`,
`biens_a_louer_par_commune`, `biens_a_acheter_par_ville`, `biens_a_acheter_par_commune`,
`terrain_a_louer`, `terrain_a_acheter`.

---

## 2. `GET /admin/home-feed-sections`

Retourne la configuration **effective** : toutes les sections existent toujours dans la réponse,
qu'elles aient été configurées ou non (celles jamais configurées apparaissent avec leurs valeurs
par défaut, en fin de liste, dans l'ordre de déclaration de l'enum).

```bash
GET /admin/home-feed-sections
Authorization: Bearer <admin_token>
```

```json
{
  "data": {
    "defaultSectionsPageSize": 10,
    "defaultItemsPerSection": 10,
    "locationRowsLimit": 5,
    "nearYouRadiusKm": 15,
    "maxAdsPerSection": 2,
    "sections": [
      {
        "sectionKey": "near_you",
        "label": "Près de chez vous",
        "position": 0,
        "itemsLimit": null,
        "enabled": true
      },
      {
        "sectionKey": "available_now",
        "label": "Disponible maintenant",
        "position": 1,
        "itemsLimit": 15,
        "enabled": true
      },
      {
        "sectionKey": "top_rated",
        "label": "Les plus aimées",
        "position": 2,
        "itemsLimit": null,
        "enabled": false
      }
      // ... les 9 autres sections
    ]
  }
}
```

- `label` : libellé humain pour affichage dans le dashboard uniquement — n'affecte jamais le
  `title` réellement envoyé dans `/me/home`.
- `itemsLimit: null` : la section utilise sa limite par défaut codée en dur (10 pour la plupart).
- `enabled: false` : la section n'apparaît plus jamais dans `/me/home`, même demandée
  explicitement via `?sections=`.

---

## 3. `PUT /admin/home-feed-sections`

Remplace **toute** la configuration en un seul appel — pas de PATCH partiel par section. Pensé
pour un écran d'admin avec drag-and-drop (réordonner) + un input par section (nombre d'items) +
un toggle (activer/désactiver).

### Règles de validation

- `sections` doit contenir **chaque** valeur de `HomeSectionKey` **exactement une fois** — liste
  incomplète ou avec doublon → `409 Conflict`.
- La `position` de chaque section n'est **pas** un champ à envoyer : elle est déduite de l'**index**
  de l'élément dans le tableau `sections`. Pour réordonner, renvoyer le tableau dans le nouvel ordre.
- `itemsLimit` : entier ≥ 1, ou absent/`null` pour revenir à `defaultItemsPerSection`.
- `enabled` : absent = `true`.
- Les 5 champs globaux (`defaultSectionsPageSize`, `defaultItemsPerSection`, `locationRowsLimit`,
  `nearYouRadiusKm`, `maxAdsPerSection`) sont tous optionnels et **fusionnés** (pas remplacés) :
  un champ absent garde sa valeur actuelle — contrairement à `sections` qui doit toujours être
  complet. Envoyer uniquement ceux à changer.

### Exemple — réordonner + limiter + masquer une section + ajuster un réglage global

```bash
PUT /admin/home-feed-sections
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "defaultSectionsPageSize": 12,
  "maxAdsPerSection": 3,
  "sections": [
    { "sectionKey": "available_now", "itemsLimit": 15 },
    { "sectionKey": "near_you" },
    { "sectionKey": "top_rated", "enabled": false },
    { "sectionKey": "new_this_week", "itemsLimit": 5 },
    { "sectionKey": "residences_by_ville" },
    { "sectionKey": "residences_by_commune" },
    { "sectionKey": "biens_a_louer_par_ville" },
    { "sectionKey": "biens_a_louer_par_commune" },
    { "sectionKey": "biens_a_acheter_par_ville" },
    { "sectionKey": "biens_a_acheter_par_commune" },
    { "sectionKey": "terrain_a_louer" },
    { "sectionKey": "terrain_a_acheter" }
  ]
}
```

Ici : `available_now` passe en position 0 avec 15 items, `near_you` en position 1 (limite par
défaut), `top_rated` masquée entièrement, `new_this_week` limitée à 5 items, le plafond de pubs
par section passe de 2 à 3 — les 8 autres sections gardent leurs réglages par défaut mais
adoptent l'ordre du tableau (positions 4 à 11). `defaultItemsPerSection`, `locationRowsLimit`,
`nearYouRadiusKm` restent inchangés (absents du body).

**Réponse** : `200` avec la configuration complète mise à jour (même forme que le `GET`).

**Effet** : immédiat. Les caches Redis de la config (`home:section-config`, `home:feed-settings`,
TTL 5 min) sont invalidés à l'écriture — pas besoin d'attendre le TTL, le prochain `GET /me/home`
reflète déjà le changement. Les caches de **contenu** par section (résidences, biens, `near_you`...)
sont eux clés par les valeurs effectives (`itemsLimit`, et pour `near_you` aussi `nearYouRadiusKm`,
pour les sections groupées aussi `locationRowsLimit`) : changer un réglage ne sert jamais un
contenu périmé, ça déclenche juste une nouvelle requête avec les nouvelles valeurs.

---

## 4. Ce qui n'est **pas** couvert par ces endpoints (hors scope actuel)

- L'ordre des *items* à l'intérieur d'une section (résidences, biens) — seul l'ordre des
  *sections* est configurable ici.
- Un `itemsLimit`/`locationRowsLimit` par ville précise (ex: plus d'items pour Abidjan que pour
  une autre ville) — les réglages par section s'appliquent identiquement à toutes les villes.
- Le placement des pubs (`ad_banner`, voir `PUBS-HOME-FEED-PARAMS-ET-POLLS-ADMIN.md`) et des
  sondages (`poll_banner`) : gérés séparément via `POST /ads/campaigns` / `POST /polls`. Seul le
  *nombre max* de pubs par section (`maxAdsPerSection`) est piloté ici.
