# ⚡ Setup BlackjARK avec ASP

## 🎯 Principe

Au lieu de gérer nous-mêmes les clés privées ARK, on utilise un **ASP** (ARK Service Provider) qui fait tout pour nous :

- ✅ Pas de seed à gérer
- ✅ Pas de clés privées
- ✅ Juste une clé API
- ✅ L'ASP gère la sécurité

---

## 🚀 Setup rapide (5 minutes)

### Option 1 : Utiliser Second.tech (Production ready)

#### 1. Créer compte Second

```bash
# Aller sur https://second.tech
# Sign Up
# Vérifier email
```

#### 2. Obtenir clé API

```bash
# Dashboard > API Keys > Create New Key
# Name: "BlackjARK Casino"
# Permissions: Full Access
# Copy: sk_live_abc123...
```

#### 3. Configuration

```bash
# .env
ASP_URL=https://api.second.tech
ASP_API_KEY=sk_live_abc123...
```

#### 4. Approvisionner

```bash
# Dashboard > Wallet > Deposit
# Envoyer BTC on-chain à l'adresse fournie
# Attendre 1-3 confirmations
# L'ASP crée automatiquement des vTXOs
```

#### 5. Tester

```bash
npm install
vercel dev

# Vérifier connexion ASP
curl http://localhost:3000/api/admin/casino-stats
```

**✅ C'est prêt !**

---

### Option 2 : ArkadeOS local (Dev/Test)

#### 1. Cloner ArkadeOS

```bash
git clone https://github.com/ark-network/arkadeos
cd arkadeos
```

#### 2. Configuration

```bash
cp .env.example .env

# Editer .env
NETWORK=regtest
PORT=8080
```

#### 3. Lancer

```bash
docker-compose up -d

# Vérifier
curl http://localhost:8080/v1/ping
```

#### 4. Obtenir clé API

```bash
# Générer token
curl -X POST http://localhost:8080/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"casino","password":"test123"}'

# Résultat : {"token":"sk_test_xyz..."}
```

#### 5. Configuration BlackjARK

```bash
# .env
ASP_URL=http://localhost:8080
ASP_API_KEY=sk_test_xyz...
```

---

## 📋 Checklist Setup

- [ ] Compte ASP créé (Second.tech ou ArkadeOS)
- [ ] Clé API obtenue
- [ ] Variables d'env configurées (`ASP_URL`, `ASP_API_KEY`)
- [ ] ASP approvisionné (min 10,000 sats)
- [ ] Test connexion réussi
- [ ] Dépôt test effectué
- [ ] Retrait test effectué

---

## 💰 Approvisionner l'ASP

### Montant recommandé initial

- **Dev/Test** : 10,000 sats (~$10)
- **Production** : 0.01 BTC (~$500)

### Méthode

1. **Dashboard ASP** → Deposit
2. **Copier adresse Bitcoin** on-chain
3. **Envoyer BTC** depuis Kraken/Coinbase
4. **Attendre confirmations** (1-3)
5. **vTXOs créés** automatiquement par l'ASP

### Vérifier

```bash
curl https://api.second.tech/v1/wallet/balance \
  -H "Authorization: Bearer sk_live_..."

# Résultat
{
  "balance": 10000,
  "vtxos": [...]
}
```

---

## 🔌 APIs disponibles

### Créer adresse

```javascript
const asp = new ASPClient();

const { address, aspId } = await asp.createDepositAddress('casino_alice');

// Résultat
{
  address: "ark1qxyz...",
  aspId: "addr_abc123"
}
```

### Vérifier vTXOs reçus

```javascript
const vtxos = await asp.getAddressVTXOs('addr_abc123');

// Résultat
[
  {
    id: "vtxo_xyz",
    amount: 1000,
    status: "confirmed"
  }
]
```

### Créer transfert

```javascript
const tx = await asp.createTransfer(
  'vtxo_xyz',      // vTXO source
  'ark1qbob...',   // Adresse destination
  800              // Montant
);

// Résultat
{
  txId: "tx_123",
  status: "confirmed",
  instant: true
}
```

---

## 🔐 Sécurité

### Clé API

- ✅ Stockée dans variables d'env Vercel
- ✅ Jamais commitée dans Git
- ✅ Regenerable si compromise
- ✅ Permissions configurables

### Avantages vs Seed

| Aspect | Seed manuel | Clé API ASP |
|--------|-------------|-------------|
| **Si compromis** | Fonds perdus ❌ | Révoquer clé ✅ |
| **Backup** | Papier physique | Pas besoin |
| **Rotation** | Impossible | Facile |
| **Recovery** | Seed requis | Support ASP |

---

## 📊 Monitoring

### Stats casino

```bash
GET /api/admin/casino-stats

{
  "casino": {
    "asp": {
      "balance": 50000,
      "vtxoCount": 5,
      "provider": "second.tech"
    }
  },
  "players": {
    "totalBalance": 20000
  },
  "health": {
    "coverageRatio": "2.50",
    "healthy": true
  }
}
```

### Alertes

```javascript
// Vérifier balance ASP régulièrement
const { balance } = await asp.getCasinoBalance();

if (balance < 10000) {
  sendAlert('ASP balance low: ' + balance);
}
```

---

## 🆘 Troubleshooting

### "ASP error: 401 Unauthorized"

→ Vérifier `ASP_API_KEY` correcte

```bash
echo $ASP_API_KEY
# Doit commencer par sk_live_ ou sk_test_
```

### "ASP non accessible"

→ Vérifier `ASP_URL`

```bash
curl $ASP_URL/v1/ping
```

### "Insufficient ASP balance"

→ Approvisionner l'ASP

```bash
# Dashboard > Deposit
```

---

## 💡 Conseils

### Dev

- Utiliser ArkadeOS local
- Network: regtest
- Pas de frais

### Production

- Utiliser Second.tech
- Network: mainnet
- Frais: ~0.1% par transaction
- Support 24/7

---

## 🎯 Prochaines étapes

1. Obtenir clé ASP
2. Configurer `.env`
3. Approvisionner ASP (10k sats minimum)
4. Tester dépôt/retrait
5. Lancer en production !

---

**⚡ Plus simple qu'avec un seed !**

Pas de gestion de clés privées = moins de risques
