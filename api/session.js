// api/session.js - Gestion des sessions joueur avec ARK
import { kv } from '@vercel/kv';
import { randomBytes } from 'crypto';

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigin = process.env.FRONTEND_URL || origin;
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Récupérer ou créer session_id depuis cookie
    let sessionId = req.cookies?.session_id;

    if (!sessionId) {
      // Générer nouveau session_id
      sessionId = randomBytes(32).toString('hex');
      
      // Créer cookie
      res.setHeader('Set-Cookie', [
        `session_id=${sessionId}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`
      ]);
    }

    // Récupérer ou initialiser données joueur dans KV
    const playerKey = `player:${sessionId}`;
    let player = await kv.get(playerKey);

    if (!player) {
      // Nouveau joueur
      player = {
        sessionId,
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        gamesPlayed: 0,
        createdAt: Date.now(),
        aspVtxos: [], // Liste des vTXOs ARK disponibles (gérés par l'ASP)
        pendingDeposits: [], // Dépôts ARK en attente
        arkAddress: null // Adresse ARK du joueur (dérivée)
      };

      // Sauvegarder dans KV (expire après 30 jours)
      await kv.set(playerKey, player, { ex: 2592000 });
    }

    res.status(200).json({
      sessionId: player.sessionId,
      balance: player.balance,
      totalDeposited: player.totalDeposited,
      totalWithdrawn: player.totalWithdrawn,
      gamesPlayed: player.gamesPlayed,
      aspVtxos: player.aspVtxos?.length || 0,
      message: 'Session active avec protocole ARK'
    });

  } catch (error) {
    console.error('Erreur session:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
