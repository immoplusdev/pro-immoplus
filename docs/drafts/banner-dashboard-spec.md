
# Dashboard Bannières — Spécification Frontend
> Document de référence pour l'implémentation de la gestion des bannières dans le backoffice ImmoPlus.
> Destiné aux équipes marketing et développement frontend.
> Mai 2026

---

## 1. Vue d'ensemble

Le module **Bannières** permet à l'équipe marketing de créer et gérer des bannières promotionnelles ou de notification affichées dans l'app client et/ou l'app pro, sans intervention technique.

### Accès
- **Rôle requis :** Admin
- **URL backoffice :** `/banners`
- **API base :** `GET|POST|PATCH|DELETE /banners`

---

## 2. Architecture des pages

```
/banners                → Liste des bannières
/banners/new            → Formulaire de création
/banners/:id/edit       → Formulaire de modification
```

---

## 3. Page Liste — `/banners`

### 3.1 En-tête de page

```
┌─────────────────────────────────────────────────────────────────┐
│  🏷️  Bannières                              [+ Créer une bannière] │
│  Gérez les bannières affichées dans les apps client et pro.      │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Barre de filtres

```
┌──────────────────────────────────────────────────────────────────┐
│  [Toutes ▾]  [Audience ▾]  [Type ▾]  [Statut ▾]   🔍 Rechercher │
└──────────────────────────────────────────────────────────────────┘
```

| Filtre | Options |
|--------|---------|
| Audience | Toutes · App Client (buyer) · App Pro (seller) · Les deux (all) |
| Type | Toutes · Promo · Notification |
| Statut | Toutes · Active · Inactive |

### 3.3 Tableau des bannières

```
┌────┬────────────────────────┬───────────┬──────────┬────────┬──────┬──────────────┐
│ #  │ Bannière               │ Audience  │ Type     │ Statut │ Ordre│ Actions      │
├────┼────────────────────────┼───────────┼──────────┼────────┼──────┼──────────────┤
│ 1  │ [●] Publiez vos biens  │ 🏢 Pro    │ Promo    │ ✅ Act. │  1  │ ✏️ 🗑️ 👁️     │
│    │ Ajoutez vos apparts... │           │          │        │     │              │
├────┼────────────────────────┼───────────┼──────────┼────────┼──────┼──────────────┤
│ 2  │ [●] Réservation valid. │ 👤 Client │ Notif.   │ ✅ Act. │  1  │ ✏️ 🗑️ 👁️     │
│    │ Effectue vite le paie. │           │          │        │     │              │
├────┼────────────────────────┼───────────┼──────────┼────────┼──────┼──────────────┤
│ 3  │ [●] Offre du mois      │ 🌐 Tous   │ Promo    │ ⏸️ Inac│  2  │ ✏️ 🗑️ 👁️     │
└────┴────────────────────────┴───────────┴──────────┴────────┴──────┴──────────────┘
```

**Colonne Bannière :** afficher un carré coloré (bg_color) + icône + titre + sous-titre tronqué

**Actions :**
- ✏️ Modifier → `/banners/:id/edit`
- 🗑️ Supprimer → confirmation modale avant `DELETE /banners/:id`
- 👁️ Prévisualiser → ouvre un aperçu dans une modale latérale

### 3.4 Toggle Actif/Inactif

Chaque ligne a un **toggle switch** sur la colonne Statut.
Un clic envoie directement `PATCH /banners/:id` avec `{ "active": true/false }`.
Pas besoin d'ouvrir le formulaire.

```
Actif  ●──  (toggle)
Inactif  ──○
```

### 3.5 Réorganisation par drag & drop

Les lignes du tableau sont **draggables** (handle ≡ à gauche).
Après un déplacement, envoyer `PATCH /banners/:id` avec le nouveau `order` pour chaque bannière affectée.

> Ordre affiché = ordre d'apparition dans l'app.

---

## 4. Formulaire Création / Modification

### 4.1 Layout

```
┌─────────────────────────────────┬──────────────────────────────┐
│  FORMULAIRE (60%)               │  PRÉVISUALISATION LIVE (40%) │
│                                 │                              │
│  ...champs...                   │  [carte bannière rendue]     │
│                                 │                              │
└─────────────────────────────────┴──────────────────────────────┘
```

### 4.2 Champs du formulaire

#### Section "Contenu"
```
Titre *
┌────────────────────────────────────────────┐
│ Publiez vos biens facilement               │
└────────────────────────────────────────────┘
Limite : 255 caractères — compteur visible

