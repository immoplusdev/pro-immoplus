# Design Spec — Amélioration UI Section "Statistiques" — Immo+ PMS 2026

## 📌 Contexte

Ce document analyse l'implémentation actuelle de la page **Statistiques** (captures fournies) au regard de la **Design Spec — Palette de Couleurs Immo+ PMS 2026**, et propose des corrections concrètes pour aligner l'UI sur le système de tokens.

**Constat général :** la page utilise actuellement des couleurs pastel "génériques" (bleu clair, vert clair, jaune clair, teal clair) choisies au cas par cas, sans lien avec les tokens définis dans la spec. Les graphiques mélangent des couleurs qui ne respectent pas les règles d'usage (notamment le vert vibrant `#35FF69`, réservé aux confirmations ponctuelles, utilisé ici en continu sur un graphique de données).

---

## 01. Cartes KPI — "Totaux du jour" & "Finance du jour"

### ❌ Problèmes identifiés

| Carte | Couleur actuelle | Problème |
|-------|------------------|----------|
| Résidences | Bleu clair générique | Pas de lien avec un token ; même bleu que "Biens immobiliers" → aucune distinction visuelle entre deux métriques différentes |
| Visites totales | Vert clair générique | Utilise une teinte proche du vert vibrant (`#35FF69`) hors contexte de confirmation — la spec l'interdit pour ce type d'usage |
| Biens immobiliers | Bleu clair générique (identique à Résidences) | Confusion catégorielle |
| Réservations finalisées | Jaune/orange clair, icône check | Icône "succès" mais couleur orange = ambigu (orange = warning doux dans la spec) |
| Réservations Total initiées | Teal clair | Teal n'est pas dans les tokens de background définis (seulement `--color-cat-2` catégoriel) |
| Montant réservation finalisé | Vert clair | OK conceptuellement (succès) mais couleur non alignée sur `--color-success-bg` |
| Montant réservations initiées | Bleu clair + **icône warning (triangle ⚠️)** | 🔴 **Problème majeur** : icône d'avertissement sur une carte purement informative → donne l'impression fausse qu'il y a un problème/erreur alors que c'est juste un total |
| Montant demandes de visites | Bleu clair | Encore le même bleu réutilisé pour une 3e métrique différente |

### ✅ Recommandations — Mapping par token

Chaque carte doit avoir une couleur **sémantique et unique**, cohérente sur tout le dashboard (même métrique = même couleur partout).

