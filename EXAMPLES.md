# 💡 Exemples d'utilisation - Casino ARK

## 🎮 Scénario utilisateur complet

### Alice joue au casino

#### 1. Première visite

```
Alice ouvre https://casino-ark.vercel.app

[Frontend]
→ GET /api/session
← { sessionId: "abc123", balance: 0, arkVtxos: 0 }

Cookie créé : session_id=abc123
```

#### 2. Dépôt de 1000 sats

```
Alice clique "💰 Déposer (ARK)"
Entre : 1000 sats

[Frontend]
→ POST /api/deposit { amount: 1000 }

[Backend - deposit.js]
1. Générer adresse Taproot (BIP86)
   Dérivation : m/86'/0'/0'/0/42
   
2. Créer entrée dans KV
   deposit:bc1p... = {
     sessionId: "abc123",
     amount: 1000,
     status: "pending"
   }

← { 
    address: "bc1pxxx...",
    qrCode: "bitcoin:bc1pxxx...?amount=0.00001000"
  }
```

**Alice envoie 1000 sats on-chain**

```
Blockchain:
TX: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Confirmations: 0 → 1 → 2 → ...
```

#### 3. Vérification du dépôt (polling)

```
[Frontend - toutes les 10 secondes]
→ GET /api/check-payment/bc1pxxx

[Backend - check-payment/[address].js]
1. Récupérer dépôt depuis KV
2. Vérifier blockchain via Bitcoin RPC
   getReceivedByAddress("bc1pxxx", 1)
   
3. Si 1+ confirmations :
   - Créer vTXO via introspector
   - Mettre à jour joueur :
     player.balance += 1000
     player.arkVtxos.push({
       id: "vtxo_abc123",
       amount: 1000,
       txid: "e3b0c...",
       vout: 0
     })

← {
    paid: true,
    amount: 1000,
    vtxoId: "vtxo_abc123",
    confirmations: 1
  }

[Frontend]
✅ "Dépôt confirmé ! +1000 sats (vTXO: vtxo_abc123)"
```

#### 4. Jouer au Blackjack

```
Alice clique "🎰 Jouer au Blackjack"

[Frontend]
→ POST /api/game { bet: 100, result: "win" }

[Backend - game.js]
1. Vérifier balance >= 100 ✓
2. Calculer résultat (RTP 45%)
   Random: 0.42 → WIN !
   balanceChange = +100

3. Mettre à jour balance
   player.balance = 1000 + 100 = 1100
   player.gamesPlayed++

4. Enregistrer vTXO transaction locale
   (pas de blockchain, juste tracking)

← {
    success: true,
    result: "win",
    balanceChange: 100,
    newBalance: 1100
  }

[Frontend]
🎉 "GAGNÉ ! +100 sats"
```

#### 5. Alice joue 5 fois de plus

```
Partie 2: bet=100, result=lose  → balance=1000
Partie 3: bet=100, result=lose  → balance=900
Partie 4: bet=100, result=win   → balance=1000
Partie 5: bet=100, result=lose  → balance=900
Partie 6: bet=100, result=push  → balance=900

Balance finale : 900 sats
```

#### 6. Retrait de 800 sats

```
Alice clique "💸 Retirer (ARK)"
Adresse : bc1qyyy...
Montant : 800 sats

[Frontend]
→ POST /api/withdraw { 
    address: "bc1qyyy...",
    amount: 800
  }

[Backend - withdraw.js]
1. Vérifier balance >= 800 ✓
2. Valider adresse Bitcoin ✓

3. Créer Intent Proof (PSBT)
   Inputs:
   - vTXO vtxo_abc123 (1000 sats)
   
   Outputs:
   - bc1qyyy... : 800 sats
   - bc1pchange... : 190 sats (change)
   
   Frais: 10 sats

4. Soumettre à introspector
   POST /v1/intent
   {
     intent: {
       proof: "cHNidP8BAH...",
       message: "base64_metadata"
     }
   }

5. Introspector signe avec sa clé
   ← { signed_proof: "cHNidP8BAH..." }

6. Broadcaster transaction
   sendRawTransaction(signedPSBT)
   
7. Mettre à jour joueur
   player.balance -= 800
   player.totalWithdrawn += 800
   player.arkVtxos = []  // vTXO dépensé

← {
    success: true,
    txid: "f4a3b2...",
    amount: 800,
    newBalance: 100
  }

[Frontend]
💸 "Retrait ARK créé ! TX: f4a3b2..."
```

