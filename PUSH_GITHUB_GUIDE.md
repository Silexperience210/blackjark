# 🚀 Guide Pas à Pas - Push BlackjARK sur GitHub

## 📋 Guide pour Débutants - Étape par Étape

---

## ✅ ÉTAPE 1 : Extraire l'Archive

### Sur ton ordinateur local :

```bash
# 1. Télécharge blackjark-complete.tar.gz depuis Claude

# 2. Va dans ton dossier Téléchargements
cd ~/Downloads  # ou ~/Téléchargements sur Mac en français

# 3. Extraire l'archive
tar -xzf blackjark-complete.tar.gz

# 4. Entre dans le dossier
cd blackjark

# 5. Vérifie que tout est là
ls
# Tu dois voir: public/, api/, README.md, package.json, etc.
```

**✅ Checkpoint** : Tu es maintenant dans le dossier `blackjark/`

---

## ✅ ÉTAPE 2 : Installer Git (si pas déjà fait)

### Sur Mac :
```bash
# Vérifie si Git est installé
git --version

# Si pas installé, installe avec Homebrew
brew install git

# Ou télécharge depuis : https://git-scm.com/download/mac
```

### Sur Windows :
1. Télécharge : [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Installe avec les options par défaut
3. Ouvre **Git Bash**

### Sur Linux :
```bash
sudo apt-get install git  # Ubuntu/Debian
sudo yum install git      # CentOS/RedHat
```

**✅ Checkpoint** : `git --version` affiche une version (ex: 2.40.0)

---

## ✅ ÉTAPE 3 : Configurer Git (première fois seulement)

```bash
# Configure ton nom (remplace par TON nom)
git config --global user.name "Silexperience"

# Configure ton email (utilise l'email de ton compte GitHub)
git config --global user.email "ton-email@example.com"

# Vérifie que c'est bon
git config --list
```

**✅ Checkpoint** : Tu vois ton nom et email dans la liste

---

## ✅ ÉTAPE 4 : Créer un Compte GitHub (si pas déjà fait)

1. Va sur [https://github.com](https://github.com)
2. Click **"Sign Up"**
3. Entre ton email
4. Crée un mot de passe
5. Choisis un username (ex: `silexperience`)
6. Vérifie ton email
7. **C'est fait !** ✅

**✅ Checkpoint** : Tu es connecté sur github.com

---

## ✅ ÉTAPE 5 : Créer un Nouveau Repo sur GitHub

### Sur GitHub.com :

1. **Click sur le "+"** en haut à droite
2. **Click "New repository"**

3. **Remplis les champs** :
   - **Repository name** : `blackjark`
   - **Description** : `⚡ Ultimate vTXO Casino on ARK Protocol`
   - **Public** ou **Private** (au choix)
   - ⚠️ **NE COCHE RIEN** (pas de README, pas de .gitignore, rien !)

4. **Click "Create repository"**

**✅ Checkpoint** : Tu vois une page avec des instructions

---

## ✅ ÉTAPE 6 : Copier l'URL du Repo

Sur la page GitHub que tu viens de créer, tu vas voir :

```
Quick setup — if you've done this kind of thing before
```

**Copie l'URL HTTPS** qui ressemble à :
```
https://github.com/TON_USERNAME/blackjark.git
```

**⚠️ Important** : Remplace `TON_USERNAME` par ton vrai username GitHub !

**✅ Checkpoint** : URL copiée dans ton presse-papier

---

## ✅ ÉTAPE 7 : Initialiser Git dans ton Projet

### Dans le terminal, dans le dossier `blackjark/` :

```bash
# 1. Vérifie que tu es dans le bon dossier
pwd
# Doit afficher : /quelque/chose/blackjark

# 2. Initialise Git
git init

# Tu verras : "Initialized empty Git repository in..."
```

**✅ Checkpoint** : Message "Initialized empty Git repository"

---

## ✅ ÉTAPE 8 : Connecter ton Projet à GitHub

```bash
# Remplace TON_USERNAME par ton username GitHub !
git remote add origin https://github.com/TON_USERNAME/blackjark.git

# Exemple :
# git remote add origin https://github.com/silexperience/blackjark.git

# Vérifie que c'est bon
git remote -v

# Tu dois voir :
# origin  https://github.com/TON_USERNAME/blackjark.git (fetch)
# origin  https://github.com/TON_USERNAME/blackjark.git (push)
```

**✅ Checkpoint** : `git remote -v` affiche ton URL GitHub

---

## ✅ ÉTAPE 9 : Ajouter Tous les Fichiers

```bash
# Ajoute TOUS les fichiers
git add .

# Le point "." veut dire "tout"

# Vérifie ce qui a été ajouté
git status

# Tu verras une liste de fichiers en vert
```

**✅ Checkpoint** : `git status` montre plein de fichiers en vert

---

## ✅ ÉTAPE 10 : Faire le Premier Commit

```bash
# Crée le commit avec un message
git commit -m "🎰 Initial commit - BlackjARK Ultimate Casino

✨ Features:
- Complete Blackjack game
- Real ASP APIs integration
- Instant deposits/withdrawals
- 10 achievements
- 5 cyberpunk themes
- Responsive mobile

⚡ Powered by ARK Protocol"

# Le commit est créé !
```

**✅ Checkpoint** : Message de confirmation du commit

---

## ✅ ÉTAPE 11 : Push sur GitHub ! 🚀

```bash
# Renomme la branche en "main" (si besoin)
git branch -M main

# Push vers GitHub !
git push -u origin main
```

### ⚠️ Si GitHub te demande de te connecter :

**Option 1 : HTTPS (plus simple)**
- Username : ton username GitHub
- Password : **Utilise un Personal Access Token** (pas ton mot de passe !)

**Comment créer un Token** :
1. Va sur GitHub.com
2. Click sur ta photo (en haut à droite)
3. **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
4. Click **"Generate new token"** → **"Generate new token (classic)"**
5. Nom : "BlackjARK"
6. Coche : `repo` (tous les sous-items)
7. Click **"Generate token"**
8. **COPIE LE TOKEN** (tu ne le verras plus jamais !)
9. Utilise ce token comme mot de passe

**Option 2 : SSH (plus avancé)**
- Suis ce guide : [https://docs.github.com/en/authentication/connecting-to-github-with-ssh](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

**✅ Checkpoint** : Tu vois :
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
Total X (delta 0), reused 0 (delta 0)
To https://github.com/TON_USERNAME/blackjark.git
 * [new branch]      main -> main
```

---

## ✅ ÉTAPE 12 : Vérifier sur GitHub

1. **Rafraîchis la page GitHub** de ton repo
2. **Tu dois voir tous tes fichiers !** 🎉
   - README.md
   - public/
   - api/
   - package.json
   - etc.

**✅ Checkpoint** : Tous les fichiers sont sur GitHub !

---

## 🎉 BRAVO ! TON CODE EST SUR GITHUB ! 🎉

### Ce que tu as maintenant :

✅ Projet sur GitHub  
✅ URL : `https://github.com/TON_USERNAME/blackjark`  
✅ README professionnel visible  
✅ Code source accessible  
✅ Prêt pour Vercel !  

---

## ⚡ PROCHAINE ÉTAPE : Déployer sur Vercel

Maintenant que ton code est sur GitHub, on va le déployer sur Vercel !

### Guide Rapide :

1. Va sur [https://vercel.com](https://vercel.com)
2. **Sign Up with GitHub**
3. **Import Git Repository**
4. Choisis `blackjark`
5. Configure les variables :
   - `ASP_URL`
   - `ASP_WALLET_ID`
   - `ARK_NETWORK`
6. **Deploy !**

⏱️ Temps : ~2 minutes  
🚀 Résultat : `https://blackjark.vercel.app`

**Guide complet** : Lis `GITHUB_DEPLOY.md` dans ton projet

---

## 🆘 Problèmes Courants

### ❌ "Permission denied"
**Solution** : Utilise un Personal Access Token au lieu de ton mot de passe

### ❌ "Repository not found"
**Solution** : Vérifie l'URL avec `git remote -v` et corrige :
```bash
git remote remove origin
git remote add origin https://github.com/BON_USERNAME/blackjark.git
```

### ❌ "Failed to push"
**Solution** : 
```bash
git pull origin main --rebase
git push -u origin main
```

### ❌ "Not a git repository"
**Solution** : Tu n'es pas dans le bon dossier
```bash
cd /chemin/vers/blackjark
git init
```

---

## 📝 Commandes Utiles Pour Plus Tard

### Faire des modifications :

```bash
# 1. Modifie des fichiers...

# 2. Vérifie ce qui a changé
git status

# 3. Ajoute les changements
git add .

# 4. Commit
git commit -m "🎨 Update design"

# 5. Push
git push

# C'est tout !
```

### Voir l'historique :

```bash
git log
```

### Créer une branche :

```bash
git checkout -b nouvelle-feature
# Travaille sur la branche...
git push -u origin nouvelle-feature
```

---

## ✅ Checklist Finale

- [x] Extrait l'archive
- [x] Git installé
- [x] Git configuré (nom + email)
- [x] Compte GitHub créé
- [x] Repo GitHub créé
- [x] `git init` fait
- [x] Remote ajouté
- [x] Fichiers ajoutés (`git add .`)
- [x] Commit créé
- [x] Push réussi ! 🎉
- [ ] **Prochaine étape** : Déployer sur Vercel

---

## 💡 Conseils

- **Commit souvent** : À chaque changement important
- **Messages clairs** : Décris ce que tu as changé
- **Pull avant push** : `git pull` avant de `git push`
- **Branches** : Utilise des branches pour tester des features

---

## 🎓 Ressources pour Apprendre

- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [GitHub Guides](https://guides.github.com)
- [Learn Git Branching](https://learngitbranching.js.org)

---

**🎉 FÉLICITATIONS ! TU ES UN GITMASTER ! 🎉**

**📝 Prochaine étape** : Ouvre `GITHUB_DEPLOY.md` pour déployer sur Vercel !
