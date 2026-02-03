# 🚧 TODO - Implémentation Production ARK

Ce fichier liste toutes les étapes pour transformer ce POC en casino ARK production-ready.

## ⚠️ État actuel (POC)

Le code actuel est une **démonstration** avec logique simulée :

- ✅ Structure API complète
- ✅ Frontend fonctionnel
- ✅ Intégration Vercel KV
- ❌ Pas de vraie génération vTXO
- ❌ Pas de PSBT réels
- ❌ Pas de signatures Schnorr
- ❌ Pas de validation blockchain

## 🎯 Roadmap Production

### Phase 1 : Bitcoin Core (2-3 jours)

#### 1.1 - Implémentation bitcoinjs-lib

**Fichier** : `api/bitcoin-utils.js`

```javascript
const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');

const bip32 = BIP32Factory(ecc);

// Générer clé maître
function generateMasterKey(seed) {
  const masterNode = bip32.fromSeed(Buffer.from(seed, 'hex'));
  return masterNode;
}

// Dériver adresse pour dépôt
function deriveDepositAddress(masterKey, index, network) {
  const child = masterKey.derivePath(`m/86'/0'/0'/0/${index}`);
  const { address } = bitcoin.payments.p2tr({
    internalPubkey: child.publicKey.slice(1, 33),
    network
  });
  return address;
}

// Créer PSBT pour vTXO
function createVtxoPSBT(inputs, outputs, network) {
  const psbt = new bitcoin.Psbt({ network });
  
  inputs.forEach(input => {
    psbt.addInput({
      hash: input.txid,
      index: input.vout,
      witnessUtxo: {
        script: input.scriptPubKey,
        value: input.value
      }
    });
  });
  
  outputs.forEach(output => {
    psbt.addOutput({
      address: output.address,
      value: output.value
    });
  });
  
  return psbt.toBase64();
}

module.exports = {
  generateMasterKey,
  deriveDepositAddress,
  createVtxoPSBT
};
```

**TODO** :
- [ ] Installer bitcoinjs-lib, bip32, tiny-secp256k1
- [ ] Créer générateur de clés HD
- [ ] Implémenter dérivation Taproot (BIP86)
- [ ] Tester génération adresses
- [ ] Valider contre testnet

#### 1.2 - Intégration Bitcoin Core RPC

**Fichier** : `api/bitcoin-rpc.js`

```javascript
const fetch = require('node-fetch');

class BitcoinRPC {
  constructor(url, user, pass) {
    this.url = url;
    this.auth = Buffer.from(`${user}:${pass}`).toString('base64');
  }

  async call(method, params = []) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '1.0',
        id: Date.now(),
        method,
        params
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.result;
  }

  // Importer adresse de dépôt
  async importAddress(address, label) {
    return this.call('importaddress', [address, label, false]);
  }

  // Vérifier solde d'une adresse
  async getReceivedByAddress(address, minconf = 1) {
    return this.call('getreceivedbyaddress', [address, minconf]);
  }

  // Broadcaster transaction
  async sendRawTransaction(hex) {
    return this.call('sendrawtransaction', [hex]);
  }

  // Obtenir UTXO
  async listUnspent(addresses, minconf = 1) {
    return this.call('listunspent', [minconf, 9999999, addresses]);
  }
}

module.exports = BitcoinRPC;
```

**TODO** :
- [ ] Setup Bitcoin Core (testnet)
- [ ] Implémenter RPC client
- [ ] Tester import adresses
- [ ] Tester broadcast transactions
- [ ] Monitorer mempool

### Phase 2 : ARK Protocol (3-5 jours)

#### 2.1 - Structures vTXO réelles

**Fichier** : `api/vtxo-manager.js`

```javascript
class VTXOManager {
  constructor(bitcoinRPC, masterKey) {
    this.rpc = bitcoinRPC;
    this.masterKey = masterKey;
    this.vtxos = new Map();
  }

