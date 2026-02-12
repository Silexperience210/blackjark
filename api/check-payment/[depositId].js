// api/check-payment/[depositId].js - Vérifier réception vTXO via ASP
import { kv } from '@vercel/kv';
import ASPClient from '../asp-client.js';

const asp = new ASPClient();

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

    // Lock pour éviter double-crédit
    const lockKey = `lock:deposit:${depositId}`;
    const lockAcquired = await kv.set(lockKey, '1', { nx: true, ex: 10 });
    if (!lockAcquired) {
      return res.status(200).json({ paid: false, status: 'processing' });
    }

    try {
      // Re-vérifier le status après lock (double-check)
      const freshDeposit = await kv.get(depositKey);
      if (freshDeposit && freshDeposit.status === 'completed') {
        await kv.del(lockKey);
        return res.status(200).json({ paid: true, amount: freshDeposit.amount });
      }

      // Vérifier si des vTXOs ont été reçus via l'ASP
      const receivedVTXOs = await asp.getAddressVTXOs(deposit.aspId);

      if (receivedVTXOs && receivedVTXOs.length > 0) {
        const totalReceived = receivedVTXOs.reduce((sum, v) => sum + v.amount, 0);

        if (totalReceived >= deposit.amount) {
          const player = await kv.get(`player:${deposit.sessionId}`);

          if (player) {
            player.balance += deposit.amount;
            player.totalDeposited += deposit.amount;

            player.aspVtxos = player.aspVtxos || [];
            receivedVTXOs.forEach(vtxo => {
              if (!player.aspVtxos.includes(vtxo.id)) {
                player.aspVtxos.push(vtxo.id);
              }
            });

            player.pendingDeposits = (player.pendingDeposits || [])
              .filter(d => d.depositId !== depositId);

            await kv.set(`player:${deposit.sessionId}`, player, { ex: 2592000 });

            deposit.status = 'completed';
            deposit.vtxoIds = receivedVTXOs.map(v => v.id);
            deposit.completedAt = Date.now();
            await kv.set(depositKey, deposit, { ex: 86400 });

            await kv.del(lockKey);

            return res.status(200).json({
              paid: true,
              amount: deposit.amount,
              newBalance: player.balance,
              vtxoIds: receivedVTXOs.map(v => v.id),
              instant: true,
              vtxosReceived: receivedVTXOs.length
            });
          }
        }
      }

      await kv.del(lockKey);
    } catch (lockError) {
      await kv.del(lockKey);
      throw lockError;
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
