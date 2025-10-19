# Corrections de Sécurité Recommandées - Known

Ce document liste les corrections de sécurité que je peux appliquer immédiatement.

---

## 🔴 Corrections Critiques (À appliquer maintenant)

### 1. Mettre à jour pip (Vulnérabilité PVE-2025-75180)

**Commande**:
```powershell
cd src/backend
.\venv\Scripts\activate.ps1
python -m pip install --upgrade pip
```

**Impact**: Corrige une vulnérabilité permettant l'exécution de code via des fichiers wheel malveillants.

---

### 2. Configurer CSP pour Production

**Fichier**: `src/backend/impress/settings.py`

**Problème actuel**: Toutes les directives CSP sont à `NONE`, ce qui bloquera l'application en production.

**Solution proposée**: Configurer des directives CSP adaptées à Known.

---

### 3. Restreindre CORS en Développement

**Fichier**: `src/backend/impress/settings.py`

**Problème actuel**: `CORS_ALLOW_ALL_ORIGINS = True` en développement.

**Solution proposée**: Limiter aux origins nécessaires.

---

### 4. Ajouter Rate Limiting

**Fichier**: `src/backend/impress/settings.py`

**Problème actuel**: Pas de throttling sur les endpoints critiques (création de documents, upload de fichiers).

**Solution proposée**: Configurer des limites de taux appropriées.

---

### 5. Ajouter Headers de Sécurité HTTP (Frontend)

**Fichier**: `src/frontend/apps/impress/next.config.js`

**Problème actuel**: Aucun header de sécurité HTTP configuré.

**Solution proposée**: Ajouter X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

---

### 6. Renforcer Validation d'Entrée

**Fichiers**: `src/backend/core/api/serializers.py`

**Problème actuel**: Pas de limite de taille sur le contenu base64 et le texte AI.

**Solution proposée**: Ajouter des limites de taille maximale.

---

## 🟡 Corrections Moyennes (À planifier)

### 7. Améliorer Logs de Sécurité

**Fichiers**: `src/backend/core/api/permissions.py`, `src/backend/core/authentication/backends.py`

**Problème actuel**: Logs incomplets sur les tentatives d'accès refusées.

**Solution proposée**: Ajouter des logs de sécurité détaillés.

---

### 8. Nettoyer Secrets en Clair

**Fichiers**: 
- `env.d/development/common`
- `compose.yml`
- `src/helm/env.d/dev/values.impress.yaml.gotmpl`
- `src/helm/env.d/feature/values.impress.yaml.gotmpl`

**Problème actuel**: Secrets de développement en clair dans le repo.

**Solution proposée**: Remplacer par des placeholders.

---

## ❓ Veux-tu que j'applique ces corrections ?

**Options**:

1. **Tout appliquer maintenant** - Je corrige tous les points critiques (1-6)
2. **Sélection manuelle** - Tu me dis quels points appliquer
3. **Juste pip** - Je mets à jour pip uniquement
4. **Rien pour l'instant** - Tu veux d'abord revoir le rapport

**Dis-moi ce que tu préfères !**

