# PRO-DASHBOARD-KPI

# Ticket — Dashboard de pilotage des demandes Pro (Partie A)

> Partie A de la spec certification/pilotage Pro. Le score /100 et le badge « Immo Plus Pro Certifié » affichés dans le bloc Qualité sont couverts par la Partie B — ce ticket les consomme, il ne les recalcule pas.

* * *

## Titre

**Dashboard de pilotage des demandes Pro — Vue globale & analyse par Pro**

## Description brève

Dashboard (Admin) donnant une vue d'ensemble du traitement des demandes de réservation par les Pros : volume reçu, décisions (acceptées/refusées), blocages (sans réponse), résultats (effectuées, CA validé). Complété par un tableau comparatif par Pro (classement, filtres, alerte critique) pour identifier les Pros performants et les Pros à risque.

**Règle de statut** : après le délai de réponse (`response_deadline_at`), une demande est classée **acceptée**, **refusée** ou **sans réponse**. Tant que le délai n'est pas dépassé, elle reste **en attente**.

**KPI et formules** :

| Indicateur | Définition | Affichage |
|---|---|---|
| Demandes reçues | Demandes créées et livrées au Pro | Nombre |
| Acceptées | Clic explicite « Accepter » avant l'échéance | Nb + taux |
| Refusées | Clic explicite « Refuser » avant l'échéance | Nb + taux |
| Sans réponse | Aucune décision du Pro à l'échéance | Nb + taux |
| Confirmées | Paiement ou acompte validé | Nombre |
| Effectuées | Séjour terminé, non annulé, non remboursé | Nb + CA |
| Délai médian | Médiane du temps de réponse du Pro | Minutes |

- `demandes éligibles = acceptées + refusées + sans réponse`
- `taux d'acceptation = acceptées ÷ demandes éligibles`
- `taux de non-réponse = sans réponse ÷ demandes éligibles`
- `taux de conversion = effectuées ÷ demandes reçues (même cohorte)`

**Tableau par Pro** :

| Bloc | Colonnes | Règle |
|---|---|---|
| Réponse | Reçues, acceptées, refusées, sans réponse, taux d'acceptation, délai médian | Cohorte par date de demande |
| Conversion | Confirmées, effectuées, annulations client, annulations Pro | Statuts exclusifs |
| Valeur | CA brut, remboursements, CA validé, bonus acquis et payé | F CFA (XOF) |
| Qualité | Badge, score /100, alertes, calendrier à jour, dernière activité | Temps réel |

Classement : réservations effectuées décroissantes → taux d'acceptation → délai médian. Minimum 10 demandes éligibles pour comparer.
Filtres : période, zone, résidence, type de Pro, badge, statut, source de la demande.
Alerte critique : non-réponse ≥ 30 % sur au moins 5 demandes éligibles pendant les 30 derniers jours.

* * *

## Endpoints

### 1. `GET /statistics/pros/kpis` — Vue globale

Auth : Admin.

**Query params** : `period` (`week`\|`month`\|`quarter`\|`year`\|`custom`), `dateStart`, `dateEnd`, `villeId`, `communeId`, `residenceId`, `proType` (`pro_particulier`\|`pro_entreprise`), `badge` (`en_progression`\|`eligible`\|`certifie`\|`suspendu`\|`retire`), `status` (`accepted`\|`refused`\|`no_response`\|`pending`), `source` (`app`\|`whatsapp`\|`admin`\|`api`).

Pas de body : c'est un `GET`, tous les filtres passent en query string.

**Contrôle par dates** : deux modes.
1. Fenêtre glissante prédéfinie — `period=week`\|`month`\|`quarter`\|`year` : calcule automatiquement `debut`/`fin` à partir de maintenant.
2. Plage libre — `period=custom` avec `dateStart` et `dateEnd` obligatoires (format `YYYY-MM-DD`), sinon `400 Bad Request`.

**Exemples de requêtes** :

```
GET /v1/statistics/pros/kpis?period=month
GET /v1/statistics/pros/kpis?period=custom&dateStart=2026-07-01&dateEnd=2026-07-15
GET /v1/statistics/pros/kpis?period=custom&dateStart=2026-07-01&dateEnd=2026-07-15&villeId=ab12...&proType=pro_entreprise&badge=certifie
```

Retourne les totaux de la période : demandes reçues, décisions (acceptées/refusées), blocages (sans réponse), résultats (effectuées + CA validé), confirmées, délai médian, taux de conversion.

**Limites connues** :
- `source` est accepté par l'API mais n'a aucun effet (pas encore tracké).
- `acceptées` = toute demande qui a quitté le statut "en attente" par acceptation (y compris si le client a ensuite annulé/pas payé) ; `refusées` = refus explicite du Pro ; `sans réponse` = délai dépassé sans décision. Les demandes encore en attente sont exclues des `demandes éligibles`.
- `delaiMedianMinutes` : `null` uniquement s'il n'existe aucune réservation acceptée/refusée sur la période (sinon calculé précisément, avec reconstruction approximative pour les réservations antérieures au suivi précis).

**Réponse** (`200 OK`, exemple pour `period=custom&dateStart=2026-07-01&dateEnd=2026-07-28`) :

