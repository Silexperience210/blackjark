# 📦 BlackjARK - Index des Fichiers

## 🎮 Versions HTML (Frontend)

### ⭐ **blackjark-production.html** (57KB)
**VERSION RECOMMANDÉE POUR PRODUCTION**
- ✅ Vraies APIs ASP intégrées
- ✅ Adresses valides générées (62 chars)
- ✅ Polling automatique des paiements
- ✅ Fallback mode démo si API offline
- ✅ Prêt pour Vercel/Netlify

**Utilisation** :
```bash
# Ouvrir directement dans navigateur
open public/blackjark-production.html

# Ou avec serveur
cd public && python3 -m http.server 8000
# → http://localhost:8000/blackjark-production.html
```

---

### blackjark-ultimate-v3.html (52KB)
**VERSION DEMO**
- Fake addresses (pour tests visuels)
- Pas de vraies APIs
- Bon pour tester le design

---

## 🎨 Assets CSS/JS

### public/blackjark-style.css
CSS principal du projet (40KB)
- Variables CSS (couleurs Arkade)
- Glass morphism
- Animations holographiques
- Responsive breakpoints

### public/blackjark-threejs.js
Background animé Three.js
- Cyberpunk grid 50x50
- Particules flottantes
- Data streams
- pulseEffect()

### public/blackjark-effects.js
Effets visuels
- screenFlash()
- confetti()
- particleBurst()
- shake(), glitch()
- lightningBolt()

### public/blackjark-sounds.js
Système de sons (Web Audio API)
- 8 sons procéduraux
- playCardFlip(), playWin(), playLose()
- playDeal(), playVTXO()
- toggle() on/off

### public/blackjark-achievements.js
10 achievements débloquables
- First Blood, Blackjack Master
- Lucky Streak, High Roller
- The Comeback, Double or Nothing
- localStorage persistence

---

## 🔌 Backend APIs (Serverless)

### api/session.js
`GET /api/session`
- Init session + sessionId
- Charge balance depuis ASP
- Retourne vTXOs existants

### api/deposit.js
`POST /api/deposit`
- Génère vraie adresse ASP
- Crée depositId pour tracking
- Retourne arkAddress (62 chars)

### api/check-payment/[depositId].js
`GET /api/check-payment/[id]`
- Vérifie si vTXOs reçus
- Retourne paid: boolean
- Met à jour balance

### api/withdraw.js
`POST /api/withdraw`
- Valide adresse destination
- Transfère vTXOs via ASP
- Retourne newBalance

### api/game.js
`POST /api/game`
- Enregistre résultat partie
- Sauvegarde hands (dealer+player)
- Sync stats backend

---

## 📚 Documentation

### README.md
Documentation principale
- Installation
- Usage
- APIs
- Déploiement

### PRODUCTION_API.md
Guide complet des APIs
- Flows détaillés (Deposit/Withdraw)
- Exemples de code
- Logs console
- Test checklist

### ARK_ADDRESS_FORMAT.md
Format des adresses ARK
- Structure Bech32 (62 chars)
- Charset valide
- Validation
- Exemples avant/après correction

### BUGFIXES.md
Historique des corrections
- setupCanvas() fixed
- screenFlash() fixed
- Theme selector repositionné
- Adresses 62 chars

### GUIDE_18_AMELIORATIONS.md
Liste des 18 features
- Documentation de chaque feature
- Code snippets
- Statut implémentation

### AMELIORATIONS_PROGRESS.md
Progress tracker
- Checklist 18 features
- Status (completed/pending)

---

## 🧪 Tests

### test-ultimate.sh
Script de test automatisé
- 52 checks automatiques
- Vérifie fichiers, contenu, taille
- Test des 18 features
- Rapport détaillé

**Run** :
```bash
bash test-ultimate.sh
```

---

## 🛠️ Configuration

### package.json
Dependencies :
- axios (API calls)
- cookie-parser (sessions)
- dotenv (env vars)

