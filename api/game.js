// api/game.js - Blackjack avec logique côté serveur
import { kv } from '@vercel/kv';
import { randomBytes } from 'crypto';

// --- Helpers Blackjack ---

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return shuffleDeck(deck);
}

function shuffleDeck(deck) {
  // Fisher-Yates avec crypto
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const rand = randomBytes(4).readUInt32BE(0);
    const j = rand % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function cardValue(card) {
  if (['J','Q','K'].includes(card.rank)) return 10;
  if (card.rank === 'A') return 11;
  return parseInt(card.rank);
}

function handScore(hand) {
  let score = 0;
  let aces = 0;
  for (const card of hand) {
    score += cardValue(card);
    if (card.rank === 'A') aces++;
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

function generateId() {
  return randomBytes(12).toString('hex');
}

// --- Handler ---

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigin = process.env.FRONTEND_URL || origin;
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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
    const sessionId = req.cookies?.session_id;
    if (!sessionId) {
      return res.status(401).json({ error: 'Session requise' });
    }

    const playerKey = `player:${sessionId}`;
    const gameKey = `game_state:${sessionId}`;

    const player = await kv.get(playerKey);
    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé' });
    }

    const { action, bet } = req.body;

    if (!['deal', 'hit', 'stand'].includes(action)) {
      return res.status(400).json({ error: 'Action invalide (deal, hit, stand)' });
    }

    // --- DEAL: nouvelle partie ---
    if (action === 'deal') {
      const betAmount = parseInt(bet);
      if (!betAmount || betAmount < 100 || betAmount > 1000) {
        return res.status(400).json({ error: 'Mise invalide (100-1000 sats)' });
      }
      if (player.balance < betAmount) {
        return res.status(400).json({ error: 'Balance insuffisante', balance: player.balance });
      }

      // Vérifier qu'il n'y a pas déjà une partie en cours
      const existing = await kv.get(gameKey);
      if (existing && existing.status === 'playing') {
        return res.status(400).json({ error: 'Partie déjà en cours. Terminez-la d\'abord (hit ou stand).' });
      }

      const deck = createDeck();
      const playerHand = [deck.pop(), deck.pop()];
      const dealerHand = [deck.pop(), deck.pop()];

      const pScore = handScore(playerHand);

      // Vérifier blackjack naturel
      let status = 'playing';
      let result = null;
      let balanceChange = 0;

      if (pScore === 21) {
        const dScore = handScore(dealerHand);
        if (dScore === 21) {
          status = 'finished';
          result = 'push';
          balanceChange = 0;
        } else {
          status = 'finished';
          result = 'blackjack';
          balanceChange = Math.floor(betAmount * 1.5);
        }
      }

      const gameState = {
        gameId: `game_${generateId()}`,
        bet: betAmount,
        deck,
        playerHand,
        dealerHand,
        status,
        result,
        createdAt: Date.now()
      };

      if (status === 'finished') {
        player.balance += balanceChange;
        player.gamesPlayed = (player.gamesPlayed || 0) + 1;
        await kv.set(playerKey, player, { ex: 2592000 });

        await kv.set(gameKey, { ...gameState, status: 'finished' }, { ex: 3600 });

        return res.status(200).json({
          gameId: gameState.gameId,
          action: 'deal',
          playerHand,
          playerScore: pScore,
          dealerHand,
          dealerScore: handScore(dealerHand),
          result,
          balanceChange,
          newBalance: player.balance,
          status: 'finished'
        });
      }

      // Déduire la mise maintenant (sera rendue en cas de win/push)
      player.balance -= betAmount;
      await kv.set(playerKey, player, { ex: 2592000 });
      await kv.set(gameKey, gameState, { ex: 3600 });

      return res.status(200).json({
        gameId: gameState.gameId,
        action: 'deal',
        playerHand,
        playerScore: pScore,
        dealerUpCard: dealerHand[0],
        status: 'playing',
        newBalance: player.balance
      });
    }

    // --- HIT ou STAND: partie en cours ---
    const gameState = await kv.get(gameKey);
    if (!gameState || gameState.status !== 'playing') {
      return res.status(400).json({ error: 'Aucune partie en cours. Faites un deal d\'abord.' });
    }

    if (action === 'hit') {
      gameState.playerHand.push(gameState.deck.pop());
      const pScore = handScore(gameState.playerHand);

      if (pScore > 21) {
        // Bust
        gameState.status = 'finished';
        gameState.result = 'lose';

        player.gamesPlayed = (player.gamesPlayed || 0) + 1;
        await kv.set(playerKey, player, { ex: 2592000 });
        await kv.set(gameKey, gameState, { ex: 3600 });

        return res.status(200).json({
          gameId: gameState.gameId,
          action: 'hit',
          playerHand: gameState.playerHand,
          playerScore: pScore,
          dealerHand: gameState.dealerHand,
          dealerScore: handScore(gameState.dealerHand),
          result: 'lose',
          balanceChange: -gameState.bet,
          newBalance: player.balance,
          status: 'finished'
        });
      }

      // Pas de bust, continue
      await kv.set(gameKey, gameState, { ex: 3600 });

      return res.status(200).json({
        gameId: gameState.gameId,
        action: 'hit',
        playerHand: gameState.playerHand,
        playerScore: pScore,
        dealerUpCard: gameState.dealerHand[0],
        status: 'playing'
      });
    }

    if (action === 'stand') {
      // Le dealer tire jusqu'à 17+
      let dScore = handScore(gameState.dealerHand);
      while (dScore < 17) {
        gameState.dealerHand.push(gameState.deck.pop());
        dScore = handScore(gameState.dealerHand);
      }

      const pScore = handScore(gameState.playerHand);
      let result;
      let balanceChange;

      if (dScore > 21) {
        result = 'win';
        balanceChange = gameState.bet;
      } else if (pScore > dScore) {
        result = 'win';
        balanceChange = gameState.bet;
      } else if (pScore < dScore) {
        result = 'lose';
        balanceChange = 0;
      } else {
        result = 'push';
        balanceChange = 0;
      }

      // Rendre les gains
      if (result === 'win') {
        player.balance += gameState.bet * 2; // mise initiale + gain
      } else if (result === 'push') {
        player.balance += gameState.bet; // rendre la mise
      }
      // lose: la mise est déjà déduite

      player.gamesPlayed = (player.gamesPlayed || 0) + 1;

      gameState.status = 'finished';
      gameState.result = result;

      await kv.set(playerKey, player, { ex: 2592000 });
      await kv.set(gameKey, gameState, { ex: 3600 });

      // Sauvegarder historique
      const historyKey = `game_history:${gameState.gameId}`;
      await kv.set(historyKey, {
        sessionId,
        gameId: gameState.gameId,
        bet: gameState.bet,
        result,
        playerScore: pScore,
        dealerScore: dScore,
        timestamp: Date.now()
      }, { ex: 86400 });

      return res.status(200).json({
        gameId: gameState.gameId,
        action: 'stand',
        playerHand: gameState.playerHand,
        playerScore: pScore,
        dealerHand: gameState.dealerHand,
        dealerScore: dScore,
        result,
        balanceChange: result === 'win' ? gameState.bet : (result === 'push' ? 0 : -gameState.bet),
        newBalance: player.balance,
        status: 'finished'
      });
    }

  } catch (error) {
    console.error('Erreur game:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
