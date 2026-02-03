# 🏗️ Architecture ARK - BlackjARK

## 🎯 Problème actuel

La version POC actuelle a **2 problèmes majeurs** :

### ❌ Problème 1 : Pas de wallet casino
Les vTXOs des joueurs ne vont nulle part ! Il n'y a pas de "pot commun" du casino.

### ❌ Problème 2 : Pas de gestion des fonds réels
L'introspector signe les transactions, mais il faut un wallet ARK du casino pour gérer les fonds.

---

## ✅ Architecture ARK complète

### Composants nécessaires

```
┌─────────────────┐
│  Joueur (Alice) │
│  Wallet ArkSat  │
└────────┬────────┘
         │
         │ 1. Dépôt vTXO
         ▼
┌─────────────────────────────────┐
│  Casino BlackjARK (Backend)     │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Wallet ARK du Casino    │   │  ← MANQUANT !
│  │ (Clé privée sécurisée)  │   │
│  └───────────┬─────────────┘   │
│              │                  │
│  ┌───────────▼─────────────┐   │
│  │ Vercel KV (Database)    │   │
│  │ - Soldes joueurs        │   │
│  │ - vTXOs du casino       │   │
│  └─────────────────────────┘   │
└────────────┬────────────────────┘
             │
             │ 2. Soumettre intent
             ▼
┌─────────────────────────────────┐
│  ARK Introspector               │
│  - Signe les transactions       │
│  - Valide les vTXOs             │
│  - Broadcast réseau ARK         │
└─────────────────────────────────┘
```

---

## 🔑 Le Wallet Casino ARK

### C'est quoi ?

Un **wallet ARK** comme ArkSat, mais géré par le backend du casino. Il contient :
- La **clé privée** du casino (stockée en sécurisé)
- Les **vTXOs du pot commun**
- La **balance totale** disponible

### À quoi ça sert ?

1. **Recevoir les dépôts** : Quand Alice dépose 1000 sats, ils vont dans le wallet casino
2. **Payer les gains** : Quand Bob gagne 200 sats, ils viennent du wallet casino
3. **Gérer le pot** : Toujours avoir assez de liquidité

---

## 📊 Flow complet avec wallet casino

### 1. Dépôt (Alice → Casino)

```javascript
// Alice dépose 1000 sats

1. Frontend génère adresse de dépôt
   → arkAddress = deriveAddress(casinoMasterKey, sessionId)
   → "ark1qcasino_alice_123..."

2. Alice envoie vTXO depuis ArkSat
   → Destinataire : wallet casino
   → Montant : 1000 sats

3. Backend détecte réception
   → Vérifie vTXO reçu sur wallet casino
   → Met à jour balance Alice : +1000

4. Database
   player:alice {
     balance: 1000,
     arkVtxos: []  // vTXOs sont maintenant dans le wallet casino
   }
   
   casino_wallet {
     balance: 10000,  // Pool total
     vtxos: [
       { id: "vtxo_123", amount: 1000, from: "alice" }
     ]
   }
```

### 2. Jeu (Alice joue)

```javascript
// Alice mise 100 sats et GAGNE

1. Frontend : POST /api/game
   { bet: 100, result: "win" }

2. Backend (dans KV uniquement)
   player:alice {
     balance: 1000 + 100 = 1100  // Comptabilité locale
   }
   
   casino_wallet {
     balance: 10000  // Pas changé - juste comptabilité
   }

// Pas de transaction ARK pour chaque partie !
// On ajuste juste les balances locales
```

### 3. Retrait (Alice → Destination)

```javascript
// Alice retire 800 sats vers son wallet

1. Frontend : POST /api/withdraw
   { arkAddress: "ark1qalice_home...", amount: 800 }

2. Backend crée transaction vTXO
   FROM: wallet casino
   TO: ark1qalice_home...
   AMOUNT: 800 sats
   
   // Utiliser les vTXOs du pot casino
   vtxosToSpend = selectVTXOs(casino_wallet, 800)

3. Soumettre à introspector
   POST /v1/intent
   {
     proof: psbt_with_casino_signature,
     vtxos: ["vtxo_123", ...]
   }

4. Introspector signe et broadcast
   → Transaction ARK instantanée
   → Alice reçoit ses 800 sats

5. Mettre à jour database
   player:alice { balance: 1100 - 800 = 300 }
   
   casino_wallet {
     balance: 10000 - 800 = 9200,
     vtxos: [...]  // vTXO dépensé
   }
```

