# Déploiement de Known sur Railway

Ce guide explique comment déployer Known (clone de Notion) sur Railway.

## ⚠️ Important

Known nécessite un backend complet car la création de documents se fait via des appels API.
Le mode "frontend uniquement" ne fonctionne pas.

## Architecture

Known est composé de plusieurs services :
- **Frontend** : Next.js (React 19)
- **Backend** : Django + PostgreSQL
- **Cache** : Redis
- **Collaboration** : Serveur Yjs (WebSocket) - optionnel
- **Auth** : Keycloak - optionnel pour démarrer
- **Storage** : MinIO (S3-compatible) - optionnel pour démarrer

## Prérequis

- Compte Railway : https://railway.app
- Compte GitHub avec le repo `Eric-Hei/known`

## 🚀 Déploiement complet (Recommandé)

### Étape 1 : Crée un nouveau projet Railway

1. **Connecte-toi à Railway** : https://railway.app
2. **Clique sur "New Project"**
3. **Sélectionne "Empty Project"**
4. **Nomme ton projet** : `known` ou `known-production`

### Étape 2 : Ajoute les bases de données

#### A. PostgreSQL

1. Dans ton projet Railway, clique sur **"+ New"**
2. Sélectionne **"Database"** → **"Add PostgreSQL"**
3. Railway va créer la base de données automatiquement
4. Note le nom du service (ex: `Postgres`)

#### B. Redis

1. Clique sur **"+ New"**
2. Sélectionne **"Database"** → **"Add Redis"**
3. Railway va créer Redis automatiquement
4. Note le nom du service (ex: `Redis`)

### Étape 3 : Déploie le Backend Django

1. **Clique sur "+ New"** → **"GitHub Repo"**
2. **Sélectionne** `Eric-Hei/known`
3. Railway va créer un service

**Configure le service Backend :**

**Settings → General :**
- **Service Name** : `backend`
- **Root Directory** : `src/backend`

**Settings → Deploy :**
- **Build Command** : `pip install -e .`
- **Start Command** : `python manage.py migrate && python manage.py collectstatic --noinput && gunicorn impress.wsgi:application --bind 0.0.0.0:$PORT --workers 2`

**Settings → Networking :**
- **Generate Domain** : Clique pour générer une URL publique
- Note l'URL (ex: `https://backend-production-xxxx.up.railway.app`)

**Settings → Variables :**

Ajoute ces variables d'environnement (clique sur "New Variable" pour chacune) :

```bash
# Django Core
DJANGO_SETTINGS_MODULE=impress.settings
DJANGO_CONFIGURATION=Production
DJANGO_SECRET_KEY=<génère-une-clé-secrète-longue-et-aléatoire>
DJANGO_ALLOWED_HOSTS=.railway.app
DEBUG=False

# Database (référence le service PostgreSQL)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}

# Redis (référence le service Redis)
REDIS_URL=${{Redis.REDIS_URL}}

# CSRF & CORS
DJANGO_CSRF_TRUSTED_ORIGINS=https://*.railway.app
DJANGO_CORS_ALLOWED_ORIGINS=https://*.railway.app

# Superuser (pour créer un admin au premier déploiement)
DJANGO_SUPERUSER_PASSWORD=admin123
DJANGO_SUPERUSER_EMAIL=admin@example.com

# Storage (utilise le système de fichiers local pour commencer)
STORAGES_STATICFILES_BACKEND=django.contrib.staticfiles.storage.StaticFilesStorage

# Base URL
IMPRESS_BASE_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Email (optionnel - désactivé pour commencer)
DJANGO_EMAIL_HOST=smtp.example.com
DJANGO_EMAIL_PORT=587

# Python
PYTHONPATH=/app/src/backend
```

**💡 Astuce** : Pour générer une clé secrète Django :
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Étape 4 : Déploie le Frontend Next.js

1. **Clique sur "+ New"** → **"GitHub Repo"**
2. **Sélectionne** `Eric-Hei/known` (même repo)
3. Railway va créer un deuxième service

**Configure le service Frontend :**

**Settings → General :**
- **Service Name** : `frontend`
- **Root Directory** : `src/frontend`

