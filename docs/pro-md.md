# Design System — Règles UI Dashboard

Document de référence à suivre pour toute modification ou création d'écran du dashboard (par un designer, un développeur, ou une IA). Objectif : garder une interface sobre, cohérente, et éviter l'effet "généré par IA" (fonds dégradés, ombres flottantes, éléments décoratifs sans fonction).

---

## 1. Fondations

- **Un seul fond dans toute l'application : blanc `#FFFFFF`.**
  - Pas de gris clair en fond de page (`#F5F5F5`, `#FAFAFA`...).
  - Pas de beige/crème, pas de fond "glassmorphism".
  - Pas de dégradé en fond, jamais.
- Les cards, sidebars, modales, headers : **même fond blanc** que la page. On ne "sort" pas un bloc en changeant sa couleur de fond.
- La séparation entre les zones se fait par :
  1. une bordure fine (outline) — méthode par défaut,
  2. l'espacement (whitespace),
  3. la hiérarchie typographique.
  → **Pas par une ombre, pas par un fond différent.**

---

## 2. Couleurs

### 2.1 Palette (à adapter à votre marque)

| Token | Rôle | Exemple | Usage |
|---|---|---|---|
| `--color-bg` | Fond unique | `#FFFFFF` | Toute surface, sans exception |
| `--color-primary` | Couleur principale | `#2563EB` | Actions principales, états actifs, focus |
| `--color-secondary` | Couleur d'accent | `#7C3AED` | Accents ponctuels, 2ᵉ série de data, tags |
| `--color-text` | Texte principal | `#0F172A` | Titres, contenu clé |
| `--color-text-muted` | Texte secondaire | `#64748B` | Labels, légendes, aide |
| `--color-border` | Bordures | `#E2E8F0` | Outline des cards, séparateurs |
| `--color-success / warning / danger` | États sémantiques | vert / ambre / rouge | Statuts uniquement, jamais décoratif |

### 2.2 Règle de mix primaire / secondaire — 60/30/10

