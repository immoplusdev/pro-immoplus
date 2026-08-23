# Spec UI — Création de campagne publicitaire (IMMO+)

**Page concernée :** `Campagnes pub → Créer la campagne`
**Objectif :** clarifier la hiérarchie du formulaire, réduire la charge cognitive, et donner à l'admin un retour visuel immédiat sur ce qu'il est en train de créer (aperçu bannière en direct).

---

## 1. Constats sur l'existant

- Formulaire long, une seule colonne, aucun aperçu → l'admin remplit "à l'aveugle" et doit publier pour voir le rendu.
- Champs obligatoires (*) et optionnels ne sont pas visuellement différenciés au-delà de l'astérisque rouge.
- `Type` (IMAGE/VIDEO/CAROUSEL) et `Statut` (DRAFT...) sont deux boutons/select au style différent alors que ce sont deux choix du même niveau d'importance.
- Les blocs `Priorité` / `Position` (numériques) ne donnent aucune indication sur leur effet.
- La zone `Médias` juxtapose une petite zone "Ajouter" (images) et une grande dropzone (vidéos) → asymétrie sans raison fonctionnelle apparente.
- `Action & Scope` (NONE...) est isolé sans contexte de ce que ça déclenche au clic sur la bannière.
- Aucune surface blanche/hiérarchie de fond : tout est gris clair uniforme, les cartes ne se détachent pas assez.

---

## 2. Design tokens

### 2.1 Couleurs

Fond global **toujours blanc** (`#FFFFFF`). Les couleurs de la charte sont réservées à l'accentuation (statuts, focus, CTA, badges) — jamais en aplat de fond de page.

| Rôle | Token | Hex | Usage |
|---|---|---|---|
| Primaire | `--color-primary` | `#2744DE` | CTA principal, liens actifs, focus ring, sélection |
| Primaire (hover) | `--color-primary-hover` | `#1F37B5` *(dérivé -15% lum.)* | hover/active sur boutons primaires |
| Texte principal | `--color-ink` | `#1A1423` | titres, texte de formulaire |
| Texte secondaire | `--color-ink-60` | `#1A1423` @ 60% | labels optionnels, helper text |
| Bordures | `--color-border` | `#1A1423` @ 12% | inputs, cartes, séparateurs |
| Fond page | `--color-bg` | `#FFFFFF` | fond de toute la page |
| Fond alterné léger | `--color-surface-muted` | `#EEE0CB` @ 30% | fond de la carte "aperçu", zones d'upload au repos |
| Accent succès / Actif | `--color-success` | `#35FF69` | badge statut "ACTIVE", validation de champ |
| Accent alerte / Brouillon | `--color-warning` | `#FA9F42` | badge statut "DRAFT", avertissements non bloquants |
| Accent promo | `--color-accent-pink` | `#F72585` | badge remise (ex. "-20%"), éléments à fort contraste dans l'aperçu |
| Accent secondaire doux | `--color-accent-lilac` | `#D4C2FC` | badge "SCHEDULED", chips secondaires |
| Accent tertiaire doux | `--color-accent-peach` | `#F9DBBD` | hover léger, illustrations vides (empty state) |
| Erreur | `--color-error` | `#F72585` | validation invalide (réutilise le rose, pas de rouge générique) |

Règle d'or : **1 couleur d'accent = 1 signification.** Le rose (`#F72585`) porte l'erreur ET la promo dans l'aperçu — c'est acceptable car ce sont deux contextes disjoints (formulaire vs. rendu bannière), mais ne jamais mélanger les deux usages dans le même composant.

### 2.2 Typographie

| Rôle | Famille | Taille | Poids |
|---|---|---|---|
| Titre de section (`Paramètres généraux`, `Contenu`...) | Inter / Sora | 18px | 600 |
| Label de champ | Inter | 13px | 500 |
| Valeur / input | Inter | 15px | 400 |
| Helper text / compteur (`0/255`) | Inter | 12px | 400, `--color-ink-60` |
| Titre bannière dans l'aperçu | Sora ou police de l'app mobile réelle | 16–20px | 700 |

### 2.3 Espacement & forme

- Grille de base : 4px. Paddings de carte : 24px. Gap entre champs : 20px (horizontal), 24px (vertical).
- `border-radius` : 12px pour les cartes, 8px pour les inputs/boutons, 999px (pill) pour les badges de statut.
- Ombre de carte : `0 1px 2px rgba(26,20,35,0.04), 0 4px 12px rgba(26,20,35,0.04)` — très légère, le blanc doit dominer.

---

## 3. Layout général

Passage d'une colonne unique à un **layout 2 colonnes avec aperçu collant (sticky)**, comme la plupart des back-offices de contenu (Shopify, Notion, CMS headless).