**Settings → Deploy :**
- **Build Command** : `yarn install && yarn build`
- **Start Command** : `yarn start`

**Settings → Networking :**
- **Generate Domain** : Clique pour générer une URL publique
- C'est cette URL que tu utiliseras pour accéder à l'application !

**Settings → Variables :**

```bash
NODE_ENV=production
PORT=3000

# Backend API (référence le service backend)
NEXT_PUBLIC_API_ORIGIN=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}

# App info
NEXT_PUBLIC_APP_NAME=Known
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Étape 5 : Déploie ! 🚀

1. **Railway va automatiquement démarrer le build** de tous les services
2. **Attends 5-10 minutes** pour le premier déploiement
3. **Vérifie les logs** de chaque service pour voir si tout fonctionne

**Ordre de déploiement :**
1. PostgreSQL ✅ (instantané)
2. Redis ✅ (instantané)
3. Backend ⏳ (5-7 minutes)
4. Frontend ⏳ (3-5 minutes)

### Étape 6 : Teste l'application

1. **Accède à l'URL du frontend** (ex: `https://frontend-production-xxxx.up.railway.app`)
2. **Crée un compte** ou connecte-toi
3. **Crée un document** pour tester l'API backend
4. **Crée une base de données** avec `/database`

## 🔧 Configuration optionnelle

### Serveur de Collaboration Yjs (pour la collaboration en temps réel)

Si tu veux activer la collaboration en temps réel :

1. **Clique sur "+ New"** → **"GitHub Repo"**
2. **Sélectionne** `Eric-Hei/known`

**Settings → General :**
- **Service Name** : `collaboration`
- **Root Directory** : `src/frontend/packages/server-y-provider`

**Settings → Deploy :**
- **Build Command** : `yarn install && yarn build`
- **Start Command** : `yarn start`

**Settings → Variables :**
```bash
PORT=4444
REDIS_URL=${{Redis.REDIS_URL}}
COLLABORATION_SERVER_SECRET=my-secret-key
```

Puis ajoute ces variables au **Backend** :
```bash
COLLABORATION_API_URL=https://${{collaboration.RAILWAY_PUBLIC_DOMAIN}}/collaboration/api/
COLLABORATION_WS_URL=wss://${{collaboration.RAILWAY_PUBLIC_DOMAIN}}/collaboration/ws/
COLLABORATION_SERVER_SECRET=my-secret-key
```

Et au **Frontend** :
```bash
NEXT_PUBLIC_COLLABORATION_WS_URL=wss://${{collaboration.RAILWAY_PUBLIC_DOMAIN}}/collaboration/ws/
```

## ✅ Vérification du déploiement

### 1. Vérifie les logs

Dans Railway, pour chaque service :
- Clique sur le service
- Va dans l'onglet **"Deployments"**
- Clique sur le dernier déploiement
- Vérifie les logs

**Backend** - Tu devrais voir :
```
Running migrations...
Collecting static files...
Starting Gunicorn...
Listening on 0.0.0.0:XXXX
```

**Frontend** - Tu devrais voir :
```
Building...
Compiled successfully
Ready on http://0.0.0.0:3000
```

### 2. Teste l'API Backend

Ouvre dans ton navigateur :
```
https://backend-production-xxxx.up.railway.app/api/v1.0/
```

Tu devrais voir une réponse JSON de l'API Django.

### 3. Teste le Frontend

Ouvre dans ton navigateur :
```
https://frontend-production-xxxx.up.railway.app
```

Tu devrais voir l'application Known !

## 🐛 Troubleshooting

### ❌ Erreur : "Application failed to respond"

**Cause** : Le backend ne démarre pas correctement

**Solutions** :
1. Vérifie les logs du backend dans Railway
2. Vérifie que toutes les variables d'environnement sont configurées
3. Vérifie que les migrations ont été exécutées
4. Redéploie le service

### ❌ Erreur : "CORS policy"

**Cause** : Le frontend ne peut pas appeler le backend

