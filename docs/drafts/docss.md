# Paramètres pub Home Feed + éléments admin Polls

Ce document couvre deux sujets liés à l'intégration de `GET /me/home` (voir
`HOME-FEED-AGGREGATOR.md`) :

1. Ce qui a changé dans la création de pub (`POST /ads/campaigns`) pour permettre de cibler la home.
2. Tout ce dont le dashboard admin a besoin pour gérer les sondages (Polls).

---

## 1. Paramètres de création de pub modifiés pour le Home Feed

### 1.1 Nouveaux champs sur `CreateAdCampaignDto` / `UpdateAdCampaignDto`

| Champ             | Type                                    | Requis | Défaut  | Rôle |
|--------------------|------------------------------------------|--------|---------|------|
| `position_index`   | `number \| null` (int ≥ 0)               | non    | `null`  | Position de la pub **dans** le tableau `items` d'une section, quand `section_position=inline`. Ignoré pour `before`/`after`. |
| `section_position` | enum `AdSectionPosition` (`inline`, `before`, `after`) | non | `after` | Où la pub apparaît par rapport à la section ciblée par `placement`. |

Migrations : `1785888000000-AddPositionIndexToAdCampaigns` puis
`1789313000000-AddSectionPositionToAdCampaigns`.

**Sémantique de `section_position`** :
- `inline` — comportement historique : la pub est mélangée dans `items` de la section, positionnée par `position_index` (comme pour `RESIDENCE_LIST`).
- `before` / `after` (défaut) — la pub devient sa propre pseudo-section (`type: "ad_banner"` dans `sections[]`), insérée juste avant/après la section entière ciblée. `position_index` n'a alors aucun effet.
- Pour les placements partagés par plusieurs sections dynamiques (ex. `HOME_FEED_RESIDENCES_BY_CITY` qui cible toutes les sections villes/communes), `before`/`after` s'applique **avant la première / après la dernière** du groupe entier, pas à chacune individuellement.
- Pour les sections groupées par ville (`biens_a_louer_par_ville`, etc.), la pub s'insère avant/après la section en bloc — **jamais** à l'intérieur du sous-tableau d'une carte ville précise.

### 1.2 Nouvelles valeurs `AdPlacement` (ciblage Home Feed)

Sections "liste plate" (une pub inline ou avant/après la section) :

| `AdPlacement`                   | Section `GET /me/home` ciblée |
|----------------------------------|-------------------------------|
| `HOME_FEED_NEAR_YOU`             | `near_you` |
| `HOME_FEED_AVAILABLE_NOW`        | `available_now` |
| `HOME_FEED_TOP_RATED`            | `top_rated` |
| `HOME_FEED_NEW_THIS_WEEK`        | `new_this_week` |
| `HOME_FEED_TERRAIN_A_LOUER`      | `terrain_a_louer` |
| `HOME_FEED_TERRAIN_A_ACHETER`    | `terrain_a_acheter` |

