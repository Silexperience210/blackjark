# 🏗️ Architecture ARK avec ASP (ArkadeOS)

## 🎯 Vraie architecture ARK

Dans ARK, on ne gère **PAS** nous-mêmes les clés privées ! C'est l'**ASP** (ARK Service Provider) qui fait tout.

### ❌ FAUX (ce que j'ai fait avant)
```
Casino → Wallet avec seed privé → Gérer vTXOs manuellement
```

### ✅ VRAI (architecture ARK réelle)
```
Casino → ASP (ArkadeOS) → ASP gère les vTXOs pour nous
```

---

## 🌐 Qu'est-ce qu'un ASP ?

Un **ASP** (ARK Service Provider) est comme un "serveur Lightning" mais pour ARK :

- Gère les clés privées
- Crée les vTXOs
- Signe les transactions
- Broadcast dans le réseau ARK
- Fournit une API REST/gRPC

**Exemples d'ASP :**
- Second (https://second.tech)
- Ark Labs officiel
- Ton propre ASP (si tu lances ArkadeOS)

---

## 🔑 Pas besoin de seed !

### Avec ASP : Juste une clé API

Au lieu de :
```bash
CASINO_ARK_SEED=abc123...  ❌
```

On a juste :
```bash
ASP_URL=https://asp.second.tech
ASP_API_KEY=sk_live_abc123...  ✅
```

### L'ASP gère :
- ✅ Génération des adresses ARK
- ✅ Réception des vTXOs
- ✅ Signature des transactions
- ✅ Gestion des clés privées
- ✅ Backup et sécurité

**Nous on gère juste :**
- La comptabilité (qui possède combien)
- Les demandes de paiement
- La logique métier du casino

---

## 📊 Architecture simplifiée avec ASP

```
┌─────────────────┐
│  Joueur Alice   │
│  Wallet ArkSat  │
└────────┬────────┘
         │
         │ 1. Dépose 1000 sats
         ▼
┌─────────────────────────────┐
│  ASP (Second/ArkadeOS)      │
│  - Crée vTXO pour Alice     │
│  - Donne ID unique          │
└────────┬────────────────────┘
         │
         │ 2. Webhook: "Alice a déposé"
         ▼
┌─────────────────────────────┐
│  BlackjARK (notre backend)  │
│                             │
│  Vercel KV:                 │
│  player:alice {             │
│    balance: 1000,           │
│    aspVtxoId: "vtxo_123"    │
│  }                          │
└─────────────────────────────┘
         │
         │ 3. Alice retire 800 sats
         ▼
┌─────────────────────────────┐
│  ASP API                    │
│  POST /transfer             │
│  {                          │
│    from: "vtxo_123",        │
│    to: "ark1qbob...",       │
│    amount: 800              │
│  }                          │
└────────┬────────────────────┘
         │
         │ 4. Transaction signée et broadcast
         ▼
┌─────────────────┐
│  Réseau ARK     │
│  (confirmé ⚡)  │
└─────────────────┘
```

---

## 🔌 APIs ASP (ArkadeOS)

### 1. Créer une adresse de dépôt

```javascript
// POST https://asp.second.tech/v1/address/new
{
  "label": "casino_alice_123"
}

// Réponse
{
  "address": "ark1qxyz...",
  "aspId": "addr_abc123"
}
```

### 2. Vérifier réception

```javascript
// GET https://asp.second.tech/v1/address/addr_abc123/vtxos

// Réponse
{
  "vtxos": [
    {
      "id": "vtxo_xyz",
      "amount": 1000,
      "status": "confirmed",
      "createdAt": "2025-02-03T10:00:00Z"
    }
  ]
}
```

### 3. Créer un transfert

```javascript
// POST https://asp.second.tech/v1/transfer
{
  "from": "vtxo_xyz",
  "to": "ark1qbob...",
  "amount": 800
}

// Réponse
{
  "txId": "tx_123",
  "status": "confirmed",
  "instant": true
}
```

### 4. Webhooks

L'ASP peut nous notifier :

```javascript
// POST https://blackjark.vercel.app/api/webhooks/asp
{
  "event": "vtxo.received",
  "address": "ark1qxyz...",
  "vtxo": {
    "id": "vtxo_xyz",
    "amount": 1000
  }
}
```

---

## 💡 Implémentation avec ASP

### Créer le client ASP

```javascript
// api/asp-client.js
const fetch = require('node-fetch');

class ASPClient {
  constructor() {
    this.baseUrl = process.env.ASP_URL || 'https://asp.second.tech';
    this.apiKey = process.env.ASP_API_KEY;
  }

  // Créer adresse de dépôt
  async createAddress(label) {
    const res = await fetch(`${this.baseUrl}/v1/address/new`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ label })
    });
    
    return res.json();
  }

  // Vérifier vTXOs reçus
  async getVTXOs(addressId) {
    const res = await fetch(`${this.baseUrl}/v1/address/${addressId}/vtxos`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    return res.json();
  }

  // Créer transfert
  async transfer(fromVtxo, toAddress, amount) {
    const res = await fetch(`${this.baseUrl}/v1/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromVtxo,
        to: toAddress,
        amount
      })
    });
    
    return res.json();
  }

  // Obtenir balance totale du casino
  async getTotalBalance() {
    const res = await fetch(`${this.baseUrl}/v1/wallet/balance`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    return res.json();
  }
}

