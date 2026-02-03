# 🚀 Déploiement BlackjARK sur GitHub + Vercel

## 📋 Workflow Identique à Lightning Casino 21

Ce guide te permet de déployer BlackjARK avec le même workflow automatique que Lightning Casino 21 : **Push sur GitHub → Vercel deploy automatiquement**.

---

## 🎯 Architecture de Déploiement

```
GitHub Repository
     ↓
  git push
     ↓
Vercel Auto-Deploy ⚡
     ↓
https://blackjark.vercel.app
```

---

## 📝 Étape 1 : Préparer le Projet

### 1.1 Structure Vérifiée ✅

```
blackjark/
├── public/
│   └── blackjark-production.html  ← Page principale (/)
├── api/
│   ├── session.js
│   ├── deposit.js
│   ├── check-payment/
│   │   └── [depositId].js
│   ├── withdraw.js
│   └── game.js
├── lib/
│   └── asp-client.js
├── vercel.json                     ← Config Vercel ✅
├── package.json                    ← Dependencies ✅
└── README.md
```

### 1.2 Fichier `vercel.json` ✅

```json
{
  "version": 2,
  "name": "blackjark",
  "builds": [
    {
      "src": "public/blackjark-production.html",
      "use": "@vercel/static"
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/public/blackjark-production.html"
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "env": {
    "ASP_URL": "@asp_url",
    "ASP_WALLET_ID": "@asp_wallet_id",
    "ARK_NETWORK": "@ark_network"
  },
  "github": {
    "enabled": true,
    "autoAlias": true
  }
}
```

✅ **Déjà configuré dans le projet !**

---

## 🐙 Étape 2 : Push sur GitHub

### 2.1 Créer le repo GitHub

```bash
# Va sur GitHub.com
# Click "New Repository"
# Nom: blackjark
# Description: Ultimate vTXO Casino on ARK Protocol
# Public ou Private (au choix)
# Ne coche RIEN (pas de README, .gitignore, etc.)
# Click "Create repository"
```

### 2.2 Initialiser Git localement

```bash
cd blackjark

# Init git (si pas déjà fait)
git init

# Ajouter remote
git remote add origin https://github.com/TON_USERNAME/blackjark.git

# Vérifier
git remote -v
```

### 2.3 Premier commit

```bash
# Ajouter tous les fichiers
git add .

# Commit
git commit -m "🎰 Initial commit - BlackjARK Ultimate Casino

✨ Features:
- Blackjack complet (Hit/Stand/Double)
- Vraies APIs ASP intégrées
- Deposit/Withdraw instantanés
- Polling automatique
- 10 achievements
- 5 thèmes cyberpunk
- Responsive mobile
- Ready for production

⚡ Powered by ARK Protocol"

# Push
git push -u origin main
```

**✅ Ton code est maintenant sur GitHub !**

---

## 🚀 Étape 3 : Connecter Vercel

### 3.1 Import depuis GitHub

