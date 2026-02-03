// api/deposit.js - Créer un dépôt ARK via ASP
const { kv } = require('@vercel/kv');
const ASPClient = require('./asp-client');

const asp = new ASPClient();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Récupérer session depuis cookie
    const sessionId = req.cookies?.session_id;
    if (!sessionId) {
      return res.status(401).json({ error: 'Session requise' });
    }

    // Récupérer joueur
    const player = await kv.get(`player:${sessionId}`);
    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé' });
    }

    // Récupérer montant du body
    const { amount } = req.body;
    
    // Validation
    const amountSats = parseInt(amount);
    if (!amountSats || amountSats < 100 || amountSats > 10000) {
      return res.status(400).json({ 
        error: 'Montant invalide (100-10000 sats)' 
      });
    }

    // Vérifier balance max
    if (player.balance + amountSats > 10000) {
      return res.status(400).json({ 
        error: 'Balance maximale atteinte (10000 sats)' 
      });
    }

    // Créer adresse de dépôt via ASP
    const label = `casino_${sessionId}_${Date.now()}`;
    const { address, aspId } = await asp.createDepositAddress(label);
    
    const depositId = `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Sauvegarder dépôt en attente
    const depositKey = `deposit:${depositId}`;
    await kv.set(depositKey, {
      sessionId,
      depositId,
      aspId,              // ID de l'adresse côté ASP
      arkAddress: address, // Adresse ARK générée par l'ASP
      amount: amountSats,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000 // 1 heure
    }, { ex: 3600 });

    // Ajouter à la liste des dépôts en attente du joueur
    player.pendingDeposits = player.pendingDeposits || [];
    player.pendingDeposits.push({
      depositId,
      aspId,
      arkAddress: address,
      amount: amountSats,
      createdAt: Date.now()
    });
    
    await kv.set(`player:${sessionId}`, player, { ex: 2592000 });

    // Retourner adresse ARK pour recevoir vTXOs via ASP
    res.status(200).json({
      depositId,
      aspId,              // Inclure pour debug/tracking
      arkAddress: address,
      amount: amountSats,
      expiresAt: Date.now() + 3600000,
      message: 'Envoyez des vTXOs ARK depuis votre wallet ArkSat. L\'ASP gère la réception !',
      qrCode: `ark:${address}?amount=${amountSats}`
    });

  } catch (error) {
    console.error('Erreur création dépôt:', error);
    res.status(500).json({ 
      error: 'Erreur création dépôt ARK',
      details: error.message 
    });
  }
}
