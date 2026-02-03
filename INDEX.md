# ⚡ Satoshi Casino ARK - Version complète

Casino Blackjack multi-joueurs fonctionnant sur le **protocole ARK** (au lieu de Lightning Network).

## 📁 Contenu du projet

```
satoshi-casino-ark/
├── api/                      # Serverless functions Vercel
│   ├── ark-client.js        # Client ARK Introspector
│   ├── session.js           # Gestion sessions + vTXOs
│   ├── deposit.js           # Créer adresse de dépôt
│   ├── check-payment/       # Vérifier dépôt + créer vTXO
│   ├── withdraw.js          # Retrait via Intent Proof
│   ├── game.js              # Enregistrer parties
│   └── balance.js           # Solde + vTXOs
│
├── public/
│   └── index.html           # Frontend avec support ARK
│
├── README.md                # Documentation principale
├── QUICKSTART.md            # Guide rapide 5 minutes
├── DEPLOY.md                # Guide de déploiement production
├── MIGRATION.md             # Changements Lightning → ARK
├── TODO.md                  # Roadmap implémentation production
├── EXAMPLES.md              # Exemples concrets d'utilisation
│
├── package.json             # Dépendances Node.js
├── vercel.json              # Configuration Vercel
├── .env.example             # Variables d'environnement
└── .gitignore
```

## 🎯 Qu'est-ce qu'ARK ?

ARK est un protocole Bitcoin Layer 2 qui utilise des **vTXOs (Virtual Transaction Outputs)** pour permettre :

- ✅ Transactions instantanées sans channels Lightning
- ✅ Pas de problème de liquidité entrante
- ✅ Exit unilatéral garanti (après 4 semaines)
- ✅ Confidentialité via CoinJoin automatique
- ✅ Compatible Bitcoin on-chain

## 🚀 Démarrage rapide

### Option 1 : Test local (5 minutes)

```bash
# 1. Lancer ARK Introspector
git clone https://github.com/ArkLabsHQ/introspector.git
cd introspector
export INTROSPECTOR_SECRET_KEY=$(openssl rand -hex 32)
export INTROSPECTOR_NETWORK=regtest
make build && ./introspector

# 2. Lancer casino
cd satoshi-casino-ark
npm install
vercel dev
```

Ouvrir http://localhost:3000

### Option 2 : Déploiement production (10 minutes)

Voir le guide détaillé dans [QUICKSTART.md](./QUICKSTART.md)

1. Héberger ARK Introspector sur VPS
2. Push code sur GitHub
3. Déployer sur Vercel
4. Configurer Vercel KV
5. C'est en ligne !

## 📖 Documentation

| Fichier | Description |
|---------|-------------|
| **README.md** | Documentation complète du projet |
| **QUICKSTART.md** | Setup rapide en 5-10 minutes |
| **DEPLOY.md** | Guide de déploiement production détaillé |
| **MIGRATION.md** | Tous les changements Lightning → ARK |
| **TODO.md** | Roadmap pour version production complète |
| **EXAMPLES.md** | Exemples concrets et cas d'usage |

## 🔧 Différences avec Lightning

| Aspect | Lightning (LNbits) | ARK (Introspector) |
|--------|-------------------|-------------------|
| **Dépôt** | Invoice Lightning | Adresse Bitcoin on-chain |
| **Confirmation** | Instantané | 1 confirmation (~10 min) |
| **Channels** | Requis | Non requis |
| **Liquidité** | Problème majeur | Pas de problème |
| **Retrait** | Pay invoice | Intent proof + broadcast |
| **Exit** | Nécessite coopération | Garanti unilatéralement |
| **Confidentialité** | Limitée | CoinJoin automatique |

## ⚠️ État actuel

Ce code est une **démonstration fonctionnelle** avec :

- ✅ Structure API complète ARK
- ✅ Frontend avec support vTXOs
- ✅ Intégration Vercel KV
- ✅ Documentation exhaustive
- ❌ Logique vTXO simulée (pas de vraies signatures)
- ❌ Pas de PSBT réels
- ❌ Pas de validation blockchain