Scripts :
- `npm run dev` - Lance serveur
- `npm test` - Tests
- `npm run build` - Build production

### vercel.json
Config Vercel
- Serverless functions
- Rewrites /api/* → api/
- Build settings

### .env.example
Variables d'environnement
```env
ASP_URL=https://your-asp-server.com
ASP_WALLET_ID=your_wallet_id
PORT=3000
```

---

## 📦 Lib

### lib/asp-client.js
Client ASP pour vTXOs
- generateAddress()
- checkPayment()
- transfer()
- getBalance()

---

## 📊 Structure Complète

```
blackjark/
├── public/
│   ├── blackjark-production.html    ⭐ MAIN FILE (57KB)
│   ├── blackjark-ultimate-v3.html   Demo (52KB)
│   ├── blackjark-style.css          CSS principal (40KB)
│   ├── blackjark-threejs.js         Three.js background
│   ├── blackjark-effects.js         Effets visuels
│   ├── blackjark-sounds.js          Sound system
│   └── blackjark-achievements.js    10 achievements
│
├── api/
│   ├── session.js                   GET /api/session
│   ├── deposit.js                   POST /api/deposit
│   ├── check-payment/[id].js        GET /api/check-payment/[id]
│   ├── withdraw.js                  POST /api/withdraw
│   └── game.js                      POST /api/game
│
├── lib/
│   └── asp-client.js                Client ASP
│
├── docs/ (ou racine)
│   ├── PRODUCTION_API.md            📖 Guide APIs
│   ├── ARK_ADDRESS_FORMAT.md        📍 Format adresses
│   ├── BUGFIXES.md                  🔧 Corrections
│   ├── GUIDE_18_AMELIORATIONS.md    🎨 18 features
│   └── AMELIORATIONS_PROGRESS.md    Progress tracker
│
├── README.md                        📖 Doc principale
├── FILE_INDEX.md                    📦 Ce fichier
├── test-ultimate.sh                 🧪 Tests auto
├── package.json                     Dependencies
├── vercel.json                      Config Vercel
├── .env.example                     Env template
└── .gitignore                       Git ignore
```

---

## 🎯 Quick Reference

### Pour Tester Localement
```bash
# Frontend
cd public
python3 -m http.server 8000
# → blackjark-production.html

# Backend
npm run dev
# → http://localhost:3000
```

### Pour Déployer
```bash
vercel --prod
# Configure ASP_URL et ASP_WALLET_ID
```

### Pour Tester
```bash
bash test-ultimate.sh
# 52/52 checks ✅
```

---

## 📏 Tailles des Fichiers

| Fichier | Taille | Description |
|---------|--------|-------------|
| blackjark-production.html | 57KB | Version prod complète |
| blackjark-ultimate-v3.html | 52KB | Version demo |
| blackjark-style.css | 40KB | CSS principal |
| blackjark-threejs.js | 8KB | Three.js background |
| blackjark-effects.js | 6KB | Effets visuels |
| blackjark-sounds.js | 4KB | Sound system |
| blackjark-achievements.js | 3KB | Achievements |
| **Total ZIP** | **~150KB** | Archive complète |

---

## ✅ Checklist Utilisation

**Frontend** :
- [ ] Ouvrir `blackjark-production.html`
- [ ] Vérifier connexion API (console)
- [ ] Tester deposit (adresse 62 chars)
- [ ] Tester withdraw
- [ ] Jouer une partie
- [ ] Vérifier stats modal

**Backend** :
- [ ] `npm install`
- [ ] Configurer `.env`
- [ ] `npm run dev`
- [ ] Tester `/api/session`
- [ ] Tester `/api/deposit`

**Déploiement** :
- [ ] Push sur GitHub
- [ ] Deploy Vercel
- [ ] Configurer env vars
- [ ] Test production

---

**🎉 TOUT EST DANS CE ZIP ! Prêt pour production ! 🚀**