#### 7. Blockchain confirmations

```
15 minutes plus tard...

Blockchain:
TX: f4a3b2... confirmé (1/6)
Output 0: bc1qyyy... reçoit 800 sats ✓
Output 1: bc1pchange... reçoit 190 sats (nouveau vTXO potentiel)
```

## 🔧 Exemples techniques

### Créer une adresse de dépôt Taproot

```javascript
const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');

const bip32 = BIP32Factory(ecc);
const network = bitcoin.networks.testnet;

// Master seed (HD wallet)
const seed = Buffer.from('votre_seed_hex', 'hex');
const masterNode = bip32.fromSeed(seed);

// Dérivation BIP86 (Taproot)
const path = "m/86'/1'/0'/0/42";  // Index 42
const child = masterNode.derivePath(path);

// Générer adresse Taproot
const { address } = bitcoin.payments.p2tr({
  internalPubkey: child.publicKey.slice(1, 33),
  network
});

console.log('Adresse:', address);
// Résultat: tb1p...
```

### Créer un vTXO depuis UTXO

```javascript
const vtxo = {
  id: generateVTXOId(utxo),
  txid: utxo.txid,
  vout: utxo.vout,
  amount: utxo.value,
  owner: sessionId,
  scriptPubKey: utxo.scriptPubKey,
  createdAt: Date.now(),
  spent: false,
  
  // Transaction de forfeit (exit après 4 semaines)
  forfeitTx: createForfeitPSBT(utxo, sessionId)
};

// Sauvegarder
await kv.set(`vtxo:${vtxo.id}`, vtxo);
```

### Créer Intent Proof

```javascript
const bitcoin = require('bitcoinjs-lib');

async function createIntentProof(vtxos, destination, amount) {
  const psbt = new bitcoin.Psbt({ network });
  
  // Inputs : vTXOs
  let totalInput = 0;
  vtxos.forEach(vtxo => {
    psbt.addInput({
      hash: vtxo.txid,
      index: vtxo.vout,
      witnessUtxo: {
        script: Buffer.from(vtxo.scriptPubKey, 'hex'),
        value: vtxo.amount
      },
      tapInternalKey: getInternalKey(vtxo)
    });
    totalInput += vtxo.amount;
  });
  
  // Output : destination
  psbt.addOutput({
    address: destination,
    value: amount
  });
  
  // Change si nécessaire
  const fee = 500;
  const change = totalInput - amount - fee;
  if (change > 546) {  // Dust limit
    psbt.addOutput({
      address: getChangeAddress(vtxos[0].owner),
      value: change
    });
  }
  
  return {
    proof: psbt.toBase64(),
    metadata: {
      vtxos: vtxos.map(v => v.id),
      destination,
      amount,
      timestamp: Date.now()
    }
  };
}
```

### Soumettre à l'Introspector

```javascript
async function submitToIntrospector(intentProof) {
  const response = await fetch(`${INTROSPECTOR_URL}/v1/intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: {
        proof: intentProof.proof,
        message: Buffer.from(JSON.stringify(intentProof.metadata)).toString('base64')
      }
    })
  });
  
  const { signed_proof } = await response.json();
  
  // PSBT maintenant signé par l'introspector
  return signed_proof;
}
```

### Broadcaster transaction

```javascript
async function broadcastARKTransaction(signedPSBT) {
  const psbt = bitcoin.Psbt.fromBase64(signedPSBT);
  
  // Finaliser tous les inputs
  psbt.finalizeAllInputs();
  
  // Extraire transaction
  const tx = psbt.extractTransaction();
  const txHex = tx.toHex();
  
  // Broadcast via Bitcoin RPC
  const txid = await bitcoinRPC.sendRawTransaction(txHex);
  
  console.log('TX broadcast:', txid);
  return txid;
}
```

## 🧪 Test en local

### Setup complet

```bash
# Terminal 1 : Bitcoin regtest
bitcoind -regtest -daemon
bitcoin-cli -regtest createwallet "casino"
bitcoin-cli -regtest -generate 101  # Miner des blocs

