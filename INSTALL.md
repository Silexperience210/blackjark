# 🚀 Installation BlackjARK - Guide Rapide

## ⚡ Installation Express (5 minutes)

### 1. Extraire le ZIP
```bash
unzip blackjark-complete.zip
cd blackjark
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement
```bash
cp .env.example .env
```

Édite `.env` avec tes credentials ASP :
```env
ASP_URL=https://your-asp-server.com
ASP_WALLET_ID=your_wallet_id
PORT=3000
```

### 4. Lancer le backend
```bash
npm run dev
```
Backend disponible sur `http://localhost:3000`

### 5. Ouvrir le frontend
```bash
cd public
python3 -m http.server 8000
```

Ouvre ton navigateur : `http://localhost:8000/blackjark-production.html`

**🎉 C'est prêt !**

---

## 🎮 Test Rapide

1. **Vérifie la connexion** (console) :
   ```
   ✅ Session ID: sess_xxx
   💰 Balance: 0 sats
   ```

2. **Test Deposit** :
   - Click "💰 Deposit ARK"
   - Génère une adresse
   - L'adresse doit faire **62 caractères**
   - Elle commence par `ark1q`

3. **Test Withdraw** :
   - Click "💸 Withdraw"
   - Entre une adresse + montant
   - Vérifie la validation

4. **Joue** :
   - Entre 100 sats
   - Click "DEAL"
   - HIT/STAND

---

## 🚀 Déploiement Production

### Vercel (Recommandé)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Configure env vars
vercel env add ASP_URL
vercel env add ASP_WALLET_ID
```

Ton site sera sur : `https://blackjark.vercel.app`

---

## 🧪 Tests

```bash
# Test automatisé
bash test-ultimate.sh

# Résultat attendu
✅ 52/52 tests passed
🎉 SUCCESS!
```

---

## 📂 Fichiers Importants

- `public/blackjark-production.html` - Frontend principal ⭐
- `api/*` - Endpoints backend
- `README.md` - Documentation complète
- `FILE_INDEX.md` - Index de tous les fichiers

---

## 🐛 Problèmes Courants

### API ne répond pas
```bash
# Vérifie que le backend tourne
npm run dev

# Vérifie .env
cat .env
```

### Adresse invalide
L'adresse générée doit :
- Faire 62 caractères
- Commencer par `ark1q`
- Utiliser charset Bech32

Si ce n'est pas le cas, l'API ASP est offline (mode demo).

### Balance ne se met pas à jour
1. Vérifie que le backend tourne
2. Vérifie les credentials ASP dans `.env`
3. Regarde la console (F12) pour les erreurs

---

## 💡 Tips

- **Mode Demo** : Si l'API est offline, le jeu fonctionne en mode demo (balance fictif)
- **Mobile** : Three.js est désactivé automatiquement sur mobile
- **Thèmes** : 5 thèmes disponibles (click sur 🎨)
- **Sound** : Toggle avec le bouton 🔊

---

## 📖 Plus d'Infos

- `PRODUCTION_API.md` - Guide complet des APIs
- `ARK_ADDRESS_FORMAT.md` - Format des adresses
- `BUGFIXES.md` - Corrections effectuées

---

**🎉 Bon jeu ! ⚡**
