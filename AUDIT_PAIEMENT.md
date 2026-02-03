# 🔍 AUDIT - Logique de Paiement BlackjARK

## ❌ PROBLÈMES IDENTIFIÉS

### 1. Imports incohérents

**Fichier : `deposit.js`**
```javascript
const ArkClient = require('./ark-client');        // ❌ OBSOLÈTE
const CasinoWallet = require('./casino-wallet');  // ❌ OBSOLÈTE
```

**Devrait être :**
```javascript
const ASPClient = require('./asp-client');  // ✅ Utiliser ASP
```

---

### 2. Fichier check-payment avec mauvais nom

**Actuel :** `api/check-payment/[address].js`  
**Devrait être :** `api/check-payment/[depositId].js`

Car deposit.js retourne `depositId`, pas `address` !

---

### 3. Incohérence frontend ↔ backend

**Frontend appelle :**
```javascript
fetch(`/api/check-payment/${data.depositId}`)  // ✅
```

**Mais le fichier s'appelle :**
```
api/check-payment/[address].js  // ❌ Mauvais nom !
```

---

### 4. Clients multiples obsolètes

Actuellement on a :
- `ark-client.js` (obsolète)
- `casino-wallet.js` (obsolète)
- `asp-client.js` (le bon !)

Il faut utiliser **UNIQUEMENT** `asp-client.js`

---

## ✅ FLOW CORRECT

### Dépôt (Deposit Flow)

```
1. Frontend → POST /api/deposit
   Body: { amount: 1000 }

2. Backend (deposit.js)
   a. Vérifier session & joueur
   b. ASPClient.createDepositAddress(label)
      → Retour ASP: { address: "ark1q...", aspId: "addr_123" }
   c. Sauvegarder dans KV:
      deposit:deposit_123 = {
        depositId: "deposit_123",
        aspId: "addr_123",
        arkAddress: "ark1q...",
        amount: 1000,
        status: "pending"
      }
   d. Retourner au frontend:
      {
        depositId: "deposit_123",
        arkAddress: "ark1q...",
        qrCode: "ark:ark1q...?amount=1000"
      }

3. Frontend → Polling /api/check-payment/deposit_123
   (toutes les 3 secondes)

4. Backend (check-payment/[depositId].js)
   a. Récupérer deposit depuis KV
   b. ASPClient.getAddressVTXOs(deposit.aspId)
      → Retour ASP: [{ id: "vtxo_xyz", amount: 1000 }]
   c. Si vTXOs reçus:
      - player.balance += 1000
      - player.aspVtxos.push("vtxo_xyz")
      - deposit.status = "completed"
   d. Retourner:
      {
        paid: true,
        amount: 1000,
        vtxoId: "vtxo_xyz"
      }
```

---

### Retrait (Withdrawal Flow)

```
1. Frontend → POST /api/withdraw
   Body: { 
     arkAddress: "ark1qbob...",
     amount: 800
   }

2. Backend (withdraw.js)
   a. Vérifier session & joueur
   b. Vérifier balance: player.balance >= 800
   c. ASPClient.getCasinoBalance()
      → Vérifier liquidité ASP
   d. Sélectionner vTXO à dépenser:
      vtxoId = player.aspVtxos[0]
   e. ASPClient.createTransfer(vtxoId, arkAddress, 800)
      → Retour ASP: { txId: "tx_123", status: "confirmed" }
   f. Mettre à jour:
      - player.balance -= 800
      - player.aspVtxos = player.aspVtxos.filter(id => id !== vtxoId)
   g. Retourner:
      {
        txId: "tx_123",
        status: "confirmed",
        instant: true
      }
```

---

### Jeu (Game Flow)

```
1. Frontend → POST /api/game
   Body: { bet: 100, result: "win" }

2. Backend (game.js)
   a. Vérifier balance: player.balance >= 100
   b. Calculer résultat:
      - win: balanceChange = +100
      - lose: balanceChange = -100
      - push: balanceChange = 0
   c. Mettre à jour:
      player.balance += balanceChange
      player.gamesPlayed++
   d. Retourner:
      {
        success: true,
        balanceChange: 100,
        newBalance: 1100
      }

Note: Pas d'appel ASP pour chaque partie !
On gère juste la comptabilité locale.
```

---

## 📋 ENDPOINTS À VÉRIFIER

### ✅ Endpoints corrects

| Endpoint | Method | Frontend | Backend | Status |
|----------|--------|----------|---------|--------|
| `/api/session` | GET | ✅ | ✅ | OK |
| `/api/deposit` | POST | ✅ | ⚠️ Utilise vieux clients | À CORRIGER |
| `/api/balance` | GET | ✅ | ✅ | OK |
| `/api/game` | POST | ✅ | ✅ | OK |

### ❌ Endpoints avec problèmes