```
┌────────────────────────────────────────────────────────────────┐
│ ← Retour                                    [Créer la campagne]│
├───────────────────────────────────────┬────────────────────────┤
│  COLONNE FORMULAIRE (scroll, ~62%)     │  COLONNE APERÇU (38%)  │
│                                        │  position: sticky      │
│  ● Paramètres généraux                │  top: 24px              │
│    - Placement / Catégorie            │                         │
│    - Type (segmented) / Statut (chip) │  ┌───────────────────┐ │
│    - Priorité / Position              │  │  [Sélecteur vue]  │ │
│    - Dates début / fin                │  │  Mobile | Web     │ │
│                                        │  ├───────────────────┤ │
│  ● Contenu                            │  │                   │ │
│    - Titre (avec compteur live)       │  │   RENDU BANNIÈRE  │ │
│    - Sous-titre / Badge / CTA         │  │   EN TEMPS RÉEL   │ │
│                                        │  │                   │ │
│  ● Médias                             │  └───────────────────┘ │
│    - Images / Vidéos (dropzones       │  État : DRAFT (badge)  │
│      identiques en style)             │  Type : IMAGE          │
│                                        │  Visible du 12/08 au   │
│  ● Action & Scope                     │  20/08                 │
│    - Action / Cible                   │                         │
└───────────────────────────────────────┴────────────────────────┘
```

- **Breakpoint mobile/tablette (< 1024px)** : l'aperçu passe au-dessus du formulaire, en carte non-sticky, repliable (accordéon "Aperçu ▾") pour ne pas monopoliser l'écran.
- Le bouton `Créer la campagne` reste dans une barre d'action collante en haut (comme actuellement) **et** un second bouton identique apparaît en bas de la colonne formulaire pour éviter le scroll-back sur les longs formulaires.

---

## 4. Composants — spécifications détaillées

### 4.1 Sections de formulaire
Chaque bloc (`Paramètres généraux`, `Contenu`, `Médias`, `Action & Scope`) devient une **carte blanche** avec :
- bordure `1px solid var(--color-border)`, `border-radius: 12px`
- en-tête avec titre + micro-description grise en dessous (ex. sous "Contenu" : "Ce que verra l'utilisateur sur la bannière")
- un badge numéroté discret (1/4, 2/4...) optionnel si on veut suggérer une progression, mais **seulement si le remplissage est réellement séquentiel** — sinon l'éviter (cf. principe : la structure encode une vraie info, pas une décoration).

### 4.2 Champs obligatoires vs optionnels
- Garder l'astérisque rouge (`#F72585`) mais ajouter un label gris `(optionnel)` en toutes lettres à côté des champs non requis (`Sous-titre`, `Badge`, `Libellé CTA`, `Priorité`) — moins ambigu qu'un simple contraste d'astérisque.

