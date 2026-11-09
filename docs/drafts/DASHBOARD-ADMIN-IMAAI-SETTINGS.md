# Dashboard admin — Réglages IMAAI (pulse du matin, auto-block, modèle Claude)

Permet à un admin de modifier, sans redéploiement :

- l'**heure d'envoi du pulse du matin** (template WhatsApp « disponibilité du matin » envoyé aux propriétaires pros) ;
- l'**heure du blocage automatique** des résidences dont le propriétaire n'a pas répondu ;
- le **modèle Claude** qui interprète les réponses WhatsApp des propriétaires.

Valeurs par défaut (celles d'avant la configuration) : pulse `08:00`, auto-block `13:00`, modèle `claude-haiku-4-5-20251001`.

> **Activation ≠ réglages.** Ces endpoints ne règlent pas l'activation de la fonctionnalité. Elle reste pilotée par les variables d'environnement `IMAAI` (réponses des propriétaires) et `IMAAI_MORNING_PULSE` (pulse + auto-block). Si `IMAAI_MORNING_PULSE=false`, rien n'est envoyé quelles que soient les heures configurées.

## Authentification

Header `Authorization: Bearer <JWT>` — rôle **Administrateur** requis.

| Code | Cas |
|------|-----|
| 401 | Token JWT manquant ou invalide |
| 403 | L'utilisateur n'est pas Administrateur |

---

## GET `/admin/imaai-settings`

Retourne les réglages actifs et la liste des modèles sélectionnables.

**Réponse 200**

```json
{
  "data": {
    "morningPulseTime": "08:00",
    "autoBlockTime": "13:00",
    "claudeModel": "claude-haiku-4-5-20251001",
    "availableModels": [
      "claude-haiku-4-5-20251001",
      "claude-sonnet-5-5",
      "claude-opus-5-5",
      "claude-fable-5-1"
    ]
  }
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `morningPulseTime` | string `HH:mm` | Heure d'envoi du pulse, fuseau **Africa/Abidjan** (UTC+0) |
| `autoBlockTime` | string `HH:mm` | Heure du blocage auto des résidences sans réponse, fuseau Africa/Abidjan |
| `claudeModel` | string | Modèle Claude actuellement utilisé |
| `availableModels` | string[] | Valeurs acceptées pour `claudeModel` (à utiliser pour peupler un select) |

---

## PUT `/admin/imaai-settings`

Mise à jour **partielle** : seuls les champs envoyés sont modifiés, les autres gardent leur valeur. Les trois champs sont optionnels.

**Corps**

```json
{
  "morningPulseTime": "07:30",
  "autoBlockTime": "12:00",
  "claudeModel": "claude-sonnet-5-5"
}
```

| Champ | Type | Règle |
|-------|------|-------|
| `morningPulseTime` | string | Format `HH:mm` (`00:00` → `23:59`) |
| `autoBlockTime` | string | Format `HH:mm`, doit être **strictement après** `morningPulseTime` (la valeur finale, après fusion avec l'existant) |
| `claudeModel` | string | Une des valeurs de `availableModels` |

**Réponse 200** — mêmes champs que le GET, avec les valeurs mises à jour :

```json
{
  "data": {
    "morningPulseTime": "07:30",
    "autoBlockTime": "12:00",
    "claudeModel": "claude-sonnet-5-5",
    "availableModels": [
      "claude-haiku-4-5-20251001",
      "claude-sonnet-5-5",
      "claude-opus-5-5",
      "claude-fable-5-1"
    ]
  }
}
```

### Exemples de payloads partiels

Changer uniquement le modèle :

```json
{ "claudeModel": "claude-opus-5-5" }
```

Changer uniquement l'heure du pulse (l'auto-block existant doit rester après) :

```json
{ "morningPulseTime": "09:15" }
```

### Erreurs

| Code | Cas | Exemple de `message` |
|------|-----|----------------------|
| 400 | Format d'heure invalide ou modèle absent de la liste (validation du DTO) | `morningPulseTime doit être au format HH:mm` |
| 409 | `autoBlockTime` <= `morningPulseTime` après fusion | `L'heure de blocage automatique doit être strictement après l'heure d'envoi du pulse du matin.` |
| 409 | Modèle non autorisé (cas d'un modèle passé hors DTO) | `Modèle Claude non autorisé. Valeurs possibles : …` |

Format d'erreur standard de l'API :

```json
{
  "statusCode": 409,
  "message": "L'heure de blocage automatique doit être strictement après l'heure d'envoi du pulse du matin.",
  "error": "Error",
  "timestamp": "2026-10-01T09:00:00.000Z",
  "path": "/admin/imaai-settings"
}
```

---

## Quand les changements prennent effet

- **Heures** : le scheduler compare l'heure courante (Africa/Abidjan) à celles en base **chaque minute**. Le changement est pris en compte dans la minute (jusqu'à 30 s de cache mémoire par instance de l'API en plus).
- **Heure déjà passée aujourd'hui** : si tu règles `morningPulseTime` sur une heure déjà écoulée, le pulse ne part que **le lendemain**.
- **Modèle Claude** : appliqué dès le prochain message interprété (cache de 30 s au plus).

## Comportement du pulse et de l'auto-block (rappel)

- **Pulse** : envoyé à tous les propriétaires **Pro** (Particulier ou Entreprise) ayant au moins une résidence **validée** et un numéro (WhatsApp vérifié, sinon téléphone), sauf s'ils ont déjà une session active. Un seul message par propriétaire.
- **Auto-block** : à l'heure configurée, les sessions du matin restées sans réponse bloquent **la résidence suivie par la session** pour la journée, et le propriétaire est prévenu. Il peut répondre *OUI* pour débloquer.

## Aide-mémoire pour le front

- Peupler le sélecteur de modèle avec `availableModels` (ne pas coder la liste en dur).
- Valider côté UI que `autoBlockTime > morningPulseTime` avant d'envoyer le PUT.
- Afficher le fuseau « Africa/Abidjan (UTC+0) » à côté des champs d'heure.
- Envoyer uniquement les champs modifiés.

## Mise en place (backend)

- Table `imaai_settings` (ligne unique `id = 1`), créée et initialisée par la migration `1789500000000-CreateImaaiSettings` — **à exécuter avant d'utiliser l'endpoint**. Sans elle, les valeurs par défaut s'appliquent mais les modifications ne sont pas persistées.
- Code : `src/infrastructure/features/availability/imaai-settings.*`.