1. Va sur [vercel.com](https://vercel.com)
2. Click **"Add New..." → "Project"**
3. Click **"Import Git Repository"**
4. Cherche **"blackjark"** dans tes repos
5. Click **"Import"**

### 3.2 Configuration du Projet

**Framework Preset** : `Other`

**Root Directory** : `./` (laisser vide)

**Build Command** : (laisser vide)

**Output Directory** : `public`

**Install Command** : `npm install`

### 3.3 Variables d'Environnement

Click **"Environment Variables"** et ajoute :

| Name | Value | Environments |
|------|-------|--------------|
| `ASP_URL` | `https://your-asp-server.com` | Production |
| `ASP_WALLET_ID` | `your_wallet_id` | Production |
| `ARK_NETWORK` | `testnet` ou `mainnet` | Production |

**Important** : Ces variables peuvent aussi être des secrets Vercel :
```bash
vercel secrets add asp_url "https://your-asp-server.com"
vercel secrets add asp_wallet_id "your_wallet_id"
vercel secrets add ark_network "testnet"
```

### 3.4 Deploy !

Click **"Deploy"**

Vercel va :
1. ✅ Clone ton repo GitHub
2. ✅ Install dependencies (`npm install`)
3. ✅ Build les serverless functions (api/*)
4. ✅ Deploy les static files (public/*)
5. ✅ Générer l'URL : `https://blackjark.vercel.app`

**⏱️ Temps : ~2 minutes**

---

## 🔄 Étape 4 : Auto-Deploy (Workflow)

### 4.1 Comment ça marche

Maintenant, **à chaque push sur GitHub** :

```bash
git add .
git commit -m "🎨 Update design"
git push
```

Vercel va automatiquement :
1. 🔍 Détecter le push
2. 🏗️ Build le projet
3. 🚀 Deploy en production
4. ✅ URL mise à jour : `https://blackjark.vercel.app`

**C'est automatique ! 🎉**

### 4.2 Branches

- `main` → Production (`https://blackjark.vercel.app`)
- `dev` → Preview (`https://blackjark-git-dev.vercel.app`)
- Feature branches → Unique preview URL

### 4.3 Rollback

Si un deploy casse quelque chose :

1. Va sur Vercel Dashboard
2. Click **"Deployments"**
3. Trouve le dernier deploy qui fonctionnait
4. Click **"⋯" → "Promote to Production"**

**Instant rollback ! ⚡**

---

## 🎯 Étape 5 : Tester le Deploy

### 5.1 Accéder au site

Ouvre : `https://blackjark.vercel.app`

### 5.2 Vérifier les APIs

Ouvre la console (F12) et vérifie :

```
✅ Session ID: sess_xxx
💰 Balance: 0 sats
📦 vTXOs: 0
```

### 5.3 Test Deposit

1. Click "💰 Deposit ARK"
2. Génère une adresse
3. **Vérifie qu'elle fait 62 caractères**
4. Elle doit commencer par `ark1q`

Si l'adresse est valide → **APIs ASP fonctionnent !** ✅

### 5.4 Vérifier les Logs

Sur Vercel Dashboard :
1. Click sur ton projet
2. Click **"Deployments" → dernier deploy**
3. Click **"Functions"**
4. Click sur une fonction (ex: `api/session`)
5. Voir les logs en temps réel

---

## 📋 Checklist Finale

### Avant de push sur GitHub :
- [ ] `vercel.json` configuré ✅ (déjà fait)
- [ ] `package.json` à jour ✅ (déjà fait)
- [ ] `.gitignore` présent ✅
- [ ] `.env` NOT committed (secrets)
- [ ] `README.md` à jour ✅

### Après le premier deploy :
- [ ] URL fonctionne
- [ ] APIs répondent
- [ ] Variables d'env configurées
- [ ] Deposit génère vraie adresse
- [ ] Logs Vercel accessibles

### Workflow continu :
- [ ] Chaque push → auto-deploy ✅
- [ ] Preview URLs pour branches
- [ ] Rollback possible
- [ ] Logs en temps réel

---

## 🔧 Commandes Utiles

### Vercel CLI

```bash
# Install
npm i -g vercel

# Login
vercel login

# Deploy manuellement
vercel --prod

# Voir les logs
vercel logs

# Lister les deployments
vercel ls

# Variables d'env
vercel env ls
vercel env add ASP_URL
vercel env rm ASP_URL
```

### Git

```bash
# Status
git status

# Commit rapide
git add . && git commit -m "Update" && git push

# Créer une branche
git checkout -b feature/new-theme

# Merger
git checkout main
git merge feature/new-theme
git push

# Rollback commit
git revert HEAD
git push
```

---

## 🌐 URLs Finales

| Environment | URL | Branch |
|-------------|-----|--------|
| **Production** | `https://blackjark.vercel.app` | `main` |
| Preview (dev) | `https://blackjark-git-dev.vercel.app` | `dev` |
| PR Preview | `https://blackjark-pr-123.vercel.app` | feature/* |

---

## 🐛 Troubleshooting

### Deploy échoue

**1. Check les logs Vercel**
```
Deployments → Click sur deploy → View Function Logs
```

**2. Variables d'env manquantes**
```bash
vercel env ls
# Ajouter celles qui manquent
vercel env add ASP_URL
```

**3. Build errors**
```bash
# Test local
npm install
npm run dev
```

### APIs ne répondent pas

**1. Vérifier les env vars**
```
Vercel Dashboard → Settings → Environment Variables
```

**2. Check ASP_URL**
```bash
curl https://your-asp-server.com/health
```

**3. Logs des functions**
```
Vercel → Functions → Click sur api/session → Logs
```

### Adresses invalides

Si les adresses générées ne font pas 62 chars :
- ✅ Vérifier `ASP_URL` dans env vars
- ✅ Vérifier que l'ASP est accessible
- ✅ Check les logs de `api/deposit`

---

## 🎉 C'est Tout !

### Workflow Final

```
1. Code localement
2. git add . && git commit -m "..." && git push
3. Vercel deploy automatiquement
4. Teste sur https://blackjark.vercel.app
5. Rollback si besoin
```

**Exactement le même workflow que Lightning Casino 21 ! ⚡**

---

## 📚 Ressources

- [Vercel Docs](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🚀 Ready to Deploy !

```bash
# 1. Push sur GitHub
git push -u origin main

# 2. Import dans Vercel
vercel.com → Import → blackjark

# 3. Configure env vars
ASP_URL, ASP_WALLET_ID, ARK_NETWORK

# 4. Deploy !
# → https://blackjark.vercel.app ✅
```

**C'est parti ! 🎰⚡🔥**
