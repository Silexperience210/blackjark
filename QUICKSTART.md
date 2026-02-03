# ⚡ QUICKSTART - Casino ARK

## 5 Minutes Setup

### 1. Lancer ARK Introspector (Local)

```bash
# Terminal 1
git clone https://github.com/ArkLabsHQ/introspector.git
cd introspector

# Générer clé
export INTROSPECTOR_SECRET_KEY=$(openssl rand -hex 32)
export INTROSPECTOR_NETWORK=regtest
export INTROSPECTOR_PORT=7073

# Build & Run
make build
./introspector
```

Introspector tourne sur `http://localhost:7073` ✅

### 2. Lancer Casino (Local)

```bash
# Terminal 2
cd satoshi-casino-ark
npm install

# Config locale
cat > .env << EOF
ARK_INTROSPECTOR_URL=http://localhost:7073
ARK_NETWORK=regtest
EOF

# Dev server Vercel
vercel dev
```

Casino accessible sur `http://localhost:3000` ✅

### 3. Tester

1. Ouvrir http://localhost:3000
2. Cliquer "💰 Déposer"
3. Générer adresse ARK
4. (Simuler paiement en dev)
5. Jouer au Blackjack

## Déploiement Production (10 minutes)

### Étape 1 : ARK Introspector sur VPS

```bash
# SSH sur votre serveur
ssh user@votre-vps.com

# Quick install
curl -fsSL https://raw.githubusercontent.com/USERNAME/satoshi-casino-ark/main/scripts/install-introspector.sh | bash

# Ou manuel :
git clone https://github.com/ArkLabsHQ/introspector.git
cd introspector
export INTROSPECTOR_SECRET_KEY=$(openssl rand -hex 32)
export INTROSPECTOR_NETWORK=testnet
make build
./introspector
```

Accessible sur `http://VOTRE_IP:7073` ✅

### Étape 2 : Casino sur Vercel

```bash
# Push sur GitHub
cd satoshi-casino-ark
git init
git add .
git commit -m "Initial"
git remote add origin https://github.com/USERNAME/satoshi-casino-ark.git
git push -u origin main
```

Sur [vercel.com](https://vercel.com) :

1. **New Project** → Import repo
2. **Add Integration** → Vercel KV
3. **Environment Variables** :
   - `ARK_INTROSPECTOR_URL` = `http://VOTRE_IP:7073`
   - `ARK_NETWORK` = `testnet`
4. **Deploy** !

En ligne sur `https://votre-projet.vercel.app` ✅

## Commandes Utiles

```bash
# Vérifier introspector
curl http://localhost:7073/v1/info

# Logs introspector
sudo journalctl -u ark-introspector -f

# Logs Vercel
vercel logs

# Redéployer
git push  # Auto redeploy sur Vercel

# KV Shell (debug)
vercel env pull
```

## Architecture Simple

```
[Frontend]
    ↓
[Vercel APIs] → [Vercel KV]
    ↓
[ARK Introspector] → [Bitcoin]
```

## Flux de Paiement

```
Dépôt:
1. User → BTC on-chain
2. 1 conf → vTXO créé
3. Balance ++

Jeu:
1. Mise 100 sats
2. Résultat (win/lose/push)
3. vTXO local update

Retrait:
1. User → adresse BTC
2. Intent proof signé
3. vTXO → BTC on-chain
```

## Configuration Minimale

### .env (dev)

```bash
ARK_INTROSPECTOR_URL=http://localhost:7073
ARK_NETWORK=regtest
```

### Vercel (prod)

Variables d'environnement :
- `ARK_INTROSPECTOR_URL`
- `ARK_NETWORK`
- KV auto-configuré

## FAQ Rapide

**Q: Différence avec Lightning ?**  
A: Pas de channels, pas de liquidité entrante, exit garanti.

**Q: Combien ça coûte ?**  
A: Vercel gratuit + VPS $5/mois.

**Q: Production ready ?**  
A: C'est une démo. Pour production, implémenter vraie logique vTXO.

**Q: Wallet compatible ?**  
A: ArkSat wallet Chrome extension.

**Q: Mainnet ok ?**  
A: Oui, changer `ARK_NETWORK=mainnet` partout.

## Ressources

- **ARK Introspector** : https://github.com/ArkLabsHQ/introspector
- **ArkSat Wallet** : Chrome Web Store
- **Bitcoin DevKit** : Pour implémentation complète
- **Vercel Docs** : https://vercel.com/docs

## Prochaines Étapes

1. Implémenter vraie logique vTXO (bitcoinjs-lib)
2. Intégration wallet ArkSat
3. Monitoring production
4. Multi-tables
5. Stats dashboard

---

**⚡ C'est parti !**