---

## 🔐 Gestion des clés

### Option 1 : Clé privée en variable d'env (Simple)

```bash
# .env
CASINO_ARK_PRIVATE_KEY=0x1234567890abcdef...

# Dans ark-client.js
const casinoPrivateKey = process.env.CASINO_ARK_PRIVATE_KEY;
```

⚠️ **Risque** : Si Vercel est compromis, les fonds sont perdus

### Option 2 : HSM / Vault (Production)

```bash
# Utiliser AWS Secrets Manager ou HashiCorp Vault
const casinoKey = await secretsManager.getSecret('ark-casino-key');
```

✅ **Sécurisé** : Clé stockée dans un coffre-fort séparé

### Option 3 : Multi-sig (Ultra sécurisé)

```javascript
// Requiert 2/3 signatures
const casinoWallet = {
  keys: [
    "key_admin_1",
    "key_admin_2", 
    "key_cold_storage"
  ],
  threshold: 2
};
```

✅ **Maximum sécurité** : Plusieurs personnes doivent approuver les retraits

---

## 🛠️ Implémentation du wallet casino

### Étape 1 : Générer clé maître

```bash
# Sur ta machine locale SÉCURISÉE
node

> const bip39 = require('bip39');
> const mnemonic = bip39.generateMnemonic(256);
> console.log('SEED:', mnemonic);

# NOTER CE SEED DANS UN ENDROIT SÛR !
# Ne JAMAIS le commiter sur GitHub
```

### Étape 2 : Dériver clés

```javascript
// api/casino-wallet.js
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');

const bip32 = BIP32Factory(ecc);

class CasinoWallet {
  constructor(seed) {
    this.masterKey = bip32.fromSeed(Buffer.from(seed, 'hex'));
    this.vtxos = [];
  }

  // Générer adresse de dépôt pour un joueur
  deriveDepositAddress(sessionId) {
    const index = this.hashSessionToIndex(sessionId);
    const child = this.masterKey.derivePath(`m/86'/0'/0'/0/${index}`);
    
    // Convertir en adresse ARK
    const pubkey = child.publicKey;
    return this.pubkeyToARKAddress(pubkey);
  }

  // Vérifier vTXOs reçus
  async checkReceivedVTXOs(introspector) {
    // Interroger introspector pour nos adresses
    const addresses = this.getAllAddresses();
    
    const vtxos = [];
    for (const addr of addresses) {
      const received = await introspector.getVTXOs(addr);
      vtxos.push(...received);
    }
    
    return vtxos;
  }

  // Créer transaction de retrait
  async createWithdrawal(destination, amount, introspector) {
    // Sélectionner vTXOs à dépenser
    const selected = this.selectVTXOs(amount);
    
    // Créer PSBT
    const psbt = this.createPSBT(selected, destination, amount);
    
    // Signer avec notre clé privée
    psbt.signAllInputs(this.masterKey);
    
    // Envoyer à introspector pour co-signature
    const signedProof = await introspector.submitIntent({
      proof: psbt.toBase64(),
      message: { type: 'withdrawal', amount }
    });
    
    return signedProof;
  }

  // Sélection de vTXOs (coin selection)
  selectVTXOs(amount) {
    let total = 0;
    const selected = [];
    
    for (const vtxo of this.vtxos) {
      if (!vtxo.spent) {
        selected.push(vtxo);
        total += vtxo.amount;
        
        if (total >= amount) break;
      }
    }
    
    if (total < amount) {
      throw new Error('Insufficient funds in casino wallet');
    }
    
    return selected;
  }
}