  // Créer vTXO depuis UTXO on-chain
  async createVTXO(utxo, owner) {
    const vtxoId = this.generateVTXOId(utxo);
    
    const vtxo = {
      id: vtxoId,
      txid: utxo.txid,
      vout: utxo.vout,
      amount: utxo.amount,
      owner,
      script: utxo.scriptPubKey,
      createdAt: Date.now(),
      spent: false,
      forfeitTx: await this.createForfeitTx(utxo)
    };
    
    this.vtxos.set(vtxoId, vtxo);
    return vtxo;
  }

  // Créer transaction de forfeit (exit unilatéral)
  async createForfeitTx(utxo) {
    // Timelock relatif de 4 semaines (4032 blocks)
    const sequence = 4032;
    
    const psbt = new bitcoin.Psbt({ network });
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      sequence,
      witnessUtxo: {
        script: utxo.scriptPubKey,
        value: utxo.amount
      }
    });
    
    // Output vers adresse du propriétaire
    psbt.addOutput({
      address: this.getOwnerAddress(utxo.owner),
      value: utxo.amount - 1000  // Moins frais
    });
    
    return psbt.toBase64();
  }

  // Dépenser vTXOs (créer intent proof)
  async spendVTXOs(vtxoIds, destination, amount) {
    const selectedVTXOs = vtxoIds.map(id => this.vtxos.get(id));
    const totalInput = selectedVTXOs.reduce((sum, v) => sum + v.amount, 0);
    
    if (totalInput < amount) {
      throw new Error('Insufficient vTXO balance');
    }
    
    const psbt = new bitcoin.Psbt({ network });
    
    // Ajouter vTXOs comme inputs
    selectedVTXOs.forEach(vtxo => {
      psbt.addInput({
        hash: vtxo.txid,
        index: vtxo.vout,
        witnessUtxo: {
          script: vtxo.script,
          value: vtxo.amount
        }
      });
    });
    
    // Output vers destination
    psbt.addOutput({
      address: destination,
      value: amount
    });
    
    // Change (nouveau vTXO si nécessaire)
    const change = totalInput - amount - 500;  // Frais
    if (change > 546) {  // Dust limit
      psbt.addOutput({
        address: this.getOwnerAddress(selectedVTXOs[0].owner),
        value: change
      });
    }
    
    return {
      proof: psbt.toBase64(),
      vtxos: selectedVTXOs.map(v => v.id)
    };
  }
}

module.exports = VTXOManager;
```

**TODO** :
- [ ] Implémenter VTXO manager
- [ ] Créer forfeit transactions
- [ ] Gérer sélection vTXOs (coin selection)
- [ ] Implémenter change management
- [ ] Tester timelock relatifs

#### 2.2 - Intégration ARK Introspector

**Fichier** : `api/ark-client.js` (mise à jour complète)

```javascript
const fetch = require('node-fetch');
const bitcoin = require('bitcoinjs-lib');

class ArkClient {
  constructor(introspectorUrl, vtxoManager) {
    this.introspectorUrl = introspectorUrl;
    this.vtxoManager = vtxoManager;
    this.signerPubkey = null;
  }

  async initialize() {
    const res = await fetch(`${this.introspectorUrl}/v1/info`);
    const data = await res.json();
    this.signerPubkey = data.signer_pubkey;
    return true;
  }

  // Soumettre intent proof pour signature
  async submitIntent(intentProof) {
    const res = await fetch(`${this.introspectorUrl}/v1/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: {
          proof: intentProof.proof,
          message: Buffer.from(JSON.stringify(intentProof.metadata)).toString('base64')
        }
      })
    });
    
    const data = await res.json();
    return data.signed_proof;
  }

  // Finaliser un round ARK
  async submitFinalization(signedIntent, forfeits, trees, commitmentTx) {
    const res = await fetch(`${this.introspectorUrl}/v1/finalization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signed_intent: signedIntent,
        forfeits: forfeits,
        connector_tree: trees.connector,
        vtxo_tree: trees.vtxo,
        commitment_tx: commitmentTx
      })
    });
    
    return res.json();
  }

  // Broadcaster transaction signée
  async broadcastTx(signedPSBT) {
    const psbt = bitcoin.Psbt.fromBase64(signedPSBT);
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    
    // Via Bitcoin RPC
    return this.vtxoManager.rpc.sendRawTransaction(tx.toHex());
  }
}