# Terminal 2 : ARK Introspector
cd introspector
export INTROSPECTOR_SECRET_KEY=$(openssl rand -hex 32)
export INTROSPECTOR_NETWORK=regtest
make build && ./introspector

# Terminal 3 : Casino
cd satoshi-casino-ark
npm install
cat > .env << EOF
ARK_INTROSPECTOR_URL=http://localhost:7073
ARK_NETWORK=regtest
BITCOIN_RPC_URL=http://localhost:18443
BITCOIN_RPC_USER=user
BITCOIN_RPC_PASS=pass
EOF

vercel dev
```

### Tester dépôt

```bash
# Générer adresse
curl http://localhost:3000/api/deposit \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=test123" \
  -d '{"amount":1000}'

# Résultat: { "address": "bcrt1p..." }

# Envoyer des bitcoins (regtest)
bitcoin-cli -regtest sendtoaddress bcrt1p... 0.00001

# Miner un bloc (confirmer)
bitcoin-cli -regtest -generate 1

# Vérifier paiement
curl http://localhost:3000/api/check-payment/bcrt1p...

# Résultat: { "paid": true, "vtxoId": "vtxo_..." }
```

### Tester retrait

```bash
# Créer retrait
curl http://localhost:3000/api/withdraw \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=test123" \
  -d '{
    "address": "bcrt1qtest...",
    "amount": 800
  }'

# Résultat: { "txid": "...", "status": "submitted" }

# Vérifier dans mempool
bitcoin-cli -regtest getmempoolinfo

# Miner bloc
bitcoin-cli -regtest -generate 1
```

## 📊 Monitoring exemple

```javascript
// Dashboard stats
GET /api/stats

{
  "totalVTXOs": 42,
  "totalBalance": 150000,  // sats
  "activeUsers": 12,
  "depositsToday": 8,
  "withdrawalsToday": 3,
  "introspectorStatus": "online",
  "bitcoinHeight": 2567890,
  "avgConfirmationTime": "15min"
}
```

## 🎯 Cas limites

### Double spending tenté

```javascript
// Alice essaye de dépenser le même vTXO 2 fois
POST /api/withdraw { vtxo: "vtxo_abc", amount: 500 }
POST /api/withdraw { vtxo: "vtxo_abc", amount: 500 }

// Backend détecte :
if (vtxo.spent) {
  throw new Error('vTXO already spent');
}

// Seule la 1ère transaction passe
```

### Introspector offline

```javascript
// Tentative de retrait
try {
  await submitToIntrospector(intent);
} catch (error) {
  // Introspector ne répond pas
  
  // Fallback : Utiliser forfeit transaction
  const forfeitTx = vtxo.forfeitTx;
  
  // Attendre 4 semaines, puis broadcast
  // (exit unilatéral garanti)
}
```

### Réorg blockchain

```javascript
// Dépôt confirmé avec 1 conf
vtxo.confirmations = 1;

// Réorg ! Bloc orphelin
// Le monitoring détecte :
const currentConfs = await rpc.getReceivedByAddress(address, 0);

if (currentConfs < vtxo.confirmations) {
  // Réorg détecté !
  vtxo.status = 'pending';
  player.balance -= vtxo.amount;
  
  // Alert admin
  sendAlert('Reorg detected for vtxo ' + vtxo.id);
}
```

---

**Ces exemples montrent le flow complet ARK** 🎮
