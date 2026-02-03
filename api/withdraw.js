// api/withdraw.js - Retrait ARK via ASP
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
    // Récupérer session
    const sessionId = req.cookies?.session_id;
    if (!sessionId) {
      return res.status(401).json({ error: 'Session requise' });
    }

    // Récupérer joueur
    const player = await kv.get(`player:${sessionId}`);
    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé' });
    }

    // Récupérer adresse ARK et montant
    const { arkAddress, amount } = req.body;

    // Validation adresse ARK
    if (!arkAddress || !arkAddress.match(/^ark1q[a-z0-9]{40,90}$/)) {
      return res.status(400).json({ error: 'Adresse ARK invalide (format: ark1q...)' });
    }

    // Validation montant
    const amountSats = parseInt(amount);
    if (!amountSats || amountSats < 100) {
      return res.status(400).json({ error: 'Montant minimum: 100 sats' });
    }

    // Vérifier balance
    if (player.balance < amountSats) {
      return res.status(400).json({ 
        error: 'Balance insuffisante',
        balance: player.balance,
        requested: amountSats
      });
    }

    // Vérifier que le joueur a des vTXOs disponibles via l'ASP
    if (!player.aspVtxos || player.aspVtxos.length === 0) {
      return res.status(400).json({
        error: 'Aucun vTXO disponible',
        message: 'Déposez des fonds d\'abord'
      });
    }

    // Sélectionner le premier vTXO disponible (coin selection simple)
    const vtxoId = player.aspVtxos[0];

    // Créer transfert via ASP
    const withdrawal = await asp.createTransfer(
      vtxoId,           // vTXO source
      arkAddress,       // Adresse destination
      amountSats        // Montant
    );

    // Déduire de la balance immédiatement (transaction instantanée via ASP)
    player.balance -= amountSats;
    player.totalWithdrawn += amountSats;

    // Retirer le vTXO dépensé de la liste
    player.aspVtxos = player.aspVtxos.filter(id => id !== vtxoId);

    await kv.set(`player:${sessionId}`, player, { ex: 2592000 });

    // Sauvegarder transaction
    const txKey = `tx:${withdrawal.txid}`;
    await kv.set(txKey, {
      sessionId,
      type: 'withdrawal',
      arkAddress,
      amount: amountSats,
      txid: withdrawal.txid,
      status: 'confirmed', // Instantané dans ARK !
      createdAt: Date.now(),
      confirmedAt: Date.now() // Pas d'attente
    }, { ex: 86400 }); // 24h

    res.status(200).json({
      success: true,
      txid: withdrawal.txid,
      amount: amountSats,
      destination: arkAddress,
      newBalance: player.balance,
      status: 'confirmed',
      instant: true, // Transaction ARK instantanée !
      message: 'Retrait ARK confirmé instantanément !'
    });

  } catch (error) {
    console.error('Erreur retrait:', error);
    res.status(500).json({ 
      error: 'Erreur retrait ARK',
      details: error.message 
    });
  }
}
