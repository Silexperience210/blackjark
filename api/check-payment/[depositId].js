// api/check-payment/[depositId].js - Vérifier réception vTXO via ASP
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
    const { depositId } = req.query;

    if (!depositId) {
      return res.status(400).json({ error: 'DepositId requis' });
    }

    // Récupérer infos du dépôt
    const depositKey = `deposit:${depositId}`;
    const deposit = await kv.get(depositKey);

    if (!deposit) {
      return res.status(404).json({ 
        paid: false,
        error: 'Dépôt non trouvé' 
      });
    }

    // Si déjà payé
    if (deposit.status === 'completed') {
      return res.status(200).json({
        paid: true,
        amount: deposit.amount,
        vtxoId: deposit.vtxoId
      });
    }

    // Vérifier si des vTXOs ont été reçus via l'ASP
    const receivedVTXOs = await asp.getAddressVTXOs(deposit.aspId);

    // Si au moins un vTXO reçu avec le bon montant
    if (receivedVTXOs && receivedVTXOs.length > 0) {
      const totalReceived = receivedVTXOs.reduce((sum, v) => sum + v.amount, 0);
      
      if (totalReceived >= deposit.amount) {
        // Récupérer joueur
        const player = await kv.get(`player:${deposit.sessionId}`);
        
        if (player) {
          // Mettre à jour balance INSTANTANÉMENT (transaction ARK confirmée par l'ASP)
          player.balance += deposit.amount;
          player.totalDeposited += deposit.amount;
          
          // Ajouter les IDs des vTXOs reçus (gérés par l'ASP)
          player.aspVtxos = player.aspVtxos || [];
          receivedVTXOs.forEach(vtxo => {
            if (!player.aspVtxos.includes(vtxo.id)) {
              player.aspVtxos.push(vtxo.id);
            }
          });

          // Retirer des dépôts en attente
          player.pendingDeposits = (player.pendingDeposits || [])
            .filter(d => d.depositId !== depositId);

          await kv.set(`player:${deposit.sessionId}`, player, { ex: 2592000 });

          // Marquer dépôt comme complété
          deposit.status = 'completed';
          deposit.vtxoIds = receivedVTXOs.map(v => v.id);
          deposit.completedAt = Date.now();
          await kv.set(depositKey, deposit, { ex: 86400 }); // 24h

          return res.status(200).json({
            paid: true,
            amount: deposit.amount,
            newBalance: player.balance,
            vtxoIds: receivedVTXOs.map(v => v.id),
            instant: true, // Transaction ARK instantanée via ASP !
            vtxosReceived: receivedVTXOs.length
          });
        }
      }
    }

    // Toujours en attente
    res.status(200).json({
      paid: false,
      status: 'pending',
      message: 'En attente de réception vTXO ARK'
    });

  } catch (error) {
    console.error('Erreur vérification paiement:', error);
    res.status(500).json({ 
      paid: false,
      error: 'Erreur vérification paiement' 
    });
  }
}
