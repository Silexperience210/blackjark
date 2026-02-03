// api/asp-client.js - Client pour ARK Service Provider (ArkadeOS)
const fetch = require('node-fetch');

/**
 * Client ASP - Interface avec un ARK Service Provider
 * 
 * L'ASP gère :
 * - Les clés privées
 * - La création des vTXOs
 * - La signature des transactions
 * - Le broadcast sur le réseau ARK
 * 
 * Nous gérons juste :
 * - La comptabilité (balance des joueurs)
 * - Les demandes de paiement via API
 */
class ASPClient {
  constructor() {
    // URL de l'ASP (Second.tech, ArkadeOS local, etc.)
    this.baseUrl = process.env.ASP_URL || 'https://api.second.tech';
    
    // Clé API du casino (fournie par l'ASP)
    this.apiKey = process.env.ASP_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️ ASP_API_KEY not set - ASP calls will fail');
    }
  }

  /**
   * Headers pour les requêtes ASP
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Créer une nouvelle adresse de dépôt
   * L'ASP va gérer cette adresse pour nous
   */
  async createDepositAddress(label) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/address/new`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ label })
      });

      if (!response.ok) {
        throw new Error(`ASP error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Retour attendu :
      // {
      //   address: "ark1qxyz...",
      //   aspId: "addr_abc123",
      //   label: "casino_alice_123"
      // }
      
      return data;
    } catch (error) {
      console.error('Erreur création adresse ASP:', error);
      throw error;
    }
  }

  /**
   * Vérifier les vTXOs reçus sur une adresse
   */
  async getAddressVTXOs(aspId) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/address/${aspId}/vtxos`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`ASP error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Retour attendu :
      // {
      //   vtxos: [
      //     {
      //       id: "vtxo_xyz",
      //       amount: 1000,
      //       status: "confirmed",
      //       createdAt: "2025-02-03T10:00:00Z"
      //     }
      //   ]
      // }
      
      return data.vtxos || [];
    } catch (error) {
      console.error('Erreur récupération vTXOs ASP:', error);
      return [];
    }
  }

  /**
   * Créer un transfert ARK (retrait joueur)
   */
  async createTransfer(fromVtxoId, toAddress, amount) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/transfer`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          from: fromVtxoId,
          to: toAddress,
          amount: amount
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      const data = await response.json();
      
      // Retour attendu :
      // {
      //   txId: "tx_123",
      //   status: "confirmed",
      //   from: "vtxo_xyz",
      //   to: "ark1qbob...",
      //   amount: 800,
      //   instant: true
      // }
      
      return data;
    } catch (error) {
      console.error('Erreur création transfert ASP:', error);
      throw error;
    }
  }

  /**
   * Obtenir la balance totale du casino gérée par l'ASP
   */
  async getCasinoBalance() {
    try {
      const response = await fetch(`${this.baseUrl}/v1/wallet/balance`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`ASP error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Retour attendu :
      // {
      //   balance: 50000,
      //   vtxos: [
      //     { id: "vtxo_1", amount: 10000 },
      //     { id: "vtxo_2", amount: 40000 }
      //   ]
      // }
      
      return data;
    } catch (error) {
      console.error('Erreur récupération balance ASP:', error);
      return { balance: 0, vtxos: [] };
    }
  }

  /**
   * Lister tous les vTXOs du casino
   */
  async listAllVTXOs() {
    try {
      const response = await fetch(`${this.baseUrl}/v1/vtxos`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`ASP error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.vtxos || [];
    } catch (error) {
      console.error('Erreur listing vTXOs ASP:', error);
      return [];
    }
  }

  /**
   * Obtenir l'historique des transactions
   */
  async getTransactionHistory(limit = 50) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/transactions?limit=${limit}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`ASP error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Erreur récupération historique ASP:', error);
      return [];
    }
  }

  /**
   * Vérifier la connexion à l'ASP
   */
  async ping() {
    try {
      const response = await fetch(`${this.baseUrl}/v1/ping`, {
        headers: this.getHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('ASP non accessible:', error);
      return false;
    }
  }

  /**
   * Obtenir les informations de l'ASP
   */
  async getInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/v1/info`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`ASP error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Retour attendu :
      // {
      //   name: "Second ASP",
      //   version: "1.0.0",
      //   network: "mainnet",
      //   features: ["instant_transfers", "webhooks"]
      // }
      
      return data;
    } catch (error) {
      console.error('Erreur récupération info ASP:', error);
      return null;
    }
  }
}

module.exports = ASPClient;