module.exports = ArkClient;
```

**TODO** :
- [ ] Implémenter vraie soumission intent
- [ ] Gérer signatures Schnorr
- [ ] Implémenter finalization flow
- [ ] Tester avec introspector réel
- [ ] Gérer erreurs et retries

### Phase 3 : Sécurité & Validation (2-3 jours)

#### 3.1 - Validation des transactions

```javascript
// Valider PSBT avant signature
function validatePSBT(psbt, expectedInputs, expectedOutputs) {
  // Vérifier inputs
  if (psbt.data.inputs.length !== expectedInputs.length) {
    throw new Error('Input count mismatch');
  }
  
  // Vérifier outputs
  const totalOut = psbt.data.outputs.reduce((sum, o) => sum + o.value, 0);
  const totalIn = expectedInputs.reduce((sum, i) => sum + i.value, 0);
  const fee = totalIn - totalOut;
  
  if (fee < 0 || fee > 10000) {  // Max 10000 sats fee
    throw new Error('Invalid fee');
  }
  
  // Vérifier scripts
  psbt.data.inputs.forEach((input, i) => {
    if (!input.witnessUtxo) {
      throw new Error(`Missing witnessUtxo for input ${i}`);
    }
  });
  
  return true;
}

// Valider vTXO ownership
function validateVTXOOwnership(vtxo, sessionId) {
  if (vtxo.owner !== sessionId) {
    throw new Error('Not vTXO owner');
  }
  
  if (vtxo.spent) {
    throw new Error('vTXO already spent');
  }
  
  return true;
}
```

**TODO** :
- [ ] Implémenter validation PSBT
- [ ] Vérifier ownership vTXOs
- [ ] Valider signatures Schnorr
- [ ] Détecter double-spending
- [ ] Rate limiting sur API

#### 3.2 - Monitoring blockchain

```javascript
// Surveiller confirmations
class DepositMonitor {
  constructor(bitcoinRPC, kv) {
    this.rpc = bitcoinRPC;
    this.kv = kv;
  }

  async start() {
    setInterval(async () => {
      await this.checkPendingDeposits();
    }, 30000);  // Toutes les 30s
  }

  async checkPendingDeposits() {
    // Récupérer tous les dépôts en attente
    const deposits = await this.kv.keys('deposit:*');
    
    for (const key of deposits) {
      const deposit = await this.kv.get(key);
      
      if (deposit.status === 'pending') {
        const received = await this.rpc.getReceivedByAddress(
          deposit.address,
          1  // Min 1 conf
        );
        
        if (received >= deposit.amount) {
          // Créer vTXO
          await this.createVTXOFromDeposit(deposit);
        }
      }
    }
  }
}
```

**TODO** :
- [ ] Implémenter deposit monitor
- [ ] Gérer réorgs blockchain
- [ ] Monitorer mempool
- [ ] Alertes confirmations lentes
- [ ] Logs détaillés

### Phase 4 : UX & Wallet (3-4 jours)

#### 4.1 - Intégration ArkSat Wallet

```javascript
// Connexion wallet ArkSat (Chrome extension)
async function connectArkSatWallet() {
  if (!window.arksat) {
    throw new Error('ArkSat wallet not installed');
  }
  
  const accounts = await window.arksat.request({
    method: 'ark_requestAccounts'
  });
  
  return accounts[0];
}

// Signer avec wallet
async function signWithWallet(psbt) {
  const signedPSBT = await window.arksat.request({
    method: 'ark_signPsbt',
    params: [psbt]
  });
  
  return signedPSBT;
}

