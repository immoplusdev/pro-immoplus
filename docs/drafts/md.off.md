# Progression des Pros — contrat API dashboard

Base commune : `/admin/pro-progress`. Tous les appels demandent un JWT. Un commercial ne consulte et ne modifie que
les dossiers qui lui sont affectés ; un administrateur peut gérer tous les dossiers.

Les cases `AUTO` sont calculées par le serveur et ne peuvent jamais être modifiées par le client. Les cases `SUP`
relèvent de la supervision : elles sont visibles par tous, mais seul un administrateur peut les modifier.

## Parcours du dashboard

Le dashboard liste les Pros avec les données déjà existantes. Au clic sur un Pro, le frontend appelle **un seul
endpoint** avec son `proId` :

`GET /admin/pro-progress/pros/:proId`

La réponse regroupe ses dossiers (une résidence peut avoir son propre dossier), leur avancement et la checklist
complète. Le frontend n'a donc pas à rechercher d'abord un `caseId`, ni à faire un appel par résidence.

Un Pro sans dossier répond `200` avec `cases: []` et `summary.totalCases: 0` : l'écran affiche simplement « suivi non
démarré ». Le bouton « Démarrer le suivi » crée ensuite le premier dossier.

Les endpoints `/cases` restent ceux de gestion du dossier et de la liste de travail commerciale.

## 1. Lire la progression d'un Pro depuis le dashboard

`GET /admin/pro-progress/pros/:proId`

Réponse : `200`.

```json
{
  "data": {
    "proId": "uuid-du-pro",
    "summary": {
      "totalCases": 2,
      "completedCases": 0,
      "averageCompletionPercent": 42,
      "nextActionAt": "2026-10-08T09:00:00.000Z"
    },
    "cases": [
      {
        "id": "uuid-dossier",
        "residenceId": "uuid-de-la-residence",
        "track": "new_pro",
        "status": "in_progress",
        "currentStep": 3,
        "completionPercent": 42,
        "nextAction": "Programmer l'appel d'accompagnement",
        "nextActionAt": "2026-10-08T09:00:00.000Z",
        "items": [],
        "events": []
      }
    ]
  }
}
```

L'admin peut lire tout Pro. Un commercial reçoit `403` si aucun dossier du Pro ne lui est affecté.

## 2. Ouvrir un dossier

`POST /admin/pro-progress/cases`

```json
{
  "proId": "uuid-du-pro",
  "residenceId": "uuid-de-la-residence",
  "track": "new_pro",
  "assignedCommercialId": "uuid-du-commercial"
}
```

`track` vaut `new_pro` ou `existing_pro`. `residenceId` est facultatif lors du tout premier contact. Si le commercial
ne fournit pas `assignedCommercialId`, il devient automatiquement responsable du dossier.

Réponse : `201`, avec la fiche complète du dossier dans `data`.

## 3. Lister les dossiers de travail

`GET /admin/pro-progress/cases?status=in_progress&commercialId=<uuid>&search=<uuid-ou-texte>&page=1&limit=20`

Paramètres tous facultatifs :

| Paramètre       | Rôle                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| `status`        | `in_progress`, `blocked`, `ready_for_validation`, `completed`, `cancelled` |
| `commercialId`  | filtre réservé à l'admin                                                   |
| `search`        | recherche sur les UUID Pro ou résidence                                    |
| `page`, `limit` | pagination ; limite maximale 100                                           |

```json
{
  "data": [
    {
      "id": "uuid-dossier",
      "proId": "uuid-du-pro",
      "residenceId": "uuid-de-la-residence",
      "track": "new_pro",
      "assignedCommercialId": "uuid-du-commercial",
      "status": "in_progress",
      "nextAction": "Programmer l'appel d'accompagnement",
      "nextActionAt": "2026-10-08T09:00:00.000Z"
    }
  ],
  "currentPage": 1,
  "pageSize": 20,
  "totalCount": 1,
  "totalPages": 1
}
```

## 4. Lire une fiche de progression

`GET /admin/pro-progress/cases/:id`

La réponse comprend les métadonnées du dossier, `currentStep`, `completionPercent`, les cases et les 50 derniers
événements. Exemple d'item :

```json
{
  "key": "rules.documents_sent",
  "step": 3,
  "source": "COM",
  "label": "Règles et interdits envoyés",
  "state": "done",
  "completedAt": "2026-10-05T11:00:00.000Z",
  "completedBy": "uuid-du-commercial",
  "note": "Documents envoyés sur WhatsApp."
}
```

Les cases se répartissent en trois sources : `AUTO` (calcul serveur, lecture seule), `COM` (actions commerciales) et
`SUP` (contrôles de supervision, modifiables uniquement par un administrateur). Le frontend affiche les cases `AUTO`
et `SUP` mais verrouille les cases `SUP` pour un commercial.

## 5. Mettre à jour le dossier

`PATCH /admin/pro-progress/cases/:id`

Tous les champs sont facultatifs.

```json
{
  "status": "in_progress",
  "assignedCommercialId": "uuid-du-commercial",
  "nextAction": "Rappeler le Pro pour confirmer la lecture des règles",
  "nextActionAt": "2026-10-08T09:00:00.000Z"
}
```

Seul l'admin peut réaffecter un dossier avec `assignedCommercialId`.

## 6. Mettre à jour une case humaine

`PATCH /admin/pro-progress/cases/:id/items/:itemKey`

```json
{
  "state": "done",
  "note": "Le Pro a confirmé la lecture et posé ses questions."
}
```

États possibles : `pending`, `done`, `failed`, `not_applicable`.

Le frontend affiche le commentaire `items[].note` sous la case concernée. Pour une case humaine accessible à
l'utilisateur, l'action « Ajouter une note » / « Modifier la note » ouvre une saisie permettant de mettre à jour à la
fois l'état et le commentaire.

Exemples de clés MVP : `rules.documents_sent`, `rules.read_confirmed`, `residence.reviewed`, `call.completed`,
`understanding.checked`, `training.scheduled`, `training.completed`.

Une clé `AUTO` ou inconnue répond en erreur. Une clé `SUP` répond `403` si elle est modifiée par un commercial. Le
front doit seulement afficher les cases `AUTO`, et afficher les cases `SUP` en lecture seule pour un commercial.
Chaque modification écrit aussi un événement d'audit dans l'historique de la fiche.

## Erreurs principales

| Code  | Situation                                                                    |
| ----- | ---------------------------------------------------------------------------- |
| `401` | JWT absent ou invalide                                                       |
| `403` | commercial non affecté au dossier, réaffectation ou modification d'une case `SUP` tentée par un commercial |
| `404` | dossier inexistant                                                           |
| `400` | payload ou clé de checklist invalide                                         |