module.exports = ASPClient;
```

---

## 🔄 Flow complet avec ASP

### Dépôt

```javascript
// api/deposit.js
const ASPClient = require('./asp-client');
const asp = new ASPClient();

// 1. Créer adresse via ASP
const { address, aspId } = await asp.createAddress(`casino_${sessionId}`);

// 2. Sauvegarder
await kv.set(`deposit:${aspId}`, {
  sessionId,
  arkAddress: address,
  aspId,
  amount: amountSats,
  status: 'pending'
});

// 3. Retourner au joueur
res.json({
  arkAddress: address,
  qrCode: `ark:${address}?amount=${amountSats}`
});
```

### Vérification (Webhook ou Polling)

**Option A : Webhook (recommandé)**

```javascript
// api/webhooks/asp.js
export default async function handler(req, res) {
  const { event, address, vtxo } = req.body;
  
  if (event === 'vtxo.received') {
    // Trouver le dépôt
    const deposits = await kv.keys('deposit:*');
    for (const key of deposits) {
      const deposit = await kv.get(key);
      
      if (deposit.arkAddress === address) {
        // Mettre à jour joueur
        const player = await kv.get(`player:${deposit.sessionId}`);
        player.balance += vtxo.amount;
        
        // Associer vTXO au joueur
        player.aspVtxos = player.aspVtxos || [];
        player.aspVtxos.push(vtxo.id);
        
        await kv.set(`player:${deposit.sessionId}`, player);
        break;
      }
    }
  }
  
  res.status(200).json({ received: true });
}
```

**Option B : Polling**

```javascript
// api/check-payment/[aspId].js
const asp = new ASPClient();

const { vtxos } = await asp.getVTXOs(aspId);

if (vtxos.length > 0) {
  // Mettre à jour balance joueur
  player.balance += vtxos[0].amount;
  player.aspVtxos.push(vtxos[0].id);
}
```

### Retrait

```javascript
// api/withdraw.js
const asp = new ASPClient();

// 1. Récupérer vTXO du joueur
const vtxoId = player.aspVtxos[0]; // Ou coin selection

// 2. Transférer via ASP
const tx = await asp.transfer(
  vtxoId,
  destinationAddress,
  amount
);

// 3. Mettre à jour comptabilité
player.balance -= amount;
player.aspVtxos = player.aspVtxos.filter(id => id !== vtxoId);

await kv.set(`player:${sessionId}`, player);

res.json({
  txId: tx.txId,
  status: 'confirmed',
  instant: true
});
```

---

## 🔐 Configuration ASP

### Variables d'environnement

```bash
# .env
ASP_URL=https://asp.second.tech
ASP_API_KEY=sk_live_abc123...

# Webhook secret (pour valider les webhooks)
ASP_WEBHOOK_SECRET=whsec_xyz...
```

### Obtenir une clé API

**Option 1 : Utiliser Second.tech**
```bash
# S'inscrire sur https://second.tech
# Dashboard > API Keys > Create
# Copier la clé sk_live_...
```

**Option 2 : Lancer son propre ASP**
```bash
# Cloner ArkadeOS
git clone https://github.com/ark-network/arkadeos
cd arkadeos

# Configuration
cp .env.example .env
# Editer .env avec tes paramètres

# Lancer
docker-compose up -d

# API disponible sur http://localhost:8080
```

---

## 💰 Approvisionner via ASP

### Méthode simple

1. **Acheter BTC** (ex: 0.01 BTC)
2. **Aller sur dashboard ASP** (ex: second.tech)
3. **Deposit** → Envoyer BTC à l'adresse on-chain
4. **Attendre 1-3 confirmations**
5. **L'ASP crée automatiquement des vTXOs**
6. **Disponible immédiatement** pour le casino !

### Pas besoin de :
- ❌ Gérer des seeds
- ❌ Signer manuellement
- ❌ Broadcaster nous-mêmes
- ❌ Gérer la sécurité des clés

**L'ASP fait tout !** ✅

---

## 📊 Monitoring avec ASP

```javascript
// api/admin/casino-stats.js
const asp = new ASPClient();

// Balance totale gérée par l'ASP
const { balance, vtxos } = await asp.getTotalBalance();

res.json({
  casino: {
    asp: {
      balance,
      vtxoCount: vtxos.length,
      provider: process.env.ASP_URL
    }
  },
  players: {
    totalBalance: totalPlayerBalance
  },
  health: {
    coverageRatio: (balance / totalPlayerBalance).toFixed(2),
    healthy: balance >= totalPlayerBalance * 1.5
  }
});
```

---

## 🎯 Avantages ASP vs Seed manuel

| Aspect | Seed manuel | ASP |
|--------|-------------|-----|
| **Sécurité** | ⚠️ Nous responsables | ✅ ASP gère tout |
| **Backup** | ⚠️ Manuel (papier) | ✅ Automatique |
| **Signatures** | ⚠️ Code crypto complexe | ✅ API simple |
| **Mise à jour** | ⚠️ Maintenir nous-mêmes | ✅ ASP se met à jour |
| **Support** | ⚠️ Seuls | ✅ Support ASP |
| **Coût** | Gratuit | ~0.1% par transaction |
| **Contrôle** | 100% | Dépend de l'ASP |

---

## 🚀 Recommandation

### Pour BlackjARK : **Utiliser un ASP**

**Pourquoi ?**
1. Plus simple à implémenter
2. Plus sécurisé (ASP = experts)
3. Pas de gestion de clés privées
4. Support et monitoring inclus
5. Mise à jour automatique du protocole

**Quel ASP ?**

**Production** : [Second.tech](https://second.tech)
- Hébergé
- Support 24/7
- SLA garanti
- Frais : ~0.1% par transaction

**Dev/Test** : ASP local (ArkadeOS)
- Gratuit
- Contrôle total
- Parfait pour tester

---

## 📝 TODO : Migrer vers ASP

- [ ] Supprimer `casino-wallet.js` (pas besoin)
- [ ] Créer `asp-client.js`
- [ ] Modifier `deposit.js` → utiliser `asp.createAddress()`
- [ ] Modifier `check-payment` → utiliser `asp.getVTXOs()`
- [ ] Modifier `withdraw.js` → utiliser `asp.transfer()`
- [ ] Setup webhook ASP → `/api/webhooks/asp`
- [ ] Variables d'env : `ASP_URL`, `ASP_API_KEY`
- [ ] Tester avec Second.tech

---

## ⚡ Conclusion

**Pas besoin de seed avec ARK !**

L'architecture ARK est conçue pour que l'**ASP gère les clés** pour nous. On interagit juste via API REST, comme avec Stripe ou PayPal.

**C'est beaucoup plus simple et sûr !** 🎯
