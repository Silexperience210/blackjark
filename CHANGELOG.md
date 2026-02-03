# 📝 CHANGELOG - Satoshi Casino ARK

## Version 1.0.0 - Migration Lightning → ARK (2025-02-03)

### ✨ Nouveautés

#### Protocole ARK
- **vTXOs** : Remplacement complet des invoices Lightning par des Virtual Transaction Outputs
- **Intent Proofs** : Système de preuve d'intention pour les transactions ARK
- **Forfeit Transactions** : Exit unilatéral garanti après 4 semaines
- **Introspector Integration** : Client complet pour ARK Introspector API

#### APIs modifiées
- `POST /api/deposit` : Génère maintenant une adresse Bitcoin on-chain au lieu d'une invoice LN
- `GET /api/check-payment/:address` : Vérifie confirmations blockchain + création vTXO (au lieu de webhook LNbits)
- `POST /api/withdraw` : Crée intent proof ARK au lieu de payer une invoice Lightning
- `POST /api/game` : Enregistre transactions vTXO locales
- `GET /api/balance` : Affiche vTXOs en plus du solde

#### Frontend
- **Badge protocole** : "Powered by ARK Protocol" au lieu de Lightning
- **Affichage vTXOs** : Nombre de vTXOs actifs dans les stats
- **Modal Info ARK** : Explication du protocole ARK pour les utilisateurs
- **QR Codes Bitcoin** : Format `bitcoin:address?amount=...` au lieu de `lightning:invoice`
- **Polling confirmations** : Vérification automatique des dépôts toutes les 10 secondes

#### Base de données (Vercel KV)
- **Structure joueur étendue** :
  - `arkVtxos[]` : Liste des vTXOs possédés
  - `pendingDeposits[]` : Dépôts en attente de confirmation
  - `arkAddress` : Adresse ARK dérivée du joueur
  
- **Nouveaux types d'entrées** :
  - `deposit:address` : Dépôts on-chain
  - `vtxo:id` : Métadonnées vTXO
  - `tx:id` : Historique transactions ARK

### 🔧 Changements techniques

#### Dépendances ajoutées
```json
{
  "bitcoinjs-lib": "^6.1.5",
  "bip32": "^4.0.0",
  "bip39": "^3.1.0",
  "tiny-secp256k1": "^2.2.3"
}
```

#### Variables d'environnement
```bash
# AVANT
LNBITS_URL=...
LNBITS_ADMIN_KEY=...
LNBITS_INVOICE_KEY=...

# APRÈS
ARK_INTROSPECTOR_URL=...
ARK_NETWORK=regtest|testnet|mainnet
```

#### Architecture
```
AVANT: Frontend → Vercel → LNbits → Lightning Network
APRÈS: Frontend → Vercel → ARK Introspector → Bitcoin Blockchain
```

### 🗑️ Suppressions

- ❌ Client LNbits
- ❌ Webhooks LNbits
- ❌ Variables `LNBITS_*`
- ❌ Logique Lightning channels
- ❌ Gestion liquidité entrante

### 📚 Documentation

Nouveaux fichiers :
- `README.md` : Documentation complète
- `QUICKSTART.md` : Setup rapide 5-10 minutes
- `DEPLOY.md` : Guide déploiement production
- `MIGRATION.md` : Détails changements Lightning → ARK
- `TODO.md` : Roadmap implémentation production
- `EXAMPLES.md` : Exemples concrets d'utilisation
- `INDEX.md` : Vue d'ensemble du projet
- `CHANGELOG.md` : Ce fichier

### ⚠️ Breaking Changes

- **Format de dépôt** : Les anciennes invoices Lightning ne sont plus supportées
- **Retour API** : Structure modifiée pour tous les endpoints
- **Cookies** : Nouveaux champs dans la session (`arkVtxos`, `pendingDeposits`)
- **Frontend** : Nécessite adaptation pour afficher vTXOs

### 🐛 Bugs connus

- ⚠️ Logique vTXO simulée (pas de PSBT réels)
- ⚠️ Pas de validation blockchain
- ⚠️ Pas de vraies signatures Schnorr
- ⚠️ Monitoring basique seulement

Voir [TODO.md](./TODO.md) pour la roadmap production.

### 🔮 Roadmap v2.0

- [ ] Implémentation vraie génération vTXOs
- [ ] Signatures Schnorr avec bitcoinjs-lib
- [ ] Validation PSBT complète
- [ ] Monitoring blockchain real-time
- [ ] Intégration wallet ArkSat
- [ ] Dashboard admin
- [ ] Tests unitaires & e2e
- [ ] CI/CD complet

---

## Crédits

### Projet original
- **Satoshi Casino Lightning** : Version initiale avec LNbits
- Auteur : Silex
- Repo : https://github.com/Silexemple/satoshi-casino21

### Migration ARK
- **Satoshi Casino ARK** : Version ARK Protocol
- Migration : 2025-02-03
- Auteur : Silex
- Stack : Vercel + ARK Introspector + Bitcoin

### Technologies utilisées

#### Bitcoin Layer 2
- **ARK Protocol** : https://arkdev.info
- **ARK Introspector** : https://github.com/ArkLabsHQ/introspector
- **ArkSat Wallet** : Extension Chrome pour ARK

#### Bitcoin Core
- **bitcoinjs-lib** : Bibliothèque Bitcoin JavaScript
- **BIP32** : Dérivation de clés HD
- **BIP39** : Mnémonique seeds
- **tiny-secp256k1** : Courbe elliptique secp256k1

#### Infrastructure
- **Vercel** : Hosting serverless + KV database
- **Node.js** : Runtime backend
- **Redis** : Base de données (via Vercel KV)

#### Frontend
- **HTML5/CSS3** : Interface utilisateur
- **Vanilla JavaScript** : Pas de framework (simplicité)

### Ressources

- **ARK Protocol Whitepaper** : https://arkdev.info/whitepaper
- **Bitcoin Script Reference** : https://bitcoinjs-lib.org
- **Taproot BIP** : https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki
- **Vercel Docs** : https://vercel.com/docs

### Inspiration

Ce projet s'inspire de :
- SatoshiDice (premier casino Bitcoin)
- Lightning Network casinos
- ARK protocol research
- BitRent (autre projet Silex)

### Communauté

- **Bitcoin Developers** : Pour les specs techniques
- **ARK Labs** : Pour le protocole ARK
- **Vercel Team** : Pour la plateforme serverless
- **CyberHornet** : Équipe de Silex

### License

MIT License

Copyright (c) 2025 Silex

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Remerciements

Merci à :
- **Satoshi Nakamoto** : Pour Bitcoin
- **ARK Labs Team** : Pour le protocole ARK
- **Burak (ARK)** : Pour l'introspector
- **Vercel** : Pour le hosting gratuit
- **Bitcoin Core devs** : Pour les outils
- **La communauté Bitcoin** : Pour le support

### Contact

- **GitHub** : https://github.com/Silexemple
- **Twitter** : @Silexperience
- **Team** : CyberHornet

---

**⚡ Version 1.0.0 - ARK Protocol Integration** 

*"Introspection is all you need"* - ARK Labs