- **60 % neutre** (blanc + textes gris + bordures) : c'est la base de l'écran.
- **30 % couleur primaire** : CTA, liens actifs, éléments sélectionnés, icônes clés, focus ring.
- **10 % couleur secondaire** : accents ponctuels seulement (2ᵉ courbe d'un graphique, un badge, un highlight). Jamais utilisée comme couleur de fond pleine.
- La primaire et la secondaire **ne se mélangent jamais en dégradé** (pas de `linear-gradient(primary, secondary)`).
- Une seule couleur d'accent par composant à la fois — ne pas colorer 5 éléments différents avec 5 couleurs différentes sur un même bloc.

### 2.3 Interdits couleur

- ❌ Dégradés multicolores (fond, boutons, cards).
- ❌ Couleurs "néon"/saturées à outrance.
- ❌ Plus de 2 couleurs d'accent visibles simultanément sur un même écran.
- ❌ Couleur utilisée sans signification (une card verte "parce que c'est joli" alors que le vert = succès ailleurs dans l'app).

---

## 3. Cards

- Fond : blanc (`--color-bg`), identique à la page.
- Séparation : bordure `1px solid var(--color-border)`.
- Pas d'ombre par défaut. Une card ne "flotte" pas.
- `border-radius` : valeur unique de la grille de radius (voir §6), la même pour toutes les cards du dashboard.
- Padding interne cohérent : `16px` (compact) ou `24px` (standard) — choisir une seule échelle et s'y tenir.
- En-tête de card : titre + éventuelle icône fonctionnelle. Pas de badge/pill décoratif ajouté "pour remplir".
- Un seul niveau de card à la fois : éviter les cards imbriquées dans des cards.

---

## 4. Bento grid

- Grille basée sur une unité fixe (ex. colonnes de 12, gap constant `16` ou `24px`) — pas de tailles de blocs random.
- Chaque cellule du bento = une card, avec les **mêmes règles** de fond/bordure/radius que le reste (§3).
- La taille d'un bloc (1x1, 2x1, 2x2...) doit refléter l'importance réelle de la donnée, pas un souci purement esthétique.
- Alignement strict sur la grille : pas de blocs qui débordent ou qui créent des espaces vides irréguliers.
- Éviter de dépasser 3 tailles de blocs différentes sur un même écran (sinon ça devient illisible).

---

## 5. Élévation & ombres

- Deux niveaux maximum dans toute l'app :
  - **Repos** : aucune ombre (bordure seule).
  - **Interaction** (hover, focus, drag) : ombre très subtile, ex. `0 1px 2px rgba(15, 23, 42, 0.06)`.
- L'élévation "forte" (ombre large et diffuse) est réservée aux éléments **transitoires** : menu déroulant, tooltip, modale. Jamais pour un élément statique de la page (card, section, sidebar).
- ❌ Ombres colorées / "glow" (`box-shadow: 0 0 40px rgba(primary, 0.5)`).
- ❌ Ombres qui donnent un effet de card "flottante dans l'espace".
- ❌ Blur / glassmorphism (`backdrop-filter: blur(...)`).

---

## 6. Bordures (outline) & border-radius

- Bordure standard : `1px solid var(--color-border)`. Pas de bordures épaisses ou colorées sauf état d'erreur/focus.
- Grille de radius unique pour tout le produit (n'en choisir que 2-3) :

| Token | Valeur | Usage |
|---|---|---|
| `--radius-sm` | 6px | inputs, tags, petits boutons |
| `--radius-md` | 10px | cards, boutons standards |
| `--radius-lg` | 16px | grands blocs bento, modales |

- ❌ Mélanger des radius très arrondis (`24px`+) avec des radius carrés sur des composants de même niveau.
- ❌ `border-radius: 9999px` (pill) réservé aux vrais composants "pilule" (badge, tag, toggle) — jamais utilisé sur une card ou un bouton standard.

---

## 7. Typographie (rappel court)

- Une seule famille de police pour l'interface (une deuxième uniquement si vraiment nécessaire pour les chiffres/data en tabulaire).
- Échelle de tailles limitée (4-5 paliers), pas de tailles improvisées au cas par cas.
- Hiérarchie par poids (regular/medium/semibold) plutôt que par couleur ou taille excessive.

---

## 8. Motion

- Transitions courtes : 150–200ms, `ease` simple.
- Uniquement sur des changements d'état réels (hover, ouverture, sélection).
- ❌ Animations d'entrée "au chargement" sur chaque card (fade-in en cascade, slide, bounce).
- ❌ Scale exagéré au hover (`transform: scale(1.05)` sur des cards de dashboard).

---

## 9. Liste noire — anti "généré par IA"

À bannir systématiquement, quel que soit le contexte :

- Fond dégradé multicolore ou "blob" abstrait en arrière-plan.
- Glassmorphism / flou d'arrière-plan.
- Cards avec ombre large façon "flottant au-dessus de la page".
- Glow/néon autour des éléments actifs.
- Icônes ou emojis utilisés au hasard, sans set d'icônes cohérent.
- Badges/pills colorés ajoutés sur chaque métrique juste pour "faire riche visuellement".
- Numérotation décorative (01 / 02 / 03) sur des éléments qui ne sont pas réellement une séquence.
- Illustrations 3D génériques ou formes abstraites colorées sans lien avec la donnée.
- Sur-accumulation d'accents colorés différents sur un même écran.
- Radius incohérents d'un composant à l'autre.
- Animation d'apparition en cascade sur chaque chargement d'écran.

---

## 10. Tokens CSS de référence

```css
:root {
  /* Fond */
  --color-bg: #FFFFFF;

  /* Couleurs */
  --color-primary: #2563EB;
  --color-secondary: #7C3AED;
  --color-text: #0F172A;
  --color-text-muted: #64748B;
  --color-border: #E2E8F0;
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-danger: #DC2626;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Ombre (interaction uniquement) */
  --shadow-interactive: 0 1px 2px rgba(15, 23, 42, 0.06);

  /* Espacements */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
}
```

---

## 11. Checklist avant de valider un écran

- [ ] Le fond est blanc partout, sans exception.
- [ ] Les cards se distinguent par bordure, pas par ombre ni couleur de fond.
- [ ] Une seule échelle de radius est utilisée.
- [ ] La couleur secondaire occupe une place minoritaire (≈10 %).
- [ ] Aucun dégradé, glow, ou blur n'est présent.
- [ ] Le bento respecte une grille régulière, sans tailles de blocs arbitraires.
- [ ] Aucune animation superflue au chargement.
- [ ] Chaque élément coloré a une signification (pas de couleur "juste jolie").