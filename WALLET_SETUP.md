# 🔑 Configuration Wallet Casino

## ⚠️ SÉCURITÉ CRITIQUE

Le wallet casino contient **tout le pot commun** du casino. Si la clé privée est compromise, **tous les fonds sont perdus**.

---

## 🚀 Setup rapide (Dev/Test)

### 1. Générer un seed de développement

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Résultat : `a1b2c3d4e5f6...` (64 caractères hex)

### 2. Ajouter au .env

```bash
# .env
CASINO_ARK_SEED=a1b2c3d4e5f6...

# Optionnel - Clé admin pour monitoring
ADMIN_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
```

### 3. Tester

```bash
vercel dev

# Vérifier que le wallet se charge
curl http://localhost:3000/api/admin/casino-stats
```

---

## 🔐 Setup production (SÉCURISÉ)

### Option 1 : Seed manuel (Simple mais risqué)

**⚠️ À faire sur une machine HORS LIGNE**

```bash
# Sur machine sécurisée (déconnectée d'internet)
node

> const crypto = require('crypto');
> const seed = crypto.randomBytes(32).toString('hex');
> console.log('SEED:', seed);
> 
> // NOTER CE SEED SUR PAPIER
> // Ne JAMAIS le stocker numériquement
```

**Stockage du seed :**
1. Noter sur papier
2. Faire 2 copies
3. Stocker dans 2 coffres-forts différents
4. NE JAMAIS mettre en ligne

**Configuration Vercel :**
```bash
# Dans Vercel Dashboard
# Settings > Environment Variables
# Ajouter:
CASINO_ARK_SEED=<votre_seed>
Type: Secret
Environments: Production, Preview, Development
```

### Option 2 : AWS Secrets Manager (Recommandé)

```bash
# Créer secret dans AWS
aws secretsmanager create-secret \
  --name blackjark-casino-seed \
  --secret-string "$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"

# Obtenir ARN du secret
aws secretsmanager describe-secret --secret-id blackjark-casino-seed
```

**Modifier `api/casino-wallet.js` :**

```javascript
// Au lieu de :
this.masterSeed = process.env.CASINO_ARK_SEED;

// Utiliser :
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

async getMasterSeed() {
  const data = await secretsManager.getSecretValue({
    SecretId: 'blackjark-casino-seed'
  }).promise();
  
  return data.SecretString;
}
```

**Avantages :**
- Rotation automatique des secrets
- Audit trail (qui a accédé quand)
- Pas de secret dans variables Vercel
- Révocation immédiate si compromis

### Option 3 : HashiCorp Vault (Enterprise)

```bash
# Stocker dans Vault
vault kv put secret/blackjark/casino seed=<generated_seed>

# Accéder depuis le code
vault kv get -field=seed secret/blackjark/casino
```

**Avantages :**
- Multi-tenant
- Policies fine-grained
- Dynamic secrets
- HSM backend possible

### Option 4 : Multi-sig (Ultra sécurisé)

Requiert plusieurs personnes pour approuver les transactions.

```javascript
class MultiSigCasinoWallet extends CasinoWallet {
  constructor(seeds, threshold) {
    this.seeds = seeds;  // Array de 3+ seeds
    this.threshold = threshold;  // Ex: 2/3
  }

  async createWithdrawal(destination, amount) {
    // Créer transaction
    const tx = this.buildTransaction(destination, amount);
    
    // Requiert signatures de N personnes
    const signatures = [];
    
    for (let i = 0; i < this.threshold; i++) {
      const sig = await this.requestSignature(tx, i);
      signatures.push(sig);
    }
    
    // Combiner signatures
    return this.finalizeMultiSig(tx, signatures);
  }
}
```

---

## 💰 Approvisionner le wallet

### 1. Obtenir l'adresse du wallet casino

```bash
# Lancer le serveur
vercel dev

# Appeler l'API
curl http://localhost:3000/api/admin/casino-stats | jq '.casino.wallet'
```

Ou calculer manuellement :

```javascript
const crypto = require('crypto');
const seed = 'votre_seed_casino';
const sessionId = 'initial_funding';

const hash = crypto
  .createHash('sha256')
  .update(seed + sessionId)
  .digest('hex')
  .substring(0, 40);

const arkAddress = 'ark1qcasino_' + hash;
console.log('Casino Address:', arkAddress);
```

### 2. Acheter des bitcoins

- Montant recommandé initial : **0.01 BTC** (~50,000 sats)
- Via : Kraken, Coinbase, Binance, etc.

### 3. Onboard dans ARK

Via ASP (ARK Service Provider) :