```json
{
  "data": {
    "periode": { "debut": "2026-07-01", "fin": "2026-07-28", "label": "custom" },
    "demandes": { "recues": 1240 },
    "decisions": {
      "acceptees": { "nombre": 812, "taux": 74.2 },
      "refusees": { "nombre": 210, "taux": 19.2 }
    },
    "blocages": {
      "sansReponse": { "nombre": 72, "taux": 6.6 }
    },
    "resultats": {
      "effectuees": 690,
      "caValideFcfa": 48500000
    },
    "confirmees": 780,
    "delaiMedianMinutes": 14,
    "tauxConversion": 55.6
  }
}
```

### 2. `GET /statistics/pros` — Tableau par Pro

Auth : Admin.

Mêmes filtres que l'endpoint #1, plus pagination et tri.

**Query params additionnels** : `sortBy` (`reservationsEffectuees`\|`tauxAcceptation`\|`delaiMedian`, optionnel — sans valeur, classement par défaut : effectuées décroissantes → taux d'acceptation → délai médian), `sortDir` (`asc`\|`desc`, défaut `desc`), `alerteCritique` (`true` pour ne lister que les Pros en alerte), `page` (défaut 1), `perPage` (défaut 20, max 100).

Retourne une liste paginée de Pros avec leurs 4 blocs (réponse, conversion, valeur, qualité) et le flag d'éligibilité au classement.

**Limites connues** :
- `source` accepté mais sans effet.
- `remboursementsFcfa`, `bonusAcquisFcfa`, `bonusPayeFcfa` : toujours `0` (non trackés).
- `calendrierAJour` : toujours `null` (non calculé).
- `derniereActiviteAt` : approximation (dernière modification connue d'une réservation du Pro, pas un vrai suivi d'activité).
- `zone` : choisie arbitrairement si le Pro a des résidences dans plusieurs villes/communes.
- `annulationsPro` (bloc conversion) = même compteur que `refusees` (bloc réponse).
- Alerte critique calculée sur une fenêtre **fixe des 30 derniers jours**, indépendamment de la période choisie par `period`/`dateStart`/`dateEnd`.

**Réponse** (`200 OK`) :

```json
{
  "data": [
    {
      "proId": "3f1e2a10-...",
      "nom": "Konan Yao",
      "type": "pro_entreprise",
      "zone": { "ville": "Abidjan", "commune": "Cocody" },
      "reponse": {
        "recues": 96,
        "acceptees": 78,
        "refusees": 12,
        "sansReponse": 6,
        "tauxAcceptation": 81.3,
        "delaiMedianMinutes": 9
      },
      "conversion": {
        "confirmees": 74,
        "effectuees": 70,
        "annulationsClient": 3,
        "annulationsPro": 1
      },
      "valeur": {
        "caBrutFcfa": 6200000,
        "remboursementsFcfa": 0,
        "caValideFcfa": 6050000,
        "bonusAcquisFcfa": 0,
        "bonusPayeFcfa": 0,
        "devise": "XOF"
      },
      "qualite": {
        "badge": "certifie",
        "score": 92,
        "alertes": [],
        "calendrierAJour": null,
        "derniereActiviteAt": "2026-07-27T18:42:00Z"
      },
      "demandesEligibles": 96,
      "eligiblePourClassement": true
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "pageSize": 20,
  "totalCount": 93,
  "hasPrevious": false,
  "hasNext": true
}
```

`hasPrevious`/`hasNext` sont des champs additionnels du wrapper de pagination standard de l'API, absents du ticket d'origine mais déjà présents partout ailleurs, gardés pour rester cohérent.

### 3. `GET /statistics/pros/:proId` — Fiche détail d'un Pro

Route dédiée (n'enrichit pas `GET /statistics/owner`, qui reste le dashboard self-service du Pro connecté, avec un body différent).

Auth : Admin uniquement.

**Query params** : mêmes que l'endpoint #1 (`period`, `dateStart`, `dateEnd`, `villeId`, `communeId`, `residenceId`, `status`, `source` non filtrant) — pas de `proType`/`badge`, redondants puisque le Pro est déjà identifié par `proId`.

**Différence clé avec la liste (#2)** : si ce Pro n'a aucune réservation sur la période filtrée, la fiche retourne quand même un objet avec tous les compteurs à `0`/`null` (pas un 404) — contrairement à la liste qui omet naturellement les Pros inactifs. `404 Not Found` uniquement si `proId` n'existe pas ou n'est pas un Pro.

**Réponse** (`200 OK`) : exactement la même shape et les mêmes limites qu'un élément du tableau `data[]` de l'endpoint #2.

```json
{
  "data": {
    "proId": "3f1e2a10-...",
    "nom": "Konan Yao",
    "type": "pro_entreprise",
    "zone": { "ville": "Abidjan", "commune": "Cocody" },
    "reponse": { "recues": 96, "acceptees": 78, "refusees": 12, "sansReponse": 6, "tauxAcceptation": 81.3, "delaiMedianMinutes": 9 },
    "conversion": { "confirmees": 74, "effectuees": 70, "annulationsClient": 3, "annulationsPro": 1 },
    "valeur": { "caBrutFcfa": 6200000, "remboursementsFcfa": 0, "caValideFcfa": 6050000, "bonusAcquisFcfa": 0, "bonusPayeFcfa": 0, "devise": "XOF" },
    "qualite": { "badge": "certifie", "score": 92, "alertes": [], "calendrierAJour": null, "derniereActiviteAt": "2026-07-27T18:42:00Z" },
    "demandesEligibles": 96,
    "eligiblePourClassement": true
  }
}
```
