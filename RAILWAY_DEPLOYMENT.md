# Déploiement de Known sur Railway

Ce guide explique comment déployer Known (clone de Notion) sur Railway.

## Architecture

Known est composé de plusieurs services :
- **Frontend** : Next.js (React 19)
- **Backend** : Django + PostgreSQL
- **Collaboration** : Serveur Yjs (WebSocket)
- **Cache** : Redis
- **Auth** : Keycloak
- **Storage** : MinIO (S3-compatible)

## Prérequis

- Compte Railway : https://railway.app
- Railway CLI (optionnel) : `npm install -g @railway/cli`

## Option 1 : Déploiement Frontend uniquement (Recommandé pour commencer)

### Étapes :

1. **Connecte-toi à Railway** : https://railway.app

2. **Crée un nouveau projet** :
   - Clique sur "New Project"
   - Sélectionne "Deploy from GitHub repo"
   - Choisis le repo `Eric-Hei/known`

3. **Configure le service Frontend** :
   - Railway détectera automatiquement Next.js
   - Variables d'environnement à ajouter :
     ```
     NODE_ENV=production
     NEXT_PUBLIC_API_ORIGIN=https://your-backend-url.railway.app
     ```

4. **Build Settings** :
   - Root Directory: `src/frontend`
   - Build Command: `yarn install && yarn build`
   - Start Command: `yarn start`
   - Port: `3000`

5. **Déploie** :
   - Railway va automatiquement builder et déployer
   - Tu recevras une URL publique (ex: `https://known-production.up.railway.app`)

## Option 2 : Déploiement complet (Frontend + Backend)

### Services à créer sur Railway :

#### 1. PostgreSQL
- Ajoute un service PostgreSQL depuis le marketplace Railway
- Note les variables : `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

#### 2. Redis
- Ajoute un service Redis depuis le marketplace Railway
- Note la variable : `REDIS_URL`

#### 3. Backend Django
- **Root Directory** : `src/backend`
- **Build Command** : `pip install -r requirements.txt`
- **Start Command** : `python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
- **Variables d'environnement** :
  ```
  DJANGO_SETTINGS_MODULE=config.settings
  SECRET_KEY=<générer-une-clé-secrète>
  DATABASE_URL=${{Postgres.DATABASE_URL}}
  REDIS_URL=${{Redis.REDIS_URL}}
  ALLOWED_HOSTS=.railway.app
  DEBUG=False
  ```

#### 4. Frontend Next.js
- **Root Directory** : `src/frontend`
- **Build Command** : `yarn install && yarn build`
- **Start Command** : `yarn start`
- **Variables d'environnement** :
  ```
  NODE_ENV=production
  NEXT_PUBLIC_API_ORIGIN=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
  ```

#### 5. Serveur de Collaboration Yjs (Optionnel)
- **Root Directory** : `src/frontend/packages/server-y-provider`
- **Build Command** : `yarn install && yarn build`
- **Start Command** : `yarn start`
- **Variables d'environnement** :
  ```
  PORT=8080
  REDIS_URL=${{Redis.REDIS_URL}}
  ```

## Option 3 : Déploiement avec Railway CLI

### Installation :
```bash
npm install -g @railway/cli
railway login
```

### Déploiement :
```bash
# Dans le dossier du projet
cd C:\Users\lihe3\Documents\augment-projects\Known

# Initialiser Railway
railway init

# Créer les services
railway add --database postgres
railway add --database redis

# Déployer le frontend
cd src/frontend
railway up

# Déployer le backend
cd ../backend
railway up
```

## Configuration des variables d'environnement

### Frontend (src/frontend)
```env
NODE_ENV=production
NEXT_PUBLIC_API_ORIGIN=https://your-backend.railway.app
PORT=3000
```

### Backend (src/backend)
```env
DJANGO_SETTINGS_MODULE=config.settings
SECRET_KEY=your-secret-key-here
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
ALLOWED_HOSTS=.railway.app,.vercel.app
CORS_ALLOWED_ORIGINS=https://your-frontend.railway.app
DEBUG=False
```

## Vérification du déploiement

1. **Frontend** : Accède à l'URL fournie par Railway (ex: `https://known-production.up.railway.app`)
2. **Backend** : Vérifie l'API à `https://your-backend.railway.app/api/`
3. **Base de données** : Les données sont stockées dans PostgreSQL Railway

## Troubleshooting

### Erreur de build
- Vérifie que le `Root Directory` est correct
- Vérifie les logs de build dans Railway

### Erreur de connexion à la base de données
- Vérifie que `DATABASE_URL` est bien configuré
- Vérifie que les migrations ont été exécutées

### Erreur CORS
- Ajoute l'URL du frontend dans `CORS_ALLOWED_ORIGINS` du backend

## Mode Local-First (Sans Backend)

Si tu veux déployer uniquement le frontend en mode local-first :

1. Les bases de données seront stockées dans **IndexedDB** (navigateur)
2. Pas besoin de backend, PostgreSQL, Redis
3. Pas de collaboration en temps réel
4. Chaque utilisateur a ses propres données locales

Pour activer ce mode, il faudrait modifier le code pour désactiver les appels API backend.

## Coûts Railway

- **Plan Hobby** : $5/mois + usage
- **PostgreSQL** : ~$5-10/mois
- **Redis** : ~$5/mois
- **Services** : ~$5/mois par service

**Total estimé** : $20-30/mois pour l'application complète

## Recommandation

Pour commencer, je recommande :
1. **Déployer uniquement le frontend** sur Railway
2. **Tester l'application** avec les données locales (IndexedDB)
3. **Ajouter le backend** plus tard si besoin de collaboration

## Prochaines étapes

Dis-moi quelle option tu préfères :
- **A)** Frontend uniquement (simple, rapide, gratuit)
- **B)** Frontend + Backend complet (collaboration, authentification)
- **C)** Je t'aide à configurer Railway étape par étape

Je peux aussi créer un script de déploiement automatique si tu veux !