| Métrique | Token background | Token icône | Justification |
|----------|------------------|-------------|----------------|
| Résidences | `--color-primary-50` (#EEF1FE) | `--color-primary` (#2744DE) | Métrique "cœur de métier" → couleur brand |
| Biens immobiliers | `--color-orange-bg` | `--color-orange` (#FA9F42) | Distingue de Résidences ; cohérent avec le chart "Évolution des biens immobiliers" (déjà en orange) |
| Visites totales | `--color-cat-3` en bg 10% (#7B8DFF10) ou `--color-lavender-bg` | `--color-cat-3` (#7B8DFF) | Sort du bleu primaire tout en restant "froid" |
| Réservations finalisées | `--color-success-bg` (#E8F4EE) | `--color-success` (#1F8A5B) | Icône ✅ = succès réel → doit utiliser le token sémantique success, pas orange |
| Réservations Total initiées | `--color-primary-100` (#DDE2FD) | `--color-primary-600` | Variante plus foncée du bleu primaire = hiérarchie visuelle claire avec "Réservations finalisées" |
| Montant réservation finalisé | `--color-success-bg` | `--color-success` | Cohérence avec "Réservations finalisées" (même famille de données) |
| Montant réservations initiées | `--color-primary-50` | `--color-primary` | **Retirer l'icône warning** → remplacer par une icône neutre (ex. `TrendingUp` ou `Wallet`) |
| Montant demandes de visites | `--color-lavender-bg` | `--color-lavender` foncé ou `--color-ink-2` sur fond lavender | Différencie cette 3e carte bleue |

### 🔑 Règle clé à ajouter à la spec

> **Une couleur = une signification.** Ne jamais réutiliser la même couleur de carte pour deux métriques non liées. Si deux métriques appartiennent à la même famille de données (ex : "Réservations finalisées" et "Montant réservation finalisé"), elles doivent partager la même couleur pour créer un lien visuel.

> **Les icônes de statut (⚠️ warning, ✅ succès, ❌ erreur) ne doivent apparaître que si la carte représente réellement un état d'alerte, de succès ou d'erreur** — jamais sur un simple total/montant neutre.

---

## 02. Graphiques — Courbes (Line Charts)

### Graphique "Évolution des demandes de visites"
✅ **Conforme** — utilise `--color-primary` (#2744DE), bon contraste, tooltip clair (fond blanc, bordure, texte noir + valeur en bleu).
→ **Garder comme référence de style** pour tous les autres graphiques (tooltip, points, grille en pointillés).

### Graphique "Évolution des réservations"
❌ **Non conforme** — la ligne utilise un **vert vibrant proche de `#35FF69`**, alors que la spec précise explicitement :
> "Vert Vibrant — À ÉVITER : utilisé sparingly, peut causer de la fatigue oculaire. Réservé aux confirmations ponctuelles (1x par flow), jamais pour des données continues."

**Recommandation :** remplacer par `--color-success` (#1F8A5B) — un vert plus sombre, moins saturé, avec un excellent contraste (6.1:1) et cohérent avec les autres usages "succès/positif" du système. Alternative catégorielle : `--color-cat-6` (#6FCC92) pour un vert plus doux si on veut garder de la légèreté visuelle.

### Graphique "Évolution des biens immobiliers"
✅ Utilise l'orange (`--color-orange` #FA9F42) → cohérent si on applique aussi l'orange à la carte KPI "Biens immobiliers" (cf. section 01).

### Graphique "Évolution des résidences"
🟡 Utilise un violet non identifié dans la spec (proche de `--color-violet` #6240E0 existant, à confirmer). 
**Recommandation :** formaliser ce violet comme `--color-violet` (#6240E0) officiel pour "Résidences", et l'appliquer aussi à la carte KPI correspondante pour créer la cohérence carte ↔ graphique.

---

## 03. Graphique en barres — "Demandes de visites par type"

✅ **Conforme et bon exemple** — `Express` = orange (`--color-orange`), `Normal` = bleu (`--color-primary`). Légende claire, couleurs bien distinctes, bon contraste.
→ Ce graphique doit servir de **modèle de référence** pour la légende et le style des barres empilées.

---

## 04. Graphique empilé — "Réservations par statut"

❌ **Non conforme** — la palette actuelle (violet, bleu, rouge/corail, orange, vert) semble reprendre la palette catégorielle `--color-cat-1` à `--color-cat-8` de façon partielle et non documentée, sans légende visible sur la capture.

### Recommandations

1. **Ajouter une légende explicite** (comme sur le graphique "Demandes de visites par type").
2. **Mapper chaque statut à un token sémantique** plutôt qu'à une couleur catégorielle arbitraire, car un statut de réservation a un sens métier fort :

| Statut probable | Token recommandé | Hex |
|------------------|-------------------|-----|
| Confirmée / Finalisée | `--color-success` | `#1F8A5B` |
| En attente | `--color-warning` | `#B86B0A` |
| Annulée | `--color-danger` | `#C13838` |
| Initiée / Brouillon | `--color-ink-4` ou `--color-cat-3` | `#B4B6C0` / `#7B8DFF` |
| Autre (si applicable) | `--color-violet` | `#6240E0` |

Cela remplace l'usage actuel de couleurs catégorielles "neutres" (orange/violet/rouge/bleu/vert mélangés) par une palette **sémantique**, immédiatement compréhensible sans avoir à lire la légende — un statut "Annulée" en rouge est intuitif, un statut "Annulée" en violet ne l'est pas.

---

## 05. Cohérence globale Carte KPI ↔ Graphique

Règle à documenter dans la spec globale :

> Chaque métrique doit conserver **la même couleur** entre sa carte KPI (résumé du jour) et son graphique d'évolution associé. Exemple : si "Biens immobiliers" est orange dans le graphique, la carte KPI "Biens immobiliers" doit aussi utiliser l'orange (background `--color-orange-bg`, icône `--color-orange`).

Cela crée un lien visuel immédiat entre le chiffre du jour et sa tendance dans le temps — actuellement absent (ex: "Réservations" est vert dans le graphique mais bleu dans la carte KPI).

---

## 06. Typographie & hiérarchie (observations complémentaires)

- Les valeurs chiffrées des cartes KPI (`734`, `278`, `487`…) sont en `--color-ink` (noir), gras, grande taille → ✅ bon contraste et bonne hiérarchie, à conserver.
- Les labels ("Résidences", "Visites totales"…) sont en `--color-ink-3` (gris clair) → ✅ conforme à la hiérarchie texte de la spec (texte tertiaire).
- Les tooltips des graphiques (fond blanc, bordure fine, valeur en couleur du token) sont bien alignés avec la logique `--color-primary-50` / `--color-primary` → à généraliser sur tous les graphiques (actuellement seul le 1er graphique en profite).
- Les montants "FCFA" pourraient bénéficier d'un poids visuel légèrement réduit sur l'unité (`FCFA` en `--color-ink-3`, chiffre en `--color-ink`) pour améliorer la lisibilité, actuellement tout est au même poids.

---

## 07. Checklist d'implémentation

### Phase 1 — Cartes KPI
- [ ] Réassigner chaque carte à un token unique (cf. tableau section 01)
- [ ] Retirer l'icône warning ⚠️ de "Montant total des réservations initiées"
- [ ] Vérifier qu'aucune couleur de carte n'est dupliquée entre métriques non liées
- [ ] Aligner la couleur de chaque carte KPI avec son graphique d'évolution associé

### Phase 2 — Graphiques
- [ ] Remplacer le vert vibrant du graphique "Évolution des réservations" par `--color-success` (#1F8A5B)
- [ ] Formaliser le violet "Résidences" comme token officiel (`--color-violet` #6240E0)
- [ ] Ajouter une légende au graphique "Réservations par statut"
- [ ] Remapper les couleurs du graphique "Réservations par statut" sur les tokens sémantiques (success/warning/danger)
- [ ] Généraliser le style de tooltip du 1er graphique (fond blanc, bordure, valeur colorée) à tous les graphiques

### Phase 3 — Documentation
- [ ] Ajouter la règle "Une couleur = une signification" à la spec globale
- [ ] Ajouter la règle "Cohérence carte KPI ↔ graphique" à la spec globale
- [ ] Documenter dans Figma le mapping statut → couleur sémantique

---

## 📋 Version & Historique

| Version | Date | Changements |
|---------|------|--------------|
| 1.0 | 2026-08-01 | Audit de la page Statistiques et recommandations d'alignement avec la Design Spec Couleurs 2026 |

**Basé sur :** Design Spec — Palette de Couleurs Immo+ PMS 2026
**Prochaine étape :** validation avec l'équipe design avant implémentation dans `globals.css` et les composants de la page Statistiques.