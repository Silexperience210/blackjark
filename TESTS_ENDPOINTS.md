# 🧪 Tests des Endpoints - BlackjARK

## 🎯 Objectif

Vérifier que tous les endpoints fonctionnent correctement et sont cohérents entre eux.

---

## ⚙️ Setup

```bash
# 1. Variables d'environnement
cat > .env << EOF
ASP_URL=https://api.second.tech
ASP_API_KEY=sk_test_...
ADMIN_KEY=admin_test_123
EOF

# 2. Lancer serveur
vercel dev

# 3. Ouvrir http://localhost:3000
```

---

## 🔄 Flow complet à tester

### 1. Créer session

```bash
curl http://localhost:3000/api/session \
  -c cookies.txt \
  -v

# Vérifier réponse:
{
  "sessionId": "session_...",
  "balance": 0,
  "totalDeposited": 0,
  "totalWithdrawn": 0,
  "gamesPlayed": 0
}

# Vérifier cookie: session_id=...
```

**✅ Success criteria:**
- Status 200
- Cookie `session_id` présent
- Balance = 0

---

### 2. Créer dépôt

```bash
curl -X POST http://localhost:3000/api/deposit \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"amount":1000}' \
  | jq

# Vérifier réponse:
{
  "depositId": "deposit_1234567890_abc",
  "aspId": "addr_...",              # ← IMPORTANT
  "arkAddress": "ark1q...",
  "amount": 1000,
  "expiresAt": 1234567890,
  "message": "...ASP...",
  "qrCode": "ark:ark1q...?amount=1000"
}
```

**✅ Success criteria:**
- Status 200
- `aspId` présent (pas null/undefined)
- `arkAddress` commence par "ark1q"
- `qrCode` contient l'adresse

**❌ Erreurs possibles:**
- 401: Cookie manquant → relancer étape 1
- 400: Montant invalide → vérifier 100-10000
- 500: ASP_API_KEY invalide → vérifier .env

---

### 3. Vérifier paiement (avant paiement)

```bash
# Récupérer depositId de l'étape précédente
DEPOSIT_ID="deposit_1234567890_abc"

curl http://localhost:3000/api/check-payment/$DEPOSIT_ID \
  -b cookies.txt \
  | jq

# Vérifier réponse:
{
  "paid": false,
  "status": "pending",
  "message": "En attente de réception vTXO ARK"
}
```

**✅ Success criteria:**
- Status 200
- `paid: false`

---

### 4. Simuler paiement (pour test)

**Option A : Utiliser ArkSat wallet (si configuré)**
1. Ouvrir ArkSat
2. Scanner QR code
3. Envoyer 1000 sats

**Option B : Appeler directement l'ASP (dev uniquement)**

```bash
# Si ASP local (ArkadeOS)
curl -X POST http://localhost:8080/v1/transfer \
  -H "Authorization: Bearer $ASP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ark1q...",
    "amount": 1000
  }'
```

---

### 5. Vérifier paiement (après paiement)

```bash
curl http://localhost:3000/api/check-payment/$DEPOSIT_ID \
  -b cookies.txt \
  | jq

# Vérifier réponse:
{
  "paid": true,
  "amount": 1000,
  "newBalance": 1000,
  "vtxoIds": ["vtxo_..."],        # ← IMPORTANT (pluriel)
  "instant": true,
  "vtxosReceived": 1
}
```

**✅ Success criteria:**
- Status 200
- `paid: true`
- `vtxoIds` est un array
- `newBalance: 1000`

---

### 6. Vérifier balance

```bash
curl http://localhost:3000/api/balance \
  -b cookies.txt \
  | jq

# Vérifier réponse:
{
  "balance": 1000,
  "totalDeposited": 1000,
  "totalWithdrawn": 0,
  "gamesPlayed": 0,
  "aspVtxos": ["vtxo_..."]        # ← IMPORTANT
}
```