Sections groupées par ville/commune (la pub s'insère dans/autour du sous-tableau de chaque groupe) :

| `AdPlacement`                              | Section(s) ciblée(s) |
|----------------------------------------------|-----------------------|
| `HOME_FEED_BIENS_A_LOUER_PAR_VILLE`         | `biens_a_louer_par_ville` |
| `HOME_FEED_BIENS_A_LOUER_PAR_COMMUNE`       | `biens_a_louer_par_commune` |
| `HOME_FEED_BIENS_A_ACHETER_PAR_VILLE`       | `biens_a_acheter_par_ville` |
| `HOME_FEED_BIENS_A_ACHETER_PAR_COMMUNE`     | `biens_a_acheter_par_commune` |
| `HOME_FEED_RESIDENCES_BY_CITY`              | **Toutes** les sections dynamiques `residences_ville_<id>` / `residences_commune_<id>` (une seule pub pour l'ensemble, pas une par ville) |

Pas d'entrée pour les sondages : une pub ne peut pas cibler l'emplacement d'un poll (`poll_before_<id>`/`poll_after_<id>` n'existent pas comme `placement`).

### 1.3 Nouvelle valeur `AdCampaignCategory`

`HORIZONTAL_AD` — catégorie utilisée par toutes les pubs insérées dans le flux du Home Feed (par opposition aux bannières classiques `PROMOTION`, `VILLE_ADS`, etc.). C'est la valeur attendue dans `campaign_category` pour ce type de pub (voir exemples JSON dans `HOME-FEED-AGGREGATOR.md`).

### 1.4 Impact côté dashboard admin (formulaire de création de pub)

- **Rien à coder en dur** : `GET /ads/campaigns/metadata` (Admin, JWT) reflète déjà en direct `placement`, `campaign_category`, `type`, `action`, `status` et **`section_positions`** — toute nouvelle valeur ajoutée côté backend apparaît automatiquement dans les dropdowns.
- Le formulaire doit par contre gérer la dépendance entre champs :
  - Si `section_position = inline` → afficher/activer le champ `position_index`.
  - Si `section_position = before` ou `after` → masquer/désactiver `position_index` (il sera ignoré par le backend de toute façon).
- Tous les autres champs de création (`content`, `media`, `action`, `scope`, `url`, `priority`, `start_date`, `end_date`, `status`) sont inchangés.
- Endpoints CRUD inchangés : `POST/GET/PATCH/DELETE /ads/campaigns[...]` (voir `ad-campaign.controller.ts`), tous Admin + JWT sauf `GET /ads/campaigns/active` et `POST /ads/events` (publics).

---

## 2. Éléments côté Admin nécessaires pour le dashboard Polls

### 2.1 Endpoints disponibles

| Méthode | Route                  | Auth                          | Usage |
|---------|-------------------------|--------------------------------|-------|
| POST    | `/polls`                | JWT + rôle Admin              | Créer un sondage |
| GET     | `/polls`                | Public                        | Liste paginée (`page`, `limit`, `status`) |
| GET     | `/polls/:pollId`        | JWT optionnel                 | Détail + `userHasVoted` (nécessite `device_id` ou JWT) |
| GET     | `/polls/:pollId/results`| Public                        | Résultats détaillés (recalcul lazy du statut si expiré) |
| POST    | `/polls/:pollId/vote`   | JWT optionnel (ou `deviceId`) | Voter |
| PATCH   | `/polls/:pollId`        | JWT (Admin **ou** créateur)   | Modification partielle |
| DELETE  | `/polls/:pollId`        | JWT + rôle Admin              | Suppression (cascade options + votes) |

Le dashboard admin utilisera principalement POST/PATCH/DELETE + le GET liste avec JWT admin pour voir tous les statuts.

### 2.2 Champs du formulaire de création / édition

| Champ             | Type                              | Requis (create) | Notes |
|--------------------|-------------------------------------|------------------|-------|
| `question`         | string, max 500                    | oui              | |
| `description`      | string, max 1000                   | non              | |
| `options[].label`  | string                             | oui, min **2** options | Pas de champ `id` à la création (généré backend) |
| `expiresAt`         | ISO 8601                          | oui              | Fermeture automatique à cette date (lazy, sans CRON) |
| `targetSectionKey` | string, max 150                    | oui              | Clé exacte de section `GET /me/home` — voir 2.4 |
| `sectionPosition`  | enum `before` / `after`            | non (défaut `after`) | Comme les pubs, pas de mode `inline` pour un poll |
| `status`           | enum `ACTIVE` / `CLOSED`           | édition seulement | Permet de fermer un sondage manuellement avant expiration |

`PATCH` accepte n'importe quel sous-ensemble de : `question`, `description`, `expiresAt`, `status`, `targetSectionKey`, `sectionPosition`. **Pas d'édition des options** après création (ni ajout ni suppression) — à confirmer si le dashboard en a besoin, sinon prévoir "supprimer + recréer" comme workaround.

### 2.3 Champs à afficher dans la liste/table admin

Retournés par `GET /polls` et `GET /polls/:pollId` (`PollListItemDto` / `PollDetailsDto`) :

- `id` (UUID)
- `question`, `description`
- `status` (`ACTIVE` / `CLOSED`)
- `expiresAt`
- `totalVotes` (dénormalisé)
- `options[]` : `id`, `label`, `voteCount`, `percentage`
- `targetSectionKey`, `sectionPosition`
- `userHasVoted` (uniquement sur le détail, sans intérêt pour l'admin)

### 2.4 Peupler `targetSectionKey` dans le formulaire

Pas d'enum fixe unique — deux familles de clés :

- **Clés statiques** (`HomeSectionKey`) : `near_you`, `available_now`, `top_rated`, `new_this_week`, `biens_a_louer_par_ville`, `biens_a_louer_par_commune`, `biens_a_acheter_par_ville`, `biens_a_acheter_par_commune`, `terrain_a_louer`, `terrain_a_acheter`.
- **Clés dynamiques** : `residences_ville_<villeId>` / `residences_commune_<communeId>` — dépendent des villes/communes actives, pas connues à l'avance côté backend sous forme d'enum.

Le dashboard n'a aujourd'hui aucun endpoint dédié pour récupérer cette liste (contrairement aux pubs, il n'existe pas de `/polls/metadata`). Voir gap 2.5.

### 2.5 Permissions

| Action                         | Qui peut |
|----------------------------------|----------|
| Créer un sondage                | Admin uniquement |
| Modifier un sondage             | Admin **ou** l'utilisateur qui l'a créé (`createdBy`) |
| Supprimer un sondage            | Admin uniquement |
| Voter / consulter                | Public |

### 2.6 Manques actuels côté backend à anticiper pour le dashboard

- **Pas de `GET /polls/metadata`** : contrairement à `/ads/campaigns/metadata`, il n'existe pas de source unique pour peupler les dropdowns `status`/`sectionPosition`, ni surtout la liste des `targetSectionKey` valides (statiques + dynamiques villes/communes actives). À ajouter côté backend si le dashboard doit éviter le hardcoding, sinon il faudra appeler `GET /me/home` et en extraire les clés `sections[].key` disponibles.
- **`createdBy`, `createdAt`, `updatedAt` non exposés** dans `PollListItemDto`/`PollDetailsDto` (présents en base mais absents de la réponse API) — impossible d'afficher une colonne "créé par" ou de trier par date de création sans exposer ces champs.
- **Pas de recherche texte** sur `question`/`description` dans `GET /polls` (seuls `page`, `limit`, `status` sont filtrables) — à ajouter si le dashboard doit permettre une recherche.
- **Pas d'édition des options** après création (ajout/suppression/renommage d'une option) sur un sondage existant.
- **Pas de statistiques/export** (ex. évolution des votes dans le temps, comparaison de sondages) — si le dashboard veut un graphe de tendance, il faudra l'ajouter côté backend, rien n'existe aujourd'hui au-delà du `voteCount`/`percentage` courant.
