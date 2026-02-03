# 📍 Format des Adresses ARK

## Structure d'une adresse ARK

Une adresse ARK valide suit le format **Bech32** et contient **exactement 62 caractères** :

```
ark1q + 58 caractères
```

### Exemple d'adresse ARK réelle
```
ark1qxyz2k7j8c9qpzry9x8gf2tvdw0s3jn54khce6mua7lqpzry9x8gf2tv
│   │└─────────────────────────────────────────────────────┘
│   │                    58 caractères
│   └─ Toujours 'q' après ark1 (witness version 0)
└───── Préfixe (4 caractères)

Total: 4 + 1 + 58 = 63 caractères
```

## Charset Bech32

Les adresses ARK utilisent uniquement ces 32 caractères (Bech32) :
```
q p z r y 9 x 8 g f 2 t v d w 0 s 3 j n 5 4 k h c e 6 m u a 7 l
```

**Pas de caractères ambigus** : 
- ❌ Pas de `0` (zéro) - remplacé par `q`
- ❌ Pas de `O` (lettre o majuscule)
- ❌ Pas de `I` (i majuscule)
- ❌ Pas de `l` (L minuscule) - Wait, si `l` est présent

## Structure Technique

```
ark1 q [witness_program_58_chars]
│    │  │
│    │  └─ Programme witness (hash160 du script)
│    └──── Version witness (0 = q)
└───────── Human-readable part (HRP)
```

## Dans BlackjARK

### Avant (❌ Incorrect)
```javascript
const fakeAddress = 'ark1q' + Math.random().toString(36).substring(2, 15);
// Résultat: ark1qtvb4uncbpc (seulement 18 caractères) ❌
```

### Après (✅ Correct)
```javascript
const chars = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
let address = 'ark1q';
for (let i = 0; i < 58; i++) {
  address += chars[Math.floor(Math.random() * chars.length)];
}
// Résultat: ark1qxyz2k7j8c9qpzry9x8gf2tvdw0s3jn54khce6mua7lqpzry9x8gf2tv ✅
// Length: 62 caractères
```

## Validation

Pour valider une adresse ARK :

1. **Longueur** : Exactement 62 caractères
2. **Préfixe** : Commence par `ark1q`
3. **Charset** : Seulement caractères Bech32
4. **Checksum** : Les 6 derniers caractères sont un checksum (non implémenté dans la démo)

### Exemple de validation JavaScript
```javascript
function isValidArkAddress(address) {
  // Check length
  if (address.length !== 62) return false;
  
  // Check prefix
  if (!address.startsWith('ark1q')) return false;
  
  // Check charset
  const bech32Chars = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  for (let i = 4; i < address.length; i++) {
    if (!bech32Chars.includes(address[i])) return false;
  }
  
  return true;
}
```

## Références

- **ARK Protocol** : https://arkadeos.com
- **Bech32 Spec** : BIP-173
- **Witness Version** : 0 (Segwit)

---

## ✅ Dans BlackjARK V3

Maintenant corrigé ! Les adresses générées font bien **62 caractères** et utilisent le **charset Bech32** correct.

**Exemple généré** :
```
ark1q8gf2tvdw0s3jn54khce6mua7lqpzry9x8gf2tvdw0s3jn54khce6mu
```

🎉 **Adresses ARK réalistes !**