**✅ Success criteria:**
- `balance: 1000`
- `aspVtxos` contient au moins 1 ID

---

### 7. Jouer (gagner)

```bash
curl -X POST http://localhost:3000/api/game \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "bet": 100,
    "playerHand": [10, 11],
    "dealerHand": [10, 5],
    "result": "win"
  }' \
  | jq

# Vérifier réponse:
{
  "success": true,
  "result": "win",
  "bet": 100,
  "balanceChange": 100,
  "newBalance": 1100,
  "playerHand": [10, 11],
  "dealerHand": [10, 5]
}
```

**✅ Success criteria:**
- `newBalance: 1100`
- `balanceChange: +100`

---

### 8. Jouer (perdre)

```bash
curl -X POST http://localhost:3000/api/game \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "bet": 100,
    "playerHand": [10, 5],
    "dealerHand": [10, 11],
    "result": "lose"
  }' \
  | jq

# Vérifier réponse:
{
  "success": true,
  "result": "lose",
  "bet": 100,
  "balanceChange": -100,
  "newBalance": 1000
}
```

**✅ Success criteria:**
- `newBalance: 1000`
- `balanceChange: -100`

---

### 9. Retrait

```bash
curl -X POST http://localhost:3000/api/withdraw \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "arkAddress": "ark1qtest123...",
    "amount": 800
  }' \
  | jq

# Vérifier réponse:
{
  "success": true,
  "txId": "tx_...",
  "amount": 800,
  "destination": "ark1qtest123...",
  "newBalance": 200,
  "status": "confirmed",
  "instant": true,
  "message": "Retrait ARK confirmé instantanément !"
}
```

**✅ Success criteria:**
- Status 200
- `newBalance: 200`
- `instant: true`

**❌ Erreurs possibles:**
- 400: Adresse invalide → vérifier format ark1q
- 400: Balance insuffisante
- 400: Aucun vTXO disponible

---

### 10. Stats admin

```bash
curl http://localhost:3000/api/admin/casino-stats \
  -H "X-Admin-Key: admin_test_123" \
  | jq

# Vérifier réponse:
{
  "timestamp": "2025-02-03T...",
  "casino": {
    "asp": {
      "balance": 50000,
      "vtxoCount": 5,
      "provider": "https://api.second.tech",
      "averageVtxoSize": 10000
    },
    "health": {
      "healthy": true,
      "coverageRatio": "250.00",
      "warning": null,
      "critical": null
    }
  },
  "players": {
    "totalBalance": 200,
    "activeCount": 1,
    "averageBalance": 200
  },
  "metrics": {
    "coverageRatio": "250.00",
    "liquidity": 49800,
    "status": "✅ Healthy"
  }
}
```

**✅ Success criteria:**
- `casino.asp.provider` = URL ASP
- `casino.health.healthy: true`
- `players.totalBalance` = somme des balances

---

## 🧪 Tests automatisés

### Script de test complet