| Endpoint | Problème | Solution |
|----------|----------|----------|
| `/api/check-payment/[depositId]` | Nom fichier: `[address].js` | Renommer en `[depositId].js` |
| `/api/withdraw` | Utilise vieux clients | Utiliser ASPClient |
| `/api/admin/casino-stats` | Utilise CasinoWallet | Utiliser ASPClient |

---

## 🔧 CORRECTIONS NÉCESSAIRES

### 1. Renommer check-payment

```bash
mv api/check-payment/[address].js api/check-payment/[depositId].js
```

### 2. Modifier deposit.js

```javascript
// AVANT
const ArkClient = require('./ark-client');
const CasinoWallet = require('./casino-wallet');
const arkClient = new ArkClient();
const casinoWallet = new CasinoWallet(arkClient, kv);

// APRÈS
const ASPClient = require('./asp-client');
const asp = new ASPClient();
```

### 3. Modifier check-payment/[depositId].js

```javascript
// AVANT
const arkClient = new ArkClient();
const casinoWallet = new CasinoWallet(arkClient, kv);
await casinoWallet.checkReceivedVTXOs(deposit.arkAddress);

// APRÈS
const asp = new ASPClient();
const vtxos = await asp.getAddressVTXOs(deposit.aspId);
```

### 4. Modifier withdraw.js

```javascript
// AVANT
const arkClient = new ArkClient();
const casinoWallet = new CasinoWallet(arkClient, kv);
await casinoWallet.createWithdrawal(...);

// APRÈS
const asp = new ASPClient();
const tx = await asp.createTransfer(vtxoId, arkAddress, amount);
```

### 5. Modifier admin/casino-stats.js

```javascript
// AVANT
const casinoWallet = new CasinoWallet(arkClient, kv);
await casinoWallet.loadFromKV();

// APRÈS
const asp = new ASPClient();
const { balance, vtxos } = await asp.getCasinoBalance();
```

---

## 🗑️ FICHIERS À SUPPRIMER

- ❌ `api/ark-client.js` (obsolète)
- ❌ `api/casino-wallet.js` (obsolète)

---

## 📊 STRUCTURE KV CORRECTE

### Joueur

```javascript
player:session_abc123 = {
  sessionId: "session_abc123",
  balance: 1000,              // Comptabilité locale
  totalDeposited: 2000,
  totalWithdrawn: 500,
  gamesPlayed: 42,
  aspVtxos: [                 // vTXOs gérés par l'ASP
    "vtxo_xyz",
    "vtxo_abc"
  ],
  pendingDeposits: [
    {
      depositId: "deposit_123",
      aspId: "addr_abc",
      arkAddress: "ark1q...",
      amount: 1000,
      createdAt: 1234567890
    }
  ]
}
```

### Dépôt

```javascript
deposit:deposit_123 = {
  depositId: "deposit_123",
  aspId: "addr_abc",          // ID retourné par l'ASP
  arkAddress: "ark1q...",     // Adresse générée par l'ASP
  sessionId: "session_abc123",
  amount: 1000,
  status: "pending",          // ou "completed"
  createdAt: 1234567890,
  expiresAt: 1234567890,
  completedAt: 1234567890,    // si completed
  vtxoId: "vtxo_xyz"          // si completed
}
```

---

## ✅ TESTS À EFFECTUER

### Test 1 : Dépôt complet

```bash
# 1. Créer session
curl http://localhost:3000/api/session

# 2. Créer dépôt
curl -X POST http://localhost:3000/api/deposit \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=abc123" \
  -d '{"amount":1000}'

# Résultat attendu:
{
  "depositId": "deposit_...",
  "arkAddress": "ark1q...",
  "aspId": "addr_..."  # ← DOIT être présent !
}

# 3. Vérifier paiement
curl http://localhost:3000/api/check-payment/deposit_...

# Résultat si payé:
{
  "paid": true,
  "amount": 1000,
  "vtxoId": "vtxo_..."
}
```

### Test 2 : Retrait complet

```bash
# 1. Créer retrait
curl -X POST http://localhost:3000/api/withdraw \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=abc123" \
  -d '{
    "arkAddress":"ark1qbob...",
    "amount":800
  }'

# Résultat attendu:
{
  "txId": "tx_...",
  "status": "confirmed",
  "instant": true
}
```

### Test 3 : Jeu

```bash
curl -X POST http://localhost:3000/api/game \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=abc123" \
  -d '{
    "bet":100,
    "result":"win"
  }'

# Résultat:
{
  "success": true,
  "balanceChange": 100,
  "newBalance": 1100
}
```

---

## 🎯 RÉSUMÉ DES CORRECTIONS

1. ✅ Renommer `[address].js` → `[depositId].js`
2. ✅ Remplacer tous les clients par `ASPClient`
3. ✅ Ajouter `aspId` dans les réponses deposit
4. ✅ Utiliser `aspId` pour vérifier vTXOs
5. ✅ Supprimer fichiers obsolètes
6. ✅ Tester flow complet

---

**Une fois corrigé, le flow sera 100% cohérent avec ASP !**
