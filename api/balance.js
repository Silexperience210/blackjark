// api/balance.js - Obtenir le solde ARK
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigin = process.env.FRONTEND_URL || origin;
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
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

    res.status(200).json({
      balance: player.balance || 0,
      totalDeposited: player.totalDeposited || 0,
      totalWithdrawn: player.totalWithdrawn || 0,
      gamesPlayed: player.gamesPlayed || 0,
      aspVtxos: player.aspVtxos?.length || 0,
      pendingDeposits: player.pendingDeposits?.length || 0
    });

  } catch (error) {
    console.error('Erreur récupération balance:', error);
    res.status(500).json({ error: 'Erreur récupération balance' });
  }
}
