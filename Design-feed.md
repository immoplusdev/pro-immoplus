# Endpoints admin — crédit de protection du client

Tous les endpoints sont relatifs à l’URL de base de l’API.

## 1. Lister les dossiers de protection

```http
GET /admin/payment-protection/reservations
Authorization: Bearer <ADMIN_TOKEN>
```

Filtres disponibles :

```http
GET /admin/payment-protection/reservations?protectionState=PROTECTABLE&clientId=<CLIENT_ID>&page=1&perPage=20
```

Utilité : trouver les réservations payées pouvant être restituées au client.

Valeurs de `protectionState` :

- `PROTECTABLE` : montant encaissé et encore restituable ;
- `PENDING_APPROVAL` : restitution en attente de seconde validation ;
- `FAILED` : restitution à relancer ;
- `RESOLVED` : tout a déjà été crédité ;
- `NOT_PAID` : aucun paiement encaissé.

Exemple de réponse :

```json
{
  "data": [
    {
      "reservationId": "<RESERVATION_ID>",
      "codeReservation": "RES-0001",
      "statusReservation": "valide",
      "statusFacture": "paye",
      "dateDebut": "2026-11-15T00:00:00.000Z",
      "dateFin": "2026-11-18T00:00:00.000Z",
      "residence": {
        "id": "<RESIDENCE_ID>",
        "nom": "Résidence Cocody"
      },
      "client": {
        "id": "<CLIENT_ID>",
        "firstName": "Jean",
        "lastName": "D.",
        "phoneNumber": "07 •• •• •• 12",
        "email": "j•••@email.com",
        "masked": true
      },
      "capturedAmount": 150000,
      "creditedAmount": 0,
      "pendingApprovalAmount": 0,
      "protectableAmount": 150000,
      "currency": "XOF",
      "protectionState": "PROTECTABLE"
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 1
  }
}
```

Les informations client sont masquées pour les rôles qui ne disposent pas du droit de révélation.

## 2. Consulter le dossier complet

```http
GET /admin/payment-protection/reservations/<RESERVATION_ID>
Authorization: Bearer <ADMIN_TOKEN>
```

Utilité : consulter avant décision :

- la réservation ;
- le client ;
- la résidence ;
- les paiements encaissés ;
- les exigences de paiement ;
- les résolutions déjà créées ;
- les transactions du coffre ;
- l’audit.

Exemple de structure :

```json
{
  "data": {
    "reservation": {
      "reservationId": "<RESERVATION_ID>",
      "codeReservation": "RES-0001",
      "residence": {
        "id": "<RESIDENCE_ID>",
        "nom": "Résidence Cocody"
      },
      "client": {
        "id": "<CLIENT_ID>",
        "firstName": "Jean",
        "lastName": "Dupont",
        "phoneNumber": "+2250700000012",
        "email": "jean@example.com",
        "masked": false
      },
      "capturedAmount": 150000,
      "creditedAmount": 0,
      "pendingApprovalAmount": 0,
      "protectableAmount": 150000,
      "protectionState": "PROTECTABLE"
    },
    "payments": [
      {
        "id": "<PAYMENT_ID>",
        "amount": 150000,
        "paymentMethod": "WAVE",
        "paymentStatus": "successful",
        "customerId": "<CLIENT_ID>",
        "createdAt": "2026-11-09T10:00:00.000Z"
      }
    ],
    "resolutions": [],
    "walletTransactions": [],
    "audit": []
  }
}
```

## 3. Créer une restitution au coffre du client

```http
POST /admin/payment-protection/reservations/<RESERVATION_ID>/resolutions
Authorization: Bearer <ADMIN_TOKEN>
Idempotency-Key: protection-<RESERVATION_ID>-001
X-Correlation-Id: <OPTIONAL_CORRELATION_ID>
Content-Type: application/json
```

Payload :

```json
{
  "reason": "OWNER_CANCELLED_AFTER_CAPTURE",
  "destination": "WALLET",
  "note": "Le propriétaire a annulé après confirmation."
}
```

`amount` peut être omis. Dans ce cas, le serveur crédite tout le montant protégeable.

Motifs acceptés :

- `OWNER_CANCELLED_AFTER_CAPTURE`
- `ADMIN_CANCELLED_AFTER_CAPTURE`
- `AVAILABILITY_LOST`
- `DISPUTE_RESOLVED_FOR_CLIENT`

Utilité : créditer le coffre du client avec 100 % du montant encaissé encore protégeable.

Réponse après crédit immédiat :

```json
{
  "data": {
    "resolutionId": "<RESOLUTION_ID>",
    "reservationId": "<RESERVATION_ID>",
    "paymentId": "<PAYMENT_ID>",
    "status": "COMPLETED",
    "amount": 150000,
    "currency": "XOF",
    "destination": "WALLET",
    "walletTransactionId": "<WALLET_TRANSACTION_ID>",
    "remainingProtectableAmount": 0,
    "proFundsRecoveryRequired": false,
    "replayed": false
  }
}
```

Ne pas utiliser `POST /wallet/admin/credit` pour une protection client.

## 4. Valider une restitution en attente

Une restitution supérieure à 100 000 XOF reste en `PENDING_APPROVAL`.

```http
POST /admin/payment-protection/resolutions/<RESOLUTION_ID>/approve
Authorization: Bearer <SECOND_ADMIN_OR_FINANCE_TOKEN>
X-Correlation-Id: <OPTIONAL_CORRELATION_ID>
Content-Type: application/json
```

Payload :

```json
{
  "note": "Montant vérifié avec le relevé du paiement."
}
```

Utilité : effectuer la seconde validation et exécuter le crédit réservé au coffre du client.

La seconde personne doit avoir un rôle différent du demandeur :

- demande Admin → validation Finance ;
- demande Finance → validation Admin.

## 5. Rejeter une restitution en attente

```http
POST /admin/payment-protection/resolutions/<RESOLUTION_ID>/reject
Authorization: Bearer <SECOND_ADMIN_OR_FINANCE_TOKEN>
X-Correlation-Id: <OPTIONAL_CORRELATION_ID>
Content-Type: application/json
```

Payload :

```json
{
  "note": "Dossier rejeté après vérification."
}
```

Utilité : rejeter la restitution. Aucun crédit n’est effectué et le montant redevient protégeable.

## 6. Relancer une restitution échouée

```http
POST /admin/payment-protection/resolutions/<RESOLUTION_ID>/retry
Authorization: Bearer <ADMIN_TOKEN>
X-Correlation-Id: <OPTIONAL_CORRELATION_ID>
```

Utilité : relancer uniquement une résolution au statut `FAILED`.

## 7. Vérifier le coffre du client

Après une résolution `COMPLETED`, l’admin ou le client peut vérifier le crédit :

```http
GET /wallet/admin/user-wallet/<CLIENT_ID>
Authorization: Bearer <ADMIN_TOKEN>
```

Pour le client connecté :

```http
GET /wallet/my-wallet
Authorization: Bearer <CLIENT_TOKEN>
```

Historique :

```http
GET /wallet/my-transactions
Authorization: Bearer <CLIENT_TOKEN>
```

## Informations sur le propriétaire

Le dossier de protection retourne actuellement :

- la résidence ;
- le client ;
- les paiements ;
- les résolutions ;
- les transactions liées ;
- l’audit.

Le propriétaire de la résidence n’est pas actuellement inclus directement dans la réponse du dossier de protection. Si le dashboard doit afficher son nom, téléphone ou identifiant, il faut ajouter ces champs au endpoint de détail ou effectuer un appel complémentaire avec l’identifiant de la résidence.