module.exports = CasinoWallet;
```

### Étape 3 : Intégrer dans les APIs

```javascript
// api/deposit.js
const CasinoWallet = require('./casino-wallet');

const casinoWallet = new CasinoWallet(process.env.CASINO_SEED);

// Générer adresse de dépôt qui va dans le wallet casino
const arkAddress = casinoWallet.deriveDepositAddress(sessionId);

// Cette adresse appartient au casino !
// Quand le joueur envoie ses vTXOs, ils vont dans le pot casino
```

```javascript
// api/withdraw.js
const CasinoWallet = require('./casino-wallet');

const casinoWallet = new CasinoWallet(process.env.CASINO_SEED);

// Retrait depuis le wallet casino
const tx = await casinoWallet.createWithdrawal(
  playerARKAddress,
  amount,
  arkClient
);
```

---

## 📈 Monitoring du pot casino

### Dashboard admin recommandé

```javascript
// api/admin/balance.js
export default async function handler(req, res) {
  const casinoBalance = await casinoWallet.getTotalBalance();
  const playersBalance = await getTotalPlayersBalance();
  
  res.json({
    casino: {
      balance: casinoBalance,
      vtxos: casinoWallet.vtxos.length,
      liquidity: casinoBalance - playersBalance  // Marge de sécurité
    },
    players: {
      totalBalance: playersBalance,
      activeCount: await getActivePlayersCount()
    },
    health: casinoBalance > playersBalance * 1.5 ? 'healthy' : 'warning'
  });
}
```

### Alertes recommandées

```javascript
// Vérifier liquidité toutes les heures
setInterval(async () => {
  const casino = await casinoWallet.getTotalBalance();
  const players = await getTotalPlayersBalance();
  
  if (casino < players * 1.2) {
    // ⚠️ Liquidité faible !
    await sendAlert('Low casino liquidity', { casino, players });
  }
}, 3600000);
```

---

## 💰 Approvisionner le wallet casino

### Méthode initiale

```bash
# 1. Créer wallet ArkSat pour le casino
# 2. Acheter des BTC
# 3. Onboard dans ARK (via ASP)
# 4. Transférer vTXOs vers adresse casino
# 5. Le casino a maintenant un pot de départ !
```

### Réapprovisionner si besoin

Si trop de joueurs gagnent et le pot diminue :

```bash
# 1. Acheter plus de BTC
# 2. Onboard ARK
# 3. Envoyer au wallet casino
```

---

## 🔒 Sécurité

### Règles critiques

1. **Jamais commiter la clé privée**
   ```bash
   # .gitignore
   .env
   .env.local
   SEED.txt
   ```

2. **Backup du seed**
   - Noter sur papier
   - Stocker dans coffre-fort physique
   - Jamais en ligne

3. **Limite de retrait**
   ```javascript
   const MAX_WITHDRAWAL = 5000; // sats
   
   if (amount > MAX_WITHDRAWAL) {
     // Requiert approval manuelle
     await requestManualApproval(sessionId, amount);
   }
   ```

4. **2FA pour gros retraits**
   ```javascript
   if (amount > 1000) {
     const code = await send2FACode(player.email);
     // Vérifier code avant retrait
   }
   ```

---

## 📝 TODO Production

- [ ] Générer seed casino sécurisé
- [ ] Implémenter CasinoWallet class
- [ ] Intégrer dans deposit.js
- [ ] Intégrer dans withdraw.js
- [ ] Monitoring balance casino
- [ ] Alertes liquidité
- [ ] Backup seed (papier + coffre)
- [ ] Tests avec vrais vTXOs
- [ ] Multi-sig optionnel (très haute sécurité)

---

## ⚡ Résumé

**Sans wallet casino** : Les vTXOs des joueurs disparaissent dans le vide ❌

**Avec wallet casino** : 
- Joueurs déposent → Wallet casino ✅
- Joueurs gagnent → Paiement depuis wallet casino ✅
- Pot commun géré proprement ✅

C'est **indispensable** pour un vrai casino ARK !
