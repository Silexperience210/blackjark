// api/game.js - Enregistrer une partie de blackjack
const { kv } = require('@vercel/kv');

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

    // Récupérer données du jeu
    const { bet, result } = req.body;

    // Validation
    const betAmount = parseInt(bet);
    if (!betAmount || betAmount < 100 || betAmount > 1000) {
      return res.status(400).json({ error: 'Mise invalide (100-1000 sats)' });
    }

    if (!['win', 'lose', 'push'].includes(result)) {
      return res.status(400).json({ error: 'Résultat invalide' });
    }

    // Vérifier balance pour la mise
    if (player.balance < betAmount) {
      return res.status(400).json({ 
        error: 'Balance insuffisante',
        balance: player.balance
      });
    }

    // Calculer nouveau solde selon résultat
    let balanceChange = 0;
    let won = false;

    if (result === 'win') {
      balanceChange = betAmount; // Gain = mise
      won = true;
    } else if (result === 'lose') {
      balanceChange = -betAmount; // Perte = mise
      won = false;
    } else if (result === 'push') {
      balanceChange = 0; // Égalité = remboursement
      won = false;
    }

    // Mettre à jour balance
    player.balance += balanceChange;
    player.gamesPlayed = (player.gamesPlayed || 0) + 1;

    // Sauvegarder joueur mis à jour
    await kv.set(`player:${sessionId}`, player, { ex: 2592000 });

    // Sauvegarder historique de jeu
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const gameKey = `game:${gameId}`;
    await kv.set(gameKey, {
      sessionId,
      gameId,
      bet: betAmount,
      result,
      balanceChange,
      newBalance: player.balance,
      timestamp: Date.now()
    }, { ex: 86400 }); // 24h

    res.status(200).json({
      success: true,
      gameId,
      result,
      bet: betAmount,
      balanceChange,
      newBalance: player.balance,
      gamesPlayed: player.gamesPlayed
    });

  } catch (error) {
    console.error('Erreur enregistrement jeu:', error);
    res.status(500).json({ 
      error: 'Erreur enregistrement jeu',
      details: error.message 
    });
  }
}
