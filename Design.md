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

### 2.1 Palette validée — Immo+ PMS

Système **mono-accent** : une seule couleur de marque (le bleu), pas de couleur secondaire décorative. Tout le reste est neutre ou fonctionnel (sémantique / catégoriel).

**Primaire**

| Token | Valeur | Usage |
|---|---|---|
| `--color-primary` | `#2744DE` | CTA, nav active, liens, icônes de marque, focus ring |
| `--color-primary-hover` | `#1D36C0` | État hover / pressed des boutons primaires |
| `--color-primary-active` | `#1729A3` | État actif / pressed fort |
| `--color-primary-50` | `#EEF1FE` | Fond des alertes info uniquement |
| `--color-primary-100` | `#DDE2FD` | Fond info renforcé (rare) |
| `--color-primary-200` | `#BFC8FB` | Bordure d'accent léger sur fond info |

**Neutres**

| Token | Valeur | Usage |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Seul et unique fond de l'app, sans exception |
| `--color-text` | `#12131A` | Texte principal |
| `--color-text-muted` | `#494C57` | Texte secondaire, labels |
| `--color-text-subtle` | `#888B96` | Texte tertiaire, légendes |
| `--color-text-disabled` | `#B4B6C0` | Texte désactivé |
| `--color-border` | `#E8E9EE` | Bordure standard des cards |
| `--color-border-soft` | `#F1F1F5` | Séparateurs très discrets |
| `--color-border-strong` | `#C8C8E0` | Bordure accentuée (focus, sélection) |

**Sémantique** (statuts uniquement, jamais décoratif)

| Token | Valeur | Fond associé | Usage |
|---|---|---|---|
| `--color-success` | `#1F8A5B` | `#E8F4EE` | Confirmation, succès |
| `--color-warning` | `#B86B0A` | `#FBF1DE` | Avertissement |
| `--color-danger` | `#C13838` | `#FBE7E5` | Erreur, action destructive |

### 2.2 Répartition — système mono-accent

- **~90 % neutre** (blanc + textes gris + bordures) : c'est la quasi-totalité de chaque écran.
- **~10 % primaire** : CTA, états actifs, liens, focus. Rien d'autre ne porte la couleur de marque.
- **Aucune couleur secondaire/accent décorative.** Rose, vert vif, peach, orange, lavande, beige, violet, teal, amber, coral : retirés du système.
- Le sémantique et le catégoriel (§2.3) sont des exceptions **fonctionnelles**, pas des accents de style : ils ne comptent pas dans le "10 % primaire" et ne servent jamais à décorer un écran sans raison de statut ou de donnée.

### 2.3 Exception fonctionnelle — couleurs catégorielles (data-viz uniquement)

Utilisées **uniquement** pour distinguer des séries de graphique ou des avatars — jamais comme couleur de bouton, badge, fond de card ou chrome UI.

```
--color-cat-1: #E89060
--color-cat-2: #6FB5A8
--color-cat-3: #7B8DFF
--color-cat-4: #B57BE6
--color-cat-5: #F5C572
--color-cat-6: #6FCC92
--color-cat-7: #FF8585
--color-cat-8: #6FB5DD
```

### 2.4 Interdits couleur

- ❌ Dégradés multicolores (fond, boutons, cards, **y compris l'écran de connexion**) — zéro gradient dans tout le produit.
- ❌ Couleurs "néon"/saturées à outrance (la famille rose/vert vif/peach est définitivement retirée).
- ❌ Toute couleur secondaire/accent en dehors du bleu primaire et des exceptions fonctionnelles (§2.3).
- ❌ Fond gris secondaire type `#F4F5F8` — un seul fond dans toute l'app : blanc.
- ❌ Couleur utilisée sans signification (une card verte "parce que c'est joli" alors que le vert = succès ailleurs dans l'app).
- ❌ Couleurs catégorielles utilisées en dehors des graphiques/avatars (ex. un bouton en `--color-cat-3`).

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
  /* Fond — unique, sans exception */
  --color-bg: #FFFFFF;

  /* Primaire */
  --color-primary: #2744DE;
  --color-primary-hover: #1D36C0;
  --color-primary-active: #1729A3;
  --color-primary-50: #EEF1FE;
  --color-primary-100: #DDE2FD;
  --color-primary-200: #BFC8FB;

  /* Neutres */
  --color-text: #12131A;
  --color-text-muted: #494C57;
  --color-text-subtle: #888B96;
  --color-text-disabled: #B4B6C0;
  --color-border: #E8E9EE;
  --color-border-soft: #F1F1F5;
  --color-border-strong: #C8C8E0;

  /* Sémantique */
  --color-success: #1F8A5B;
  --color-success-bg: #E8F4EE;
  --color-warning: #B86B0A;
  --color-warning-bg: #FBF1DE;
  --color-danger: #C13838;
  --color-danger-bg: #FBE7E5;

  /* Catégoriel — data-viz uniquement, jamais en chrome UI */
  --color-cat-1: #E89060;
  --color-cat-2: #6FB5A8;
  --color-cat-3: #7B8DFF;
  --color-cat-4: #B57BE6;
  --color-cat-5: #F5C572;
  --color-cat-6: #6FCC92;
  --color-cat-7: #FF8585;
  --color-cat-8: #6FB5DD;

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
- [ ] Aucune couleur d'accent en dehors du bleu primaire (sauf couleurs catégorielles, réservées aux graphiques/avatars).
- [ ] Aucun dégradé nulle part — y compris sur l'écran de connexion.
- [ ] Aucun glow, aucun blur.
- [ ] Le bento respecte une grille régulière, sans tailles de blocs arbitraires.
- [ ] Aucune animation superflue au chargement.
- [ ] Chaque élément coloré a une signification (pas de couleur "juste jolie").