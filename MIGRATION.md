# 🔄 Migration Lightning → ARK

Ce document explique tous les changements apportés pour passer du protocole Lightning Network (LNbits) au protocole ARK (Introspector).

## 📊 Vue d'ensemble des changements

| Composant | Lightning (Avant) | ARK (Après) |
|-----------|-------------------|-------------|
| **Payment Layer** | LNbits invoices | ARK vTXOs + Intent Proofs |
| **Dépôt** | Lightning invoice | Adresse Bitcoin on-chain |
| **Vérification** | Webhook LNbits | Check confirmations blockchain |
| **Balance** | LNbits wallet API | vTXOs locaux en KV |
| **Retrait** | Pay LN invoice | Intent proof + signature |
| **Config** | LNBITS_URL + keys | ARK_INTROSPECTOR_URL |

## 🔧 Changements Code

### 1. Client de paiement

**AVANT (Lightning)** :
```javascript
// Appel à LNbits API
const response = await fetch(`${LNBITS_URL}/api/v1/payments`, {
  headers: { 'X-Api-Key': LNBITS_INVOICE_KEY }
});
```

**APRÈS (ARK)** :
```javascript
// Appel à ARK Introspector
const response = await fetch(`${ARK_INTROSPECTOR_URL}/v1/info`);
const deposit = await arkClient.createDeposit(sessionId, amount);
```

### 2. Structure de données joueur

**AVANT (Lightning)** :
```javascript
{
  sessionId: "...",
  balance: 1000,
  totalDeposited: 2000,
  totalWithdrawn: 500,
  gamesPlayed: 42
}
```

**APRÈS (ARK)** :
```javascript
{
  sessionId: "...",
  balance: 1000,
  arkVtxos: [                    // NOUVEAU
    { id: "vtxo_xxx", amount: 500, createdAt: 123456 }
  ],
  pendingDeposits: [             // NOUVEAU
    { address: "bc1q...", amount: 500 }
  ],
  totalDeposited: 2000,
  totalWithdrawn: 500,
  gamesPlayed: 42
}
```

### 3. API Dépôt

**AVANT (Lightning - deposit.js)** :
```javascript
// Créer invoice Lightning
const invoice = await fetch(`${LNBITS_URL}/api/v1/payments`, {
  method: 'POST',
  headers: { 'X-Api-Key': LNBITS_INVOICE_KEY },
  body: JSON.stringify({
    out: false,
    amount: amountSats,
    memo: `Dépôt casino ${sessionId}`
  })
});

return {
  payment_request: invoice.payment_request,
  payment_hash: invoice.payment_hash
};
```

**APRÈS (ARK - deposit.js)** :
```javascript
// Générer adresse Bitcoin on-chain
const deposit = await arkClient.createDeposit(sessionId, amountSats);

return {
  address: deposit.address,              // Adresse BTC
  amount: amountSats,
  expiresAt: deposit.expiresAt,
  qrCode: `bitcoin:${deposit.address}?amount=...`
};
```

### 4. Vérification de paiement

**AVANT (Lightning - check-payment/[hash].js)** :
```javascript
// Checker via LNbits API
const payment = await fetch(
  `${LNBITS_URL}/api/v1/payments/${hash}`,
  { headers: { 'X-Api-Key': LNBITS_INVOICE_KEY }}
);

if (payment.paid) {
  player.balance += payment.amount;
}
```

**APRÈS (ARK - check-payment/[address].js)** :
```javascript
// Checker confirmations blockchain + vTXO
const paymentStatus = await arkClient.checkDeposit(address);

if (paymentStatus.confirmations >= 1 && paymentStatus.vTxoCreated) {
  player.balance += deposit.amount;
  player.arkVtxos.push({
    id: paymentStatus.vtxoId,
    amount: deposit.amount,
    createdAt: Date.now()
  });
}
```

### 5. API Retrait

**AVANT (Lightning - withdraw.js)** :
```javascript
// Payer une invoice Lightning
const payment = await fetch(`${LNBITS_URL}/api/v1/payments`, {
  method: 'POST',
  headers: { 'X-Api-Key': LNBITS_ADMIN_KEY },
  body: JSON.stringify({
    out: true,
    bolt11: invoice,
    memo: `Retrait casino ${sessionId}`
  })
});

if (payment.payment_hash) {
  player.balance -= amount;
}
```

**APRÈS (ARK - withdraw.js)** :
```javascript
// Créer intent proof ARK
const withdrawal = await arkClient.createWithdrawal(
  sessionId,
  address,
  amountSats
);

// Soumettre à introspector pour signature
const response = await fetch(`${ARK_INTROSPECTOR_URL}/v1/intent`, {
  method: 'POST',
  body: JSON.stringify({ intent })
});

// Retirer vTXOs utilisés
player.arkVtxos = player.arkVtxos.filter(vtxo => ...);
player.balance -= amountSats;
```

### 6. Enregistrement de jeu

**AVANT (Lightning - game.js)** :
```javascript
// Rien de spécial, juste update balance
player.balance += balanceChange;
```

**APRÈS (ARK - game.js)** :
```javascript
// Enregistrer transaction vTXO locale
await arkClient.recordGameTransaction(sessionId, gameId, betAmount, won);

player.balance += balanceChange;
```

## 🔐 Variables d'environnement

