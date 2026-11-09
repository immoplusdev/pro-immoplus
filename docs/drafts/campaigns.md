# Dashboard — Ciblage d'audience des campagnes

> Référence rapide pour l'équipe dashboard : comment construire le sélecteur d'audience (tout / pros / clients / client(s) spécifique(s)) et quels endpoints appeler. Pour le détail complet du module (templates, tags, statuts, BullMQ...), voir [CAMPAGNES-PUSH-WHATSAPP.md](./CAMPAGNES-PUSH-WHATSAPP.md).

Toutes les routes ci-dessous exigent un header `Authorization: Bearer <token_admin>` (rôle `Admin`).

---

`recipientIds` attend des **IDs utilisateur** (`users.id`), pas des numéros de téléphone — utilisez la recherche client/pro déjà existante côté dashboard pour construire cette liste.

---

## 1. Lister les templates disponibles

**Description** : récupère les templates WhatsApp/Push déjà approuvés par le provider, pour peupler le sélecteur de template.

**Endpoint**
```
GET /admin/campaign-templates?canal=whatsapp&cible=customer_app
```
`canal` (`whatsapp`|`push`) et `cible` (`customer_app`|`pro_app`) sont optionnels (filtres).

**Payload** : aucun (query params seulement).

**Réponse**
```jsonc
{
  "data": {
    "templates": [
      { "templateId": "tmpl_a1b2c3", "nom": "relance_client_inactif_fr", "variables": ["1", "2"] }
    ]
  }
}
```

---

## 2. Lister les tags de personnalisation

**Description** : liste les variables (`{{prenom}}`, `{{scoreGlobal}}`...) disponibles pour mapper aux positions du template choisi.

**Endpoint**
```
GET /admin/campaign-templates/tags?cible=customer_app
```

**Payload** : aucun.

**Réponse**
```jsonc
{
  "data": {
    "tags": [
      { "tag": "{{prenom}}", "priorite": "indispensable", "type": "db_field" }
    ]
  }
}
```

---

## 3. Créer une campagne (brouillon)

**Description** : crée la campagne en brouillon et calcule `audience` (nombre de destinataires) à partir du ciblage choisi. N'envoie rien.

**Endpoint**
```
POST /admin/campaigns
```

**Payload — "Tous" (pros ou clients, aucun filtre)**
```jsonc
{
  "canal": "whatsapp",
  "cible": "customer_app",           // ou "pro_app"
  "templateId": "tmpl_a1b2c3",
  "mappingVariables": { "1": "{{prenom}}" },
  "audience": {}
}
```

**Payload — Segment (filtre)**
```jsonc
{
  "canal": "whatsapp",
  "cible": "customer_app",
  "templateId": "tmpl_a1b2c3",
  "mappingVariables": { "1": "{{prenom}}" },
  "audience": { "filtre": { "segment": "occasionnel" } }
}
```
Champs de filtre autorisés : `segment`, `niveauRisque` (customer_app) ; `statutCertification`, `badgeCertification` (pro_app). Toute autre clé → `400`.

**Payload — Sélection manuelle (un ou plusieurs clients/pros précis)**
```jsonc
{
  "canal": "whatsapp",
  "cible": "customer_app",
  "templateId": "tmpl_a1b2c3",
  "mappingVariables": { "1": "{{prenom}}" },
  "audience": { "recipientIds": ["c8a1f2e0-1234-4a1b-9c2d-abcdef123456"] }
}
```
`recipientIds` : tableau d'IDs `users`, 1 à 5000. Prioritaire sur `filtre` si les deux sont fournis.

**Champ optionnel commun aux 3** : `"planifieLe": "2026-09-05T08:00:00.000Z"` — si fourni, la campagne passe en `planifiee` et sera envoyée automatiquement par le scheduler interne à cette date, sans rappeler `/send`.

**Réponse**
```jsonc
{
  "data": {
    "campagneId": "camp-2044",
    "canal": "whatsapp",
    "cible": "customer_app",
    "templateId": "tmpl_a1b2c3",
    "statut": "brouillon",
    "audience": 2            // nombre réel de destinataires résolus
  }
}
```
`audience` permet d'afficher tout de suite "2 destinataires" (ou "340 destinataires") dans le dashboard avant l'envoi.

---

## 4. Prévisualiser le message

**Description** : rend le texte du template sur un petit échantillon de l'audience réelle (3 par défaut), sans rien envoyer. Utile pour un bouton "Aperçu" avant confirmation.

**Endpoint**
```
POST /admin/campaigns/:campagneId/preview
```

**Payload** (optionnel — requis seulement si le mapping référence un tag "fixe", ex. une date)
```jsonc
{ "variablesFixes": { "dateAujourdhui": "31/08/2026" } }
```

**Réponse**
```jsonc
{
  "data": {
    "echantillon": [
      { "clientId": "c8a1f2e0-...", "apercuMessage": "Bonjour Marc, ça fait 45 jours..." }
    ]
  }
}
```

---

## 5. Envoyer la campagne

**Description** : déclenche l'envoi réel à toute l'audience résolue (le ciblage choisi à l'étape 3 est ré-exécuté à l'instant T, pas figé depuis la création). Bloqué (`409`) si déjà envoyée.

**Endpoint**
```
POST /admin/campaigns/:campagneId/send
```

**Payload** (optionnel — requis si tag "fixe" référencé, sinon `400`)
```jsonc
{ "variablesFixes": { "dateAujourdhui": "31/08/2026" } }
```

**Réponse**
```jsonc
{ "data": { "campagneId": "camp-2044", "statut": "en_cours", "audience": 2 } }
```

---

## 6. Suivre l'avancement de l'envoi

**Description** : à poller depuis le dashboard pour afficher une barre de progression (envoyés / échecs / en attente).

**Endpoint**
```
GET /admin/campaigns/:campagneId
```

**Payload** : aucun.

**Réponse**
```jsonc
{ "data": { "campagneId": "camp-2044", "statut": "en_cours", "envoyes": 1, "echecs": 0, "enAttente": 1 } }
```
`statut` passe à `terminee` automatiquement quand `enAttente` atteint 0.

---

## Résumé du flux dashboard

```
1. GET  /admin/campaign-templates?canal=...&cible=...   → choix du template
2. GET  /admin/campaign-templates/tags?cible=...         → mapping des variables
3. Sélecteur d'audience dans l'UI :
     ○ Tous              → audience: {}
     ○ Segment            → audience: { filtre: {...} }
     ○ Client(s) précis   → audience: { recipientIds: [...] }   (recherche existante du dashboard)
4. POST /admin/campaigns                                  → brouillon + audience count
5. POST /admin/campaigns/:id/preview  (optionnel)          → aperçu message
6. POST /admin/campaigns/:id/send                          → envoi réel
7. GET  /admin/campaigns/:id  (polling)                     → progression
```