**Solutions** :
1. Vérifie que `DJANGO_CORS_ALLOWED_ORIGINS` contient `https://*.railway.app`
2. Vérifie que `NEXT_PUBLIC_API_ORIGIN` pointe vers le bon backend
3. Redéploie le backend après avoir modifié les variables

### ❌ Erreur : "Database connection failed"

**Cause** : Le backend ne peut pas se connecter à PostgreSQL

**Solutions** :
1. Vérifie que les variables `DB_*` sont correctement configurées
2. Vérifie que le service PostgreSQL est démarré
3. Utilise les références `${{Postgres.PGDATABASE}}` au lieu de valeurs en dur

### ❌ Erreur : "Module not found"

**Cause** : Les dépendances ne sont pas installées

**Solutions** :
1. Vérifie que le `Root Directory` est correct
2. Vérifie que la commande de build s'exécute correctement
3. Vérifie les logs de build

### ❌ Le frontend se charge mais ne peut pas créer de documents

**Cause** : Le frontend ne peut pas communiquer avec le backend

**Solutions** :
1. Vérifie que `NEXT_PUBLIC_API_ORIGIN` est configuré
2. Vérifie que le backend est accessible publiquement
3. Ouvre la console du navigateur pour voir les erreurs réseau

## 💰 Coûts Railway

Railway fonctionne avec un système de crédits :

- **Plan Hobby** : $5/mois de crédits inclus
- **PostgreSQL** : ~$5-10/mois
- **Redis** : ~$3-5/mois
- **Backend** : ~$5-10/mois (selon l'utilisation)
- **Frontend** : ~$5-10/mois (selon l'utilisation)

**Total estimé** : $20-35/mois pour l'application complète

**💡 Astuce** : Railway offre $5 de crédits gratuits pour commencer !

## 📊 Monitoring

### Voir les métriques

Dans Railway, pour chaque service :
- **Metrics** : CPU, RAM, Network
- **Logs** : Logs en temps réel
- **Deployments** : Historique des déploiements

### Redéployer un service

1. Va dans le service
2. Clique sur **"Deployments"**
3. Clique sur **"Redeploy"**

### Rollback

1. Va dans **"Deployments"**
2. Trouve un déploiement précédent qui fonctionnait
3. Clique sur **"Redeploy"**

## 🔐 Sécurité

### Changer le mot de passe admin

Une fois déployé, connecte-toi au backend et change le mot de passe :

```bash
# Via Railway CLI
railway run python manage.py changepassword admin
```

Ou crée un nouveau superuser :

```bash
railway run python manage.py createsuperuser
```

### Variables secrètes

- ✅ Utilise des clés secrètes longues et aléatoires
- ✅ Ne commit jamais les secrets dans Git
- ✅ Utilise les variables d'environnement Railway

## 📝 Récapitulatif

### Services à créer :

1. ✅ **PostgreSQL** (Database)
2. ✅ **Redis** (Database)
3. ✅ **Backend** (GitHub Repo - `src/backend`)
4. ✅ **Frontend** (GitHub Repo - `src/frontend`)
5. ⚪ **Collaboration** (Optionnel - `src/frontend/packages/server-y-provider`)

### Variables d'environnement essentielles :

**Backend :**
- `DJANGO_SECRET_KEY` ⚠️ Important !
- `DB_*` (référence PostgreSQL)
- `REDIS_URL` (référence Redis)
- `DJANGO_ALLOWED_HOSTS=.railway.app`

**Frontend :**
- `NEXT_PUBLIC_API_ORIGIN` (référence Backend)
- `NODE_ENV=production`

## 🎯 Prochaines étapes

1. **Suis le guide étape par étape** ci-dessus
2. **Déploie les 4 services** (PostgreSQL, Redis, Backend, Frontend)
3. **Teste l'application** avec l'URL du frontend
4. **Crée un document** pour vérifier que l'API fonctionne
5. **Crée une base de données** avec `/database`

## 🆘 Besoin d'aide ?

Si tu rencontres des problèmes :
1. Vérifie les logs dans Railway
2. Vérifie que toutes les variables d'environnement sont configurées
3. Vérifie que les services sont démarrés
4. Demande-moi de l'aide avec les logs d'erreur !

Bonne chance ! 🚀