1. Envoyer BTC on-chain à l'ASP
2. ASP crée des vTXOs ARK
3. Transférer vTXOs vers wallet casino

**Processus détaillé :**

```bash
# 1. Envoyer BTC à l'ASP
# (adresse fournie par l'ASP)

# 2. Attendre 1-3 confirmations

# 3. ASP crée vTXOs et les envoie au wallet casino
# via ArkSat ou ARK SDK
```

### 4. Vérifier réception

```bash
# Via API admin
curl http://localhost:3000/api/admin/casino-stats

# Vérifier :
{
  "casino": {
    "wallet": {
      "availableBalance": 50000,
      "totalVTXOs": 5
    }
  }
}
```

---

## 📊 Monitoring

### API Stats

```bash
GET /api/admin/casino-stats
```

Retourne :

```json
{
  "casino": {
    "wallet": {
      "availableBalance": 50000,
      "totalVTXOs": 5
    },
    "health": {
      "healthy": true,
      "coverageRatio": "2.50"
    }
  },
  "players": {
    "totalBalance": 20000,
    "activeCount": 42
  },
  "metrics": {
    "liquidity": 30000,
    "status": "✅ Healthy"
  }
}
```

### Alertes recommandées

**Slack/Discord webhook :**

```javascript
// api/cron/check-liquidity.js (Vercel Cron)
export default async function handler(req, res) {
  const stats = await getCasinoStats();
  
  if (!stats.casino.health.healthy) {
    await fetch(process.env.WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({
        text: `⚠️ Casino low liquidity: ${stats.casino.health.coverageRatio}x`
      })
    });
  }
  
  res.status(200).json({ checked: true });
}
```

**Vercel Cron (vercel.json) :**

```json
{
  "crons": [{
    "path": "/api/cron/check-liquidity",
    "schedule": "0 */6 * * *"
  }]
}
```

### Dashboard monitoring

Créer `public/admin.html` :

```html
<!DOCTYPE html>
<html>
<head>
  <title>BlackjARK Admin</title>
</head>
<body>
  <h1>Casino Stats</h1>
  <div id="stats"></div>
  
  <script>
    async function loadStats() {
      const res = await fetch('/api/admin/casino-stats');
      const data = await res.json();
      
      document.getElementById('stats').innerHTML = `
        <h2>Wallet</h2>
        <p>Balance: ${data.casino.wallet.availableBalance} sats</p>
        <p>vTXOs: ${data.casino.wallet.totalVTXOs}</p>
        
        <h2>Health</h2>
        <p>Status: ${data.metrics.status}</p>
        <p>Coverage: ${data.casino.health.coverageRatio}x</p>
        
        <h2>Players</h2>
        <p>Active: ${data.players.activeCount}</p>
        <p>Total Balance: ${data.players.totalBalance} sats</p>
      `;
    }
    
    loadStats();
    setInterval(loadStats, 30000); // Refresh every 30s
  </script>
</body>
</html>
```

---

## 🔄 Réapprovisionner

Si la balance diminue :

```bash
# 1. Vérifier stats
curl /api/admin/casino-stats | jq '.casino.health'

# Si coverageRatio < 1.5 → Rajouter des fonds

# 2. Acheter BTC
# 3. Onboard ARK via ASP
# 4. Envoyer au wallet casino
# 5. Vérifier réception
```

---

## 🚨 Que faire si la clé est compromise ?

### Procédure d'urgence

1. **Immédiatement** :
   ```bash
   # Désactiver le casino
   # (mettre en mode maintenance)
   ```

2. **Transférer fonds restants** :
   ```bash
   # Vers nouveau wallet sécurisé
   # (créé avec nouveau seed)
   ```

3. **Enquêter** :
   - Vérifier logs Vercel
   - Audit trail AWS/Vault
   - Identifier la breach

4. **Recréer** :
   - Nouveau seed
   - Nouveau wallet
   - Redéployer

5. **Communiquer** :
   - Informer joueurs
   - Plan de compensation

---

## ✅ Checklist Production

- [ ] Seed généré HORS LIGNE
- [ ] Seed noté sur papier (2 copies)
- [ ] Copies stockées dans coffres séparés
- [ ] Seed ajouté dans Vercel (ou AWS/Vault)
- [ ] Wallet approvisionné (min 0.01 BTC)
- [ ] API stats testée
- [ ] Alertes configurées
- [ ] Dashboard admin créé
- [ ] Procédure d'urgence documentée
- [ ] Backup/restore testé

---

**⚡ Sécurité du wallet = Sécurité du casino !**