Pour la production, voir [TODO.md](./TODO.md) pour implémenter :

1. Vraie génération vTXOs avec bitcoinjs-lib
2. Signatures Schnorr réelles
3. Validation blockchain complète
4. Monitoring et sécurité
5. Tests unitaires & e2e

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │  (HTML/JS/CSS)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Vercel APIs │  (Serverless Node.js)
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐  ┌──────────────┐
│ Vercel KV   │  │ ARK          │
│ (Redis)     │  │ Introspector │
└─────────────┘  └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Bitcoin    │
                 │  Blockchain  │
                 └──────────────┘
```

## 🎮 Flux utilisateur

1. **Dépôt** : User envoie BTC on-chain → Adresse générée → 1 conf → vTXO créé
2. **Jeu** : Micro-transactions entre vTXOs (off-chain, instantané)
3. **Retrait** : vTXOs → Intent proof signé → BTC on-chain

## 💡 Exemples

### Créer un dépôt

```javascript
POST /api/deposit
{
  "amount": 1000  // satoshis
}

→ {
    "address": "bc1pxxx...",
    "qrCode": "bitcoin:bc1pxxx...?amount=0.00001"
  }
```

### Vérifier paiement

```javascript
GET /api/check-payment/bc1pxxx

→ {
    "paid": true,
    "vtxoId": "vtxo_abc123",
    "confirmations": 1
  }
```

### Retirer

```javascript
POST /api/withdraw
{
  "address": "bc1qyyy...",
  "amount": 800
}

→ {
    "txid": "f4a3b2...",
    "status": "submitted"
  }
```

Voir [EXAMPLES.md](./EXAMPLES.md) pour des exemples complets.

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3, Vanilla JavaScript
- **Backend** : Node.js, Vercel Serverless Functions
- **Database** : Vercel KV (Redis)
- **Bitcoin** : bitcoinjs-lib, BIP32, BIP39
- **ARK** : Introspector API (gRPC/HTTP)
- **Hosting** : Vercel (gratuit jusqu'à 100k requêtes/mois)

## 🔐 Sécurité

- **Exit garanti** : Transaction de forfeit après 4 semaines
- **Signatures Schnorr** : Pour tous les vTXOs
- **Timelock relatif** : Protection contre introspector malveillant
- **CoinJoin** : Confidentialité des transactions

Pour la production, implémenter aussi :
- Rate limiting
- CSRF protection
- Input validation
- Monitoring et alertes

## 📊 Coûts

### Hébergement

- **Vercel** : Gratuit (ou $20/mois Pro si besoin)
- **VPS** (introspector) : $5-10/mois
- **Domaine** : $10-15/an

**Total** : ~$10/mois en production

### Limites gratuites Vercel

- 100 GB bandwidth/mois
- 100 GB-hrs functions
- 3000 KV requests/jour
- 256 MB storage

Largement suffisant pour des milliers de joueurs !

## 🧪 Tests

```bash
# Test unitaires (à implémenter)
npm test

# Test e2e (à implémenter)
npm run test:e2e

# Linter
npm run lint
```

## 🌐 Ressources ARK

- **Introspector** : https://github.com/ArkLabsHQ/introspector
- **ArkSat Wallet** : https://chromewebstore.google.com/detail/arksat-wallet/...
- **ARK Docs** : https://arkdev.info
- **Bitcoin DevKit** : Pour implémentation complète

## 🤝 Contribution

Ce projet est open-source. Pour contribuer :

1. Fork le repo
2. Créer une branche feature
3. Commit tes changements
4. Push et ouvrir une PR

## 📝 Licence

MIT License - Utilisation libre

## 🎯 Prochaines étapes

1. Lire [QUICKSTART.md](./QUICKSTART.md) pour setup rapide
2. Tester localement avec regtest
3. Lire [TODO.md](./TODO.md) pour roadmap production
4. Implémenter vraie logique vTXO
5. Déployer en testnet puis mainnet

## 💬 Support

Questions ? Ouvre une issue sur GitHub !

---

**⚡ Fait avec ARK Protocol - Second-layer Bitcoin sans channels**

🎰 Casino créé par Silex | 2025