// Obtenir vTXOs du wallet
async function getWalletVTXOs() {
  const vtxos = await window.arksat.request({
    method: 'ark_getVtxos'
  });
  
  return vtxos;
}
```

**TODO** :
- [ ] Détecter ArkSat wallet
- [ ] Implémenter connexion
- [ ] Signature transactions via wallet
- [ ] Sync vTXOs wallet ↔ casino
- [ ] Déconnexion propre

#### 4.2 - QR Codes réels

```bash
npm install qrcode
```

```javascript
const QRCode = require('qrcode');

// Générer QR pour adresse Bitcoin
async function generateDepositQR(address, amount) {
  const bip21 = `bitcoin:${address}?amount=${(amount / 100000000).toFixed(8)}`;
  const qrDataURL = await QRCode.toDataURL(bip21);
  return qrDataURL;
}
```

**TODO** :
- [ ] Installer qrcode lib
- [ ] Générer QR codes vrais
- [ ] Afficher dans modal
- [ ] Support BIP21 URI
- [ ] Copier adresse au clic

### Phase 5 : Tests & Déploiement (2-3 jours)

#### 5.1 - Tests unitaires

```javascript
// tests/vtxo.test.js
const VTXOManager = require('../api/vtxo-manager');

describe('VTXO Manager', () => {
  test('should create vTXO from UTXO', async () => {
    const vtxo = await manager.createVTXO(mockUTXO, 'session123');
    expect(vtxo.id).toBeDefined();
    expect(vtxo.amount).toBe(1000);
  });

  test('should generate forfeit transaction', async () => {
    const forfeit = await manager.createForfeitTx(mockUTXO);
    expect(forfeit).toMatch(/^[A-Za-z0-9+/=]+$/);  // Base64
  });

  test('should spend vTXOs correctly', async () => {
    const intent = await manager.spendVTXOs(
      ['vtxo1', 'vtxo2'],
      'bc1q...',
      1500
    );
    expect(intent.proof).toBeDefined();
  });
});
```

**TODO** :
- [ ] Tests unitaires (Jest)
- [ ] Tests intégration
- [ ] Tests e2e (Playwright)
- [ ] Coverage > 80%
- [ ] CI/CD GitHub Actions

#### 5.2 - Monitoring production

```javascript
// Sentry pour erreurs
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Prometheus metrics
const prometheus = require('prom-client');

const vtxoCreated = new prometheus.Counter({
  name: 'ark_vtxos_created_total',
  help: 'Total vTXOs created'
});

const depositsProcessed = new prometheus.Counter({
  name: 'ark_deposits_processed_total',
  help: 'Total deposits processed'
});
```

**TODO** :
- [ ] Setup Sentry
- [ ] Métriques Prometheus
- [ ] Alertes PagerDuty
- [ ] Dashboard Grafana
- [ ] Logs structurés

## 📅 Timeline Production

| Phase | Durée | Priorité |
|-------|-------|----------|
| **Phase 1** : Bitcoin Core | 2-3 jours | CRITIQUE |
| **Phase 2** : ARK Protocol | 3-5 jours | CRITIQUE |
| **Phase 3** : Sécurité | 2-3 jours | HAUTE |
| **Phase 4** : UX/Wallet | 3-4 jours | MOYENNE |
| **Phase 5** : Tests/Deploy | 2-3 jours | HAUTE |

**Total** : 12-18 jours (2-3 semaines)

## 🔐 Sécurité Production

- [ ] HSM pour clés privées (AWS CloudHSM ou Ledger)
- [ ] Rate limiting agressif
- [ ] WAF (Cloudflare)
- [ ] CSRF tokens
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] Audit smart contracts
- [ ] Penetration testing

## 📊 Métriques à suivre

- Taux de création vTXO
- Temps moyen confirmation
- Frais Bitcoin payés
- vTXOs actifs vs dépensés
- Erreurs introspector
- Latence API
- Uptime 99.9%+

---

**Prêt pour production ARK** 🚀
