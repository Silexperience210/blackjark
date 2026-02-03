// api/admin/casino-stats.js - Stats du wallet casino via ASP (ADMIN ONLY)
const { kv } = require('@vercel/kv');
const ASPClient = require('../asp-client');

const asp = new ASPClient();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TODO: Ajouter authentification admin ici
    // const adminKey = req.headers['x-admin-key'];
    // if (adminKey !== process.env.ADMIN_KEY) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    // Obtenir balance casino via ASP
    const casinoData = await asp.getCasinoBalance();
    const casinoBalance = casinoData.balance || 0;
    const casinoVtxos = casinoData.vtxos || [];

    // Calculer total balance des joueurs
    let totalPlayerBalance = 0;
    let activePlayersCount = 0;
    
    // Scanner tous les joueurs
    const playerKeys = await kv.keys('player:*');
    
    for (const key of playerKeys) {
      const player = await kv.get(key);
      if (player && player.balance > 0) {
        totalPlayerBalance += player.balance;
        activePlayersCount++;
      }
    }

    // Calculer santé du casino
    const coverageRatio = totalPlayerBalance > 0 
      ? (casinoBalance / totalPlayerBalance).toFixed(2) 
      : '∞';
    
    const healthy = totalPlayerBalance === 0 || casinoBalance >= totalPlayerBalance * 1.5;

    // Stats complètes
    res.status(200).json({
      timestamp: new Date().toISOString(),
      
      casino: {
        asp: {
          balance: casinoBalance,
          vtxoCount: casinoVtxos.length,
          provider: process.env.ASP_URL || 'Not configured',
          averageVtxoSize: casinoVtxos.length > 0 
            ? Math.round(casinoBalance / casinoVtxos.length)
            : 0
        },
        health: {
          healthy,
          coverageRatio,
          warning: !healthy && totalPlayerBalance > 0 ? 'Low liquidity - Consider adding funds to ASP' : null,
          critical: casinoBalance < totalPlayerBalance ? 'CRITICAL - Cannot cover all player balances!' : null
        }
      },
      
      players: {
        totalBalance: totalPlayerBalance,
        activeCount: activePlayersCount,
        averageBalance: activePlayersCount > 0 
          ? Math.round(totalPlayerBalance / activePlayersCount) 
          : 0
      },
      
      metrics: {
        coverageRatio,
        liquidity: casinoBalance - totalPlayerBalance,
        status: healthy ? '✅ Healthy' : '⚠️ Warning'
      }
    });

  } catch (error) {
    console.error('Erreur récupération stats casino:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
}