### 4.3 Type (IMAGE / VIDEO / CAROUSEL) — segmented control
- Remplacer les 3 boutons actuels par un **segmented control unique** (fond `--color-surface-muted`, pastille active en `--color-primary`, texte blanc sur l'actif).
- Icône devant chaque libellé (image / lecteur vidéo / carrousel) pour une reconnaissance instantanée.
- Le changement de Type doit **filtrer dynamiquement le bloc Médias en dessous** (n'afficher que la dropzone pertinente : Images si IMAGE, Vidéos si VIDEO, les deux + un compteur "min. 2 visuels" si CAROUSEL).

### 4.4 Statut — badge/chip select
- Remplacer le `<select>` texte brut par un menu déroulant dont la valeur sélectionnée s'affiche comme un **badge coloré** :
  - `DRAFT` → fond `#FA9F42` @ 15%, texte `#FA9F42` foncé, pastille pleine
  - `ACTIVE` → fond `#35FF69` @ 15%, texte vert foncé
  - `SCHEDULED` → fond `#D4C2FC` @ 30%, texte violet foncé
  - `EXPIRED/ARCHIVED` → fond gris `--color-ink` @ 8%, texte `--color-ink-60`
- Ce même badge est réutilisé tel quel dans la colonne Aperçu, pour la cohérence visuelle statut-formulaire ↔ statut-aperçu.

### 4.5 Priorité / Position
- Ajouter un texte d'aide sous chaque champ (12px, gris) : ex. "Plus la valeur est élevée, plus la bannière apparaît en premier." Un stepper (+/-) à côté de l'input numérique améliore la manipulation tactile/souris.

### 4.6 Dates début / fin
- Garder les deux champs mais ajouter, en dessous, une **phrase de synthèse dynamique** : "Cette campagne sera visible du 12 août au 20 août 2026 (8 jours)." — recalculée en live, erreurs en `--color-error` si date fin < date début.

### 4.7 Titre / Sous-titre / Badge / Libellé CTA
- Regrouper visuellement `Badge` et `Libellé CTA` comme des "extras" avec un fond `--color-surface-muted` léger autour du duo, car ce sont des éléments optionnels qui n'apparaissent que sur certains placements.
- Compteur `0/255` : le faire passer en `--color-warning` à 90% du quota et `--color-error` au dépassement.

### 4.8 Médias — dropzones
- **Unifier le style** : Images et Vidéos utilisent la même dropzone large (icône cloud + "Glissez-déposez... ou cliquez pour parcourir" + formats/poids acceptés), pas une petite case "+ Ajouter" d'un côté et une grande zone de l'autre.
- État hover : bordure `--color-primary`, fond `--color-primary` @ 4%.
- Après upload : miniatures en grille (thumbnails 96×96, coin arrondi 8px), badge poids/format sur chaque miniature, poignée de drag pour réordonner (pertinent surtout en CAROUSEL).

### 4.9 Action & Scope
- Ajouter une phrase contextuelle sous le select `Action` expliquant ce qui se passe au clic : ex. si `NONE` → "La bannière n'est pas cliquable." Si une action type "Ouvrir une résidence" est choisie → afficher dynamiquement un second champ "Résidence cible" (recherche).

---

## 5. Le bloc Aperçu (nouveauté clé)

Carte sticky en colonne droite, fond blanc, bordure `--color-border`.

**En-tête du bloc :**
- Toggle "Mobile / Web" (segmented control discret) si la bannière a un rendu différent selon la plateforme.
- Toggle "Placement" si plusieurs formats existent (ex. bannière pleine largeur vs. carte feed).

**Corps :** rendu fidèle et **live** (mise à jour à chaque frappe/sélection, sans debounce > 150ms) :
- Frame simulant un écran de téléphone (largeur ~320px) ou une carte web selon le toggle.
- Média affiché (image/vidéo/carrousel avec flèches si CAROUSEL) en fond, respectant le ratio réel du placement.
- Superposition : `Badge` (pastille `#F72585`, coin haut-gauche) → `Titre` (gras, blanc ou `--color-ink` selon contraste avec le média) → `Sous-titre` (regular, 80% opacité) → bouton `Libellé CTA` (fond `--color-primary`, texte blanc, pill).
- Si aucun média n'est encore uploadé : **empty state illustré** sur fond `--color-accent-peach` @ 20% avec le texte "Ajoutez une image ou vidéo pour voir l'aperçu" plutôt qu'un cadre vide.

**Pied du bloc :** résumé texte des métadonnées non visibles dans le rendu (Statut en badge, Type, Placement, Catégorie, dates, priorité/position) — évite à l'admin de remonter en haut du formulaire pour vérifier ce qu'il a saisi.

---

## 6. Micro-interactions

- Focus visible sur tous les champs : anneau `2px solid var(--color-primary)` + `outline-offset: 2px`.
- Validation en live (pas seulement au submit) : bordure `--color-error` + message sous le champ dès que l'utilisateur quitte un champ obligatoire vide.
- Le bouton `Créer la campagne` reste désactivé (opacité 40%, curseur not-allowed) tant que les champs obligatoires ne sont pas remplis, avec un tooltip listant les champs manquants au survol.
- Transition douce (150–200ms ease-out) sur l'apparition du rendu Aperçu à chaque changement, pour que l'œil suive la mise à jour sans clignotement brutal.

---

## 7. Accessibilité

- Contraste texte/fond minimum AA (4.5:1) partout, y compris pour le texte blanc sur badges colorés (vérifier `#35FF69` et `#F9DBBD` avec du texte foncé plutôt que blanc — trop clairs pour du texte blanc lisible).
- Tous les champs ont un `<label>` associé (pas seulement un placeholder).
- Le segmented control `Type` et les badges de `Statut` sont navigables au clavier (flèches + Entrée/Espace).
- `prefers-reduced-motion` respecté : désactiver la transition d'aperçu si activé côté OS.

---

## 8. Prochaines étapes suggérées

1. Valider la palette de statuts (DRAFT/ACTIVE/SCHEDULED/EXPIRED) avec le reste du back-office pour cohérence transverse (les mêmes badges doivent être utilisés dans la liste des campagnes).
2. Prototyper le bloc Aperçu en priorité — c'est le changement à plus fort impact perçu.
3. Auditer les autres formulaires de création (Résidences, Meubles...) pour appliquer le même système de tokens et éviter une nouvelle divergence de style.