```bash
#!/bin/bash
# test-flow.sh

echo "🧪 Testing BlackjARK endpoints..."

# 1. Session
echo "1️⃣ Creating session..."
SESSION=$(curl -s http://localhost:3000/api/session -c cookies.txt)
echo $SESSION | jq

# 2. Deposit
echo "2️⃣ Creating deposit..."
DEPOSIT=$(curl -s -X POST http://localhost:3000/api/deposit \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"amount":1000}')
echo $DEPOSIT | jq

DEPOSIT_ID=$(echo $DEPOSIT | jq -r '.depositId')
ASP_ID=$(echo $DEPOSIT | jq -r '.aspId')

echo "DepositID: $DEPOSIT_ID"
echo "AspID: $ASP_ID"

if [ "$ASP_ID" = "null" ]; then
  echo "❌ FAIL: aspId is null!"
  exit 1
fi

# 3. Check payment (pending)
echo "3️⃣ Checking payment (should be pending)..."
CHECK1=$(curl -s http://localhost:3000/api/check-payment/$DEPOSIT_ID -b cookies.txt)
echo $CHECK1 | jq

PAID=$(echo $CHECK1 | jq -r '.paid')
if [ "$PAID" = "true" ]; then
  echo "❌ FAIL: Payment should be pending!"
  exit 1
fi

# 4. Simulate payment (manual step)
echo "⏸️  PAUSE: Send vTXOs to address in ArkSat wallet"
echo "Press Enter when done..."
read

# 5. Check payment (completed)
echo "5️⃣ Checking payment (should be completed)..."
CHECK2=$(curl -s http://localhost:3000/api/check-payment/$DEPOSIT_ID -b cookies.txt)
echo $CHECK2 | jq

PAID=$(echo $CHECK2 | jq -r '.paid')
if [ "$PAID" != "true" ]; then
  echo "❌ FAIL: Payment should be completed!"
  exit 1
fi

# 6. Balance
echo "6️⃣ Checking balance..."
BALANCE=$(curl -s http://localhost:3000/api/balance -b cookies.txt)
echo $BALANCE | jq

BAL=$(echo $BALANCE | jq -r '.balance')
if [ "$BAL" != "1000" ]; then
  echo "❌ FAIL: Balance should be 1000, got $BAL"
  exit 1
fi

# 7. Game
echo "7️⃣ Playing game..."
GAME=$(curl -s -X POST http://localhost:3000/api/game \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"bet":100,"result":"win"}')
echo $GAME | jq

# 8. Withdraw
echo "8️⃣ Withdrawing..."
WITHDRAW=$(curl -s -X POST http://localhost:3000/api/withdraw \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"arkAddress":"ark1qtest123","amount":800}')
echo $WITHDRAW | jq

# 9. Stats
echo "9️⃣ Checking admin stats..."
STATS=$(curl -s http://localhost:3000/api/admin/casino-stats)
echo $STATS | jq

echo "✅ All tests passed!"
```

### Lancer les tests

```bash
chmod +x test-flow.sh
./test-flow.sh
```

---

## 📋 Checklist de vérification

### Endpoints

- [ ] `/api/session` - Crée session avec cookie
- [ ] `/api/deposit` - Retourne `aspId` + `arkAddress`
- [ ] `/api/check-payment/[depositId]` - Vérifie vTXOs
- [ ] `/api/balance` - Affiche `aspVtxos`
- [ ] `/api/game` - Met à jour balance
- [ ] `/api/withdraw` - Transfert ASP réussit
- [ ] `/api/admin/casino-stats` - Stats ASP

### Cohérence des données

- [ ] `deposit.aspId` sauvegardé dans KV
- [ ] `player.aspVtxos` contient IDs vTXOs
- [ ] `vtxoIds` (pluriel) dans réponse check-payment
- [ ] Balance cohérente après chaque opération
- [ ] Stats admin affichent provider ASP

### Messages

- [ ] Dépôt mentionne "ASP"
- [ ] Retrait mentionne "instantané"
- [ ] Pas de référence à "seed" ou "wallet casino"

---

## 🐛 Débogage

### Si deposit.aspId est null

1. Vérifier `ASP_API_KEY` dans .env
2. Vérifier `ASP_URL` accessible
3. Tester ASP directement:
   ```bash
   curl $ASP_URL/v1/ping \
     -H "Authorization: Bearer $ASP_API_KEY"
   ```

### Si check-payment ne détecte jamais le paiement

1. Vérifier que vTXOs sont envoyés à la bonne adresse
2. Vérifier logs ASP
3. Tester manuellement:
   ```bash
   curl $ASP_URL/v1/address/addr_abc/vtxos \
     -H "Authorization: Bearer $ASP_API_KEY"
   ```

### Si withdraw échoue

1. Vérifier `player.aspVtxos` contient des IDs
2. Vérifier balance suffisante
3. Vérifier format adresse (ark1q...)

---

**⚡ Une fois tous les tests passent, l'architecture est validée !**