Sous-titre
┌────────────────────────────────────────────┐
│ Ajoutez vos appartements en quelques clics.│
└────────────────────────────────────────────┘
Limite : 500 caractères
```

#### Section "Bouton principal (CTA)"
```
Label du bouton           URL de destination
┌──────────────────┐      ┌───────────────────────────┐
│ Démarrer         │      │ /publisher/new            │
└──────────────────┘      └───────────────────────────┘
```

#### Section "Bouton secondaire (optionnel)"
```
Label du bouton           URL de destination
┌──────────────────┐      ┌───────────────────────────┐
│ En savoir plus   │      │ /help                     │
└──────────────────┘      └───────────────────────────┘
```
> Laisser vide = bouton secondaire non affiché dans l'app.

#### Section "Apparence"
```
Icône                     Couleur de fond
┌──────────────────┐      ┌───────────────────────────┐
│ plus-circle   ▾  │      │ ████ #5B3FE4    [picker]  │
└──────────────────┘      └───────────────────────────┘
```

**Sélecteur d'icônes :** liste déroulante avec aperçu visuel :
```
● plus-circle          Ajouter
● calendar-check       Calendrier validé
● bell                 Cloche
● home                 Maison
● star                 Étoile
● megaphone            Annonce
● credit-card          Paiement
● check-circle         Succès
```

**Color picker** avec raccourcis couleurs prédéfinies ImmoPlus :
```
[#5B3FE4] [#1A5CFF] [#00B37E] [#FF4E4E] [#FF8C00] [Personnalisé]
```

#### Section "Ciblage"
```
Audience                  Type
┌──────────────────────┐  ┌──────────────────────┐
│ ○ App Client (buyer) │  │ ○ Promotionnel        │
│ ○ App Pro (seller)   │  │ ● Notification        │
│ ● Les deux (all)     │  └──────────────────────┘
└──────────────────────┘

                   Audience preview :
                   ┌─────────────┬─────────────┐
                   │ 👤 Client  │ 🏢 Pro      │
                   │  ✅ Visible │ ✅ Visible  │
                   └─────────────┴─────────────┘
```

#### Section "Paramètres"
```
Ordre d'affichage         Peut être fermée ?
┌──────────┐              ┌───────────────────────┐
│    1     │ (↑↓)         │ ☑ Oui (dismissible)   │
└──────────┘              └───────────────────────┘

Statut
● Active — la bannière est affichée dans l'app
○ Inactive — masquée, conservée pour réutilisation
```

### 4.3 Boutons d'action

```
                    [Annuler]   [Enregistrer et prévisualiser]   [Publier]
```

- **Annuler** → retour à la liste sans sauvegarder
- **Enregistrer** → `POST` ou `PATCH`, reste sur la page
- **Publier** → sauvegarde + active = true automatiquement

---

## 5. Prévisualisation Live

La carte de droite se met à jour **en temps réel** à chaque frappe dans le formulaire.

### 5.1 Rendu carte bannière

```
┌────────────────────────────────────────────┐
│ ████████████████████████████████████████  │  ← bg_color
│                                            │
│  ◉  Publiez vos biens facilement          │  ← icon + title
│     Ajoutez vos apparts en qlqs clics.    │  ← subtitle
│                                            │
│  [Démarrer]    [En savoir plus]  ✕         │  ← CTAs + dismissible
└────────────────────────────────────────────┘
```

### 5.2 Basculer entre les vues

```
Prévisualisation pour :  [📱 App Client]  [💼 App Pro]
```

> Permet au marketing de vérifier le rendu selon l'audience avant publication.

---

## 6. Modale de suppression

```
┌──────────────────────────────────────────────┐
│  ⚠️  Supprimer cette bannière ?              │
│                                              │
│  "Publiez vos biens facilement"              │
│  Cette action est irréversible.              │
│                                              │
│           [Annuler]   [Supprimer]            │
└──────────────────────────────────────────────┘
```

---

## 7. Appels API — Récapitulatif frontend

| Action | Méthode | Endpoint | Auth |
|--------|---------|----------|------|
| Charger la liste | `GET` | `/banners` | Non |
| Créer | `POST` | `/banners` | Admin |
| Modifier | `PATCH` | `/banners/:id` | Admin |
| Activer/Désactiver | `PATCH` | `/banners/:id` | Admin |
| Réordonner | `PATCH` | `/banners/:id` (× N) | Admin |
| Supprimer | `DELETE` | `/banners/:id` | Admin |
| Prévisualiser app client | `GET` | `/banners?source=customer_app` | Non |
| Prévisualiser app pro | `GET` | `/banners?source=pro_app` | Non |

---

## 8. Règles métier à respecter côté frontend

1. **Titre obligatoire** — bloquer la soumission si vide.
2. **Si `cta_url` est renseigné**, `cta_label` devient obligatoire (et vice-versa).
3. **Même règle** pour `cta2_url` / `cta2_label`.
4. **`bg_color`** doit être un code hex valide (`#RRGGBB`).
5. **`order`** doit être un entier ≥ 0.
6. **Après suppression** → retirer de la liste locale sans recharger la page (optimistic update).
7. **Le toggle actif/inactif** doit être instantané visuellement (optimistic), avec rollback si l'API échoue.
8. **Les bannières inactives** apparaissent grisées dans la liste.

---

## 9. États de la liste

| État | Affichage |
|------|-----------|
| Chargement | Skeleton 3 lignes |
| Liste vide | Illustration + "Aucune bannière. Créez-en une." + bouton |
| Erreur API | Toast rouge "Erreur de chargement" + bouton réessayer |
| Suppression réussie | Toast vert "Bannière supprimée" |
| Sauvegarde réussie | Toast vert "Bannière publiée" |

---

## 10. Exemple de données — réponse API

```json
{
  "data": [
    {
      "id": 1,
      "title": "Publiez vos biens facilement",
      "subtitle": "Ajoutez vos appartements en quelques clics.",
      "cta_label": "Démarrer",
      "cta_url": "/publisher/new",
      "cta2_label": null,
      "cta2_url": null,
      "icon": "plus-circle",
      "bg_color": "#5B3FE4",
      "type": "promo",
      "audience": "seller",
      "order": 1,
      "active": true,
      "dismissible": false,
      "created_at": "2026-05-12T10:00:00.000Z",
      "updated_at": "2026-05-12T10:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Votre réservation a été validée",
      "subtitle": "Effectue vite le paiement pour ne pas perdre ta réservation.",
      "cta_label": "Payer",
      "cta_url": "/reservations/45/payment",
      "cta2_label": "Annuler",
      "cta2_url": null,
      "icon": "calendar-check",
      "bg_color": "#1A5CFF",
      "type": "notification",
      "audience": "buyer",
      "order": 1,
      "active": true,
      "dismissible": true,
      "created_at": "2026-05-12T09:00:00.000Z",
      "updated_at": "2026-05-12T09:30:00.000Z"
    }
  ]
}
```
