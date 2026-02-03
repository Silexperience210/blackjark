# 🚀 Guide de Déploiement - Casino ARK

## Configuration ARK Introspector

### Installation sur serveur

```bash
# Sur votre serveur (Ubuntu/Debian)
ssh user@votre-serveur.com

# Installer Go 1.25+
wget https://go.dev/dl/go1.25.3.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.25.3.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin

# Cloner introspector
git clone https://github.com/ArkLabsHQ/introspector.git
cd introspector

# Générer clé privée (signer)
openssl rand -hex 32 > /home/user/.ark-key

# Configuration
export INTROSPECTOR_SECRET_KEY=$(cat /home/user/.ark-key)
export INTROSPECTOR_DATADIR=/home/user/.ark-data
export INTROSPECTOR_PORT=7073
export INTROSPECTOR_NETWORK=testnet
export INTROSPECTOR_LOG_LEVEL=4

# Build
make build

# Test
./introspector &

# Vérifier
curl http://localhost:7073/v1/info
```

### Service systemd

Créer `/etc/systemd/system/ark-introspector.service` :

```ini
[Unit]
Description=ARK Introspector Service
After=network.target

[Service]
Type=simple
User=ark
WorkingDirectory=/home/ark/introspector
Environment="INTROSPECTOR_SECRET_KEY=VOTRE_CLE_HEX"
Environment="INTROSPECTOR_DATADIR=/home/ark/.ark-data"
Environment="INTROSPECTOR_PORT=7073"
Environment="INTROSPECTOR_NETWORK=testnet"
Environment="INTROSPECTOR_LOG_LEVEL=4"
ExecStart=/home/ark/introspector/introspector
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activer :

```bash
sudo systemctl daemon-reload
sudo systemctl enable ark-introspector
sudo systemctl start ark-introspector
sudo systemctl status ark-introspector
```

### Exposition via Nginx (reverse proxy)

```nginx
# /etc/nginx/sites-available/ark-introspector