**AVANT (Lightning)** :
```bash
LNBITS_URL=https://legend.lnbits.com
LNBITS_ADMIN_KEY=xxx
LNBITS_INVOICE_KEY=yyy
```

**APRÈS (ARK)** :
```bash
ARK_INTROSPECTOR_URL=http://localhost:7073
ARK_NETWORK=regtest
```

## 📦 Dépendances package.json

**AVANT (Lightning)** :
```json
{
  "dependencies": {
    "@vercel/kv": "^1.0.1",
    "node-fetch": "^2.7.0"
  }
}
```

**APRÈS (ARK)** :
```json
{
  "dependencies": {
    "@vercel/kv": "^1.0.1",
    "node-fetch": "^2.7.0",
    "bitcoinjs-lib": "^6.1.5",      // NOUVEAU
    "bip32": "^4.0.0",               // NOUVEAU
    "bip39": "^3.1.0",               // NOUVEAU
    "tiny-secp256k1": "^2.2.3"       // NOUVEAU
  }
}
```

## 🎨 Frontend (index.html)

### Changements visuels

**Badge protocole** :
```html
<!-- AVANT -->
<div class="protocol-badge">Powered by Lightning Network</div>

<!-- APRÈS -->
<div class="protocol-badge">Powered by ARK Protocol</div>
```

**Stats affichées** :
```html
<!-- NOUVEAU : Afficher nombre de vTXOs -->
<div class="vtxo-count" id="vtxo-count">0 vTXOs</div>
```

### Flux de dépôt

**AVANT (Lightning)** :
```javascript
// Afficher QR code invoice
const qrCode = `lightning:${invoice.payment_request}`;
```

**APRÈS (ARK)** :
```javascript
// Afficher adresse Bitcoin + QR
const qrCode = `bitcoin:${address}?amount=${btcAmount}`;

// Polling confirmations
setInterval(async () => {
  const status = await checkPayment(address);
  if (status.confirmations >= 1) {
    // Confirmé !
  }
}, 10000);
```

### Modal Info

**NOUVEAU** : Modal explicatif ARK
```html
<div class="modal" id="ark-info-modal">
  <h2>ℹ️ Protocole ARK</h2>
  <ul>
    <li>Second-layer Bitcoin utilisant des vTXOs</li>
    <li>Transactions instantanées</li>
    <li>Exit garanti après 4 semaines</li>
  </ul>
</div>
```

## 🏗️ Architecture

**AVANT (Lightning)** :
```
Frontend
   ↓
Vercel APIs
   ↓
LNbits Server (externe)
   ↓
Lightning Network
```

**APRÈS (ARK)** :
```
Frontend
   ↓
Vercel APIs
   ↓
ARK Introspector (auto-hébergé)
   ↓
Bitcoin Blockchain
```

## 🔍 Concepts clés ARK

### vTXO (Virtual Transaction Output)

Équivalent d'un UTXO Bitcoin, mais virtuel :

```javascript
{
  id: "vtxo_abc123",
  amount: 1000,        // satoshis
  createdAt: 123456,
  owner: "sessionId",
  spent: false
}
```

### Intent Proof

Document PSBT signé prouvant l'intention de dépenser des vTXOs :

```javascript
{
  proof: "base64_encoded_psbt",
  message: {
    from: "sessionId",
    to: "bc1q...",
    amount: 1000,
    vtxos: ["vtxo_1", "vtxo_2"]
  }
}
```

### Forfeit Transaction

Transaction de secours permettant de récupérer ses fonds si l'introspector devient non-coopératif (après 4 semaines).

## 🚀 Avantages ARK

| Fonctionnalité | Lightning | ARK |
|----------------|-----------|-----|
| **Setup** | Créer channels | Direct |
| **Liquidité entrante** | Problème majeur | Pas de problème |
| **Routage** | Complexe | Direct au destinataire |
| **Confidentialité** | Limitée | CoinJoin automatique |
| **Exit** | Requiert coopération | Garanti unilatéralement |
| **Frais** | Variables (routing) | Fixes (on-chain) |

## 📝 Checklist Migration

- [x] Remplacer client LNbits par client ARK
- [x] Modifier structure données (ajouter vTXOs)
- [x] Changer API dépôt (invoice → adresse)
- [x] Adapter vérification paiement (webhook → polling)
- [x] Réécrire retrait (pay invoice → intent proof)
- [x] Ajouter tracking vTXOs
- [x] Mettre à jour frontend (QR code, infos)
- [x] Changer variables d'environnement
- [x] Ajouter dépendances Bitcoin (bitcoinjs-lib)
- [x] Documentation ARK

## 🔮 Prochaines implémentations

Pour une version production complète :

1. **Vraie génération vTXO** avec bitcoinjs-lib
2. **Dérivation d'adresses** HD wallet (BIP32)
3. **Validation PSBT** complète
4. **Gestion forfeits** pour exit unilatéral
5. **Connector trees** pour batching
6. **CoinJoin rounds** pour confidentialité

## 📚 Ressources

- **ARK Whitepaper** : https://arkdev.info
- **Introspector API** : https://github.com/ArkLabsHQ/introspector
- **Bitcoin Script** : bitcoinjs-lib documentation
- **ArkSat Wallet** : Wallet de référence

---

**Migration complète Lightning → ARK** ✅