server {
    listen 443 ssl http2;
    server_name ark.votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/ark.votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ark.votre-domaine.com/privkey.pem;

    location / {
        proxy_pass http://localhost:7073;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activer :

```bash
sudo ln -s /etc/nginx/sites-available/ark-introspector /etc/nginx/sites-enabled/
sudo certbot --nginx -d ark.votre-domaine.com
sudo nginx -t
sudo systemctl reload nginx
```

## Déploiement Vercel

### 1. Préparer le repo

```bash
cd satoshi-casino-ark
git init
git add .
git commit -m "Casino ARK initial"
```

### 2. Push sur GitHub

```bash
# Créer repo sur github.com
git remote add origin https://github.com/USERNAME/satoshi-casino-ark.git
git branch -M main
git push -u origin main
```

### 3. Importer sur Vercel

1. Aller sur https://vercel.com/new
2. **Import Git Repository**
3. Sélectionner `satoshi-casino-ark`
4. **Framework Preset** : Other
5. **Root Directory** : `./`

### 4. Configurer Vercel KV

Dans le projet Vercel :

1. Onglet **Storage** → **Create Database**
2. Type : **KV (Redis)**
3. Nom : `casino-ark-db`
4. Region : Choisir la plus proche
5. **Create**

Variables automatiquement ajoutées :
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 5. Ajouter variables ARK

Onglet **Settings** → **Environment Variables** :

| Variable | Valeur | Exemple |
|----------|--------|---------|
| `ARK_INTROSPECTOR_URL` | URL publique de votre introspector | `https://ark.votre-domaine.com` |
| `ARK_NETWORK` | Réseau Bitcoin | `testnet` ou `mainnet` |

Environments : **Production**, **Preview**, **Development**

### 6. Redéployer

**Deployments** → 3 points `...` → **Redeploy**

### 7. Tester

Votre casino sera sur : `https://votre-projet.vercel.app`

## Configuration DNS (domaine custom)

### Option 1 : Sous-domaine Vercel

Dans Vercel **Settings** → **Domains** :

1. Editer domaine actuel
2. Changer : `casino-ark.vercel.app`
3. Sauvegarder

### Option 2 : Votre domaine

1. **Settings** → **Domains** → **Add**
2. Entrer : `casino.votre-domaine.com`
3. Suivre instructions DNS :

Chez votre registrar (Cloudflare, OVH, etc.) :

```
Type: CNAME
Name: casino
Value: cname.vercel-dns.com
```

Ou :

```
Type: A
Name: casino
Value: 76.76.21.21
```

## Surveillance & Monitoring

### Logs Vercel

1. **Functions** → Sélectionner une fonction
2. **Logs** → Temps réel

### Logs Introspector

```bash
# Sur votre serveur
sudo journalctl -u ark-introspector -f

# Dernières 100 lignes
sudo journalctl -u ark-introspector -n 100
```

### Monitoring Uptime

Utiliser [UptimeRobot](https://uptimerobot.com) (gratuit) :

1. Monitor type : **HTTP(s)**
2. URL : `https://ark.votre-domaine.com/v1/info`
3. Interval : 5 minutes
4. Alert contacts : votre email

## Backup

### Vercel KV

Automatique par Vercel (snapshots quotidiens).

Export manuel :

```bash
# Via Vercel CLI
vercel env pull .env.production
# Puis scripts de backup custom
```

### Introspector data

```bash
# Backup quotidien
0 2 * * * tar -czf /backups/ark-data-$(date +\%Y\%m\%d).tar.gz /home/ark/.ark-data

# Rotation (garder 7 jours)
7 2 * * * find /backups -name "ark-data-*.tar.gz" -mtime +7 -delete
```

## Scaling

### Vercel

- Automatic scaling inclus
- Jusqu'à 100 concurrent requests (gratuit)
- Upgrade si besoin : Pro plan ($20/mois)

### Introspector

Pour supporter plus de charge :

```bash
# Load balancer Nginx
upstream ark_backend {
    server 127.0.0.1:7073;
    server 127.0.0.1:7074;  # Instance 2
    server 127.0.0.1:7075;  # Instance 3
}

server {
    location / {
        proxy_pass http://ark_backend;
    }
}
```

## Sécurité Production

### 1. Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

### 2. Fail2ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### 3. Rate limiting (Nginx)

```nginx
limit_req_zone $binary_remote_addr zone=ark_limit:10m rate=10r/s;

location / {
    limit_req zone=ark_limit burst=20 nodelay;
    proxy_pass http://localhost:7073;
}
```

### 4. Clés sécurisées

```bash
# Stocker clé privée en vault
# NE JAMAIS commiter dans Git
echo "INTROSPECTOR_SECRET_KEY=..." >> /etc/environment

# Permissions restrictives
chmod 600 /home/ark/.ark-key
```

## Maintenance

### Mise à jour Introspector

```bash
cd /home/ark/introspector
git pull
make build
sudo systemctl restart ark-introspector
```

### Mise à jour Casino

```bash
cd satoshi-casino-ark
git pull
git add .
git commit -m "Update features"
git push

# Vercel redéploie automatiquement
```

## Troubleshooting Production

### Introspector ne démarre pas

```bash
# Vérifier logs
sudo journalctl -u ark-introspector -n 50

# Vérifier port
sudo lsof -i :7073

# Tester manuellement
cd /home/ark/introspector
./introspector
```

### Vercel Functions timeout

- Default timeout : 10s (Hobby)
- Max timeout : 60s (Pro)

Si besoin, optimiser les appels API.

### KV Database plein

Monitor dans Vercel Dashboard.

Si plein :
1. Nettoyer vieilles données
2. Réduire TTL des clés
3. Upgrade plan si nécessaire

### SSL Certificate expired

```bash
# Renouveler Let's Encrypt
sudo certbot renew
sudo systemctl reload nginx
```

## Coûts Estimés

### Hébergement

- **Vercel** : Gratuit (ou $20/mois Pro)
- **Serveur VPS** (introspector) : $5-10/mois
  - Digital Ocean Droplet : $6/mois
  - Hetzner Cloud : €4/mois
- **Domaine** : $10-15/an

**Total** : ~$10/mois pour production complète

### Traffic

Gratuit jusqu'à :
- 100 GB bandwidth (Vercel)
- 100 GB-hrs functions
- 3000 KV requests/jour

Au-delà → upgrade nécessaire.

---

**✅ Déploiement terminé !**

Votre casino ARK est maintenant en production.
