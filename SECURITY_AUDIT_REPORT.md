# Rapport d'Audit de Sécurité - Known
**Date**: 2025-10-19  
**Projet**: Known (fork de Docs/Impress)  
**Scope**: Backend Django + Frontend Next.js + Serveur de collaboration Yjs

---

## 🔒 Résumé Exécutif

### ✅ Points Positifs
- **Aucune vulnérabilité** détectée dans les dépendances npm (1657 packages audités)
- **1 seule vulnérabilité mineure** dans les dépendances Python (pip 24.3.1 < 25.0)
- Authentification OIDC robuste avec support PKCE
- Détection de malware active (JCOP backend)
- Content Security Policy (CSP) configurée
- Validation stricte des uploads de fichiers (MIME type, taille, extension)
- Permissions granulaires basées sur les rôles (Owner/Admin/Editor/Reader)
- Protection CSRF, HSTS, cookies sécurisés en production

### ⚠️ Problèmes Critiques Résolus
1. ✅ **Fichier `.env` commité** - CORRIGÉ (supprimé du repo, ajouté au .gitignore)

### 🟡 Vulnérabilités Python Détectées
1. **pip 24.3.1** - Vulnérabilité dans le traitement de fichiers wheel malveillants (PVE-2025-75180)
   - **Sévérité**: Basse
   - **Fix**: Mettre à jour pip vers >= 25.0
   - **Impact**: Faible (exploitation nécessite installation de packages malveillants)

### 🔴 Vulnérabilités à Corriger

#### Haute Priorité
1. **Secrets en clair dans le code** (env.d/, compose.yml, Helm charts)
2. **CORS potentiellement trop permissif** en développement
3. **Absence de rate limiting** sur certains endpoints critiques
4. **CSP non configurée** pour la production (directives vides)

#### Moyenne Priorité
5. **Validation d'entrée insuffisante** sur certains champs
6. **Logs de sécurité incomplets**
7. **Absence de headers de sécurité HTTP** côté frontend

---

## 📋 Détails des Vulnérabilités

### 1. 🔴 CRITIQUE - Secrets en clair dans le repository

**Fichiers concernés**:
- `env.d/development/common` (lignes 30-31, 41, 55, 62)
- `compose.yml` (lignes 29-30)
- `src/helm/env.d/dev/values.impress.yaml.gotmpl` (ligne 8)
- `src/helm/env.d/feature/values.impress.yaml.gotmpl` (lignes 1, 9, 19, 23)

**Exemples**:
```bash
# env.d/development/common
AWS_S3_ACCESS_KEY_ID=impress
AWS_S3_SECRET_ACCESS_KEY=password
OIDC_RP_CLIENT_SECRET=ThisIsAnExampleKeyForDevPurposeOnly
AI_API_KEY=password
COLLABORATION_SERVER_SECRET=my-secret
```

**Impact**: Même si ce sont des valeurs de développement, elles peuvent être réutilisées en production par erreur.

**Recommandation**:
- Remplacer toutes les valeurs par des placeholders (`<CHANGE_ME>`)
- Utiliser des fichiers `.local` (déjà dans .gitignore) pour les vraies valeurs
- Ajouter un script de validation pre-commit pour détecter les secrets

---

### 2. 🔴 HAUTE - CORS trop permissif en développement

**Fichier**: `src/backend/impress/settings.py` (ligne 901)

```python
class Development(Base):
    ALLOWED_HOSTS = ["*"]
    CORS_ALLOW_ALL_ORIGINS = True  # ⚠️ Dangereux
```

**Impact**: Permet à n'importe quel domaine d'accéder à l'API en développement. Risque si le serveur de dev est exposé.

**Recommandation**:
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:8071"]
CORS_ALLOW_ALL_ORIGINS = False
```

---

### 3. 🔴 HAUTE - Content Security Policy non configurée

**Fichier**: `src/backend/impress/settings.py` (lignes 779-809)

```python
CONTENT_SECURITY_POLICY = {
    "DIRECTIVES": {
        "default-src": [NONE],  # Bloque tout par défaut
        "script-src": [NONE],
        "style-src": [NONE],
        # ... tous à NONE
    }
}
```

**Impact**: En production, la CSP bloquera toutes les ressources (scripts, styles, images). L'application ne fonctionnera pas.

**Recommandation**:
```python
"DIRECTIVES": {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'"],  # À affiner
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "connect-src": ["'self'", settings.COLLABORATION_WS_URL, "https://api.posthog.com"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
}
```

---

### 4. 🟠 MOYENNE - Rate Limiting insuffisant

**Fichiers**: `src/backend/core/api/viewsets.py`

**Endpoints sans throttling**:
- `/api/v1.0/documents/` (création de documents)
- `/api/v1.0/documents/<id>/attachment-upload/` (upload de fichiers)
- `/api/v1.0/templates/` (création de templates)

**Throttling actuel**:
- UserViewSet: `UserListThrottleBurst` et `UserListThrottleSustained` (seulement sur list)
- DocumentViewSet, TemplateViewSet: `throttle_scope` défini mais pas de classes de throttle

**Recommandation**:
Ajouter dans `settings.py`:
```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'document_create': '50/hour',
        'attachment_upload': '100/hour',
    }
}
```

---

### 5. 🟠 MOYENNE - Validation d'entrée à renforcer

**Fichier**: `src/backend/core/api/serializers.py`

**Exemples**:

#### a) Validation de contenu base64 (ligne 263-273)
```python
def validate_content(self, value):
    if not value:
        return None
    try:
        b64decode(value, validate=True)
    except binascii.Error as err:
        raise serializers.ValidationError("Invalid base64 content.") from err
    return value
```
✅ **Bon**: Validation base64  
⚠️ **Manque**: Limite de taille du contenu décodé

**Recommandation**:
```python
decoded = b64decode(value, validate=True)
if len(decoded) > 50 * 1024 * 1024:  # 50MB max
    raise serializers.ValidationError("Content too large")
```

#### b) Validation AI Transform (ligne 836-841)
```python
def validate_text(self, value):
    if len(value.strip()) == 0:
        raise serializers.ValidationError("Text field cannot be empty.")
    return value
```
⚠️ **Manque**: Limite de longueur maximale

**Recommandation**:
```python
if len(value) > 100000:  # 100k caractères max
    raise serializers.ValidationError("Text too long")
```

---

### 6. 🟠 MOYENNE - Logs de sécurité incomplets

**Fichier**: `src/backend/core/malware_detection.py` (ligne 39-44)

```python
security_logger.warning(
    "File %s for document %s is infected with malware. Error info: %s",
    file_path,
    document_id,
    error_info,
)
```

✅ **Bon**: Log des fichiers infectés  
⚠️ **Manque**: 
- Logs des tentatives d'authentification échouées
- Logs des accès refusés (403/404)
- Logs des modifications de permissions

**Recommandation**:
Ajouter dans `src/backend/core/api/permissions.py`:
```python
def has_object_permission(self, request, view, obj):
    has_permission = abilities.get(action, False)
    if not has_permission:
        security_logger.warning(
            "Access denied: user=%s, action=%s, object=%s",
            request.user.id, action, obj.id
        )
    return has_permission
```

---

### 7. 🟡 BASSE - Headers de sécurité HTTP manquants (Frontend)

**Fichier**: `src/frontend/apps/impress/next.config.js`

**Headers manquants**:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`

**Recommandation**:
Ajouter dans `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ];
},
```

---

## ✅ Points Forts de Sécurité

### 1. Authentification & Autorisation
- ✅ OIDC avec PKCE (S256)
- ✅ Tokens refresh chiffrés (Fernet)
- ✅ Permissions granulaires par rôle
- ✅ Vérification des abilities à chaque requête
- ✅ Server-to-server authentication avec Bearer tokens

### 2. Upload de Fichiers
- ✅ Validation MIME type avec `python-magic`
- ✅ Vérification extension vs MIME type
- ✅ Détection de fichiers "unsafe" (executables, scripts)
- ✅ Scan antimalware asynchrone (JCOP)
- ✅ Limite de taille (10MB par défaut)
- ✅ Stockage S3 avec metadata de sécurité

### 3. Protection Django
- ✅ CSRF protection activée
- ✅ HSTS configuré (production)
- ✅ Cookies sécurisés (Secure, HttpOnly)
- ✅ SSL redirect en production
- ✅ XSS filter activé
- ✅ Content-Type nosniff activé

### 4. Collaboration Server (Yjs)
- ✅ Authentification par API key
- ✅ CORS configuré avec liste blanche
- ✅ Validation des origins

---

## 📊 Checklist de Déploiement Production

### Avant le déploiement

- [ ] Générer des secrets forts pour toutes les variables d'environnement
- [ ] Configurer CSP avec directives appropriées
- [ ] Activer rate limiting sur tous les endpoints
- [ ] Configurer CORS avec liste blanche stricte
- [ ] Ajouter headers de sécurité HTTP
- [ ] Configurer ALLOWED_HOSTS avec domaine exact
- [ ] Vérifier que DEBUG=False
- [ ] Exécuter `python manage.py check --deploy`
- [ ] Tester l'upload de fichiers malveillants
- [ ] Vérifier les logs de sécurité

### Monitoring continu

- [ ] Activer Sentry pour les erreurs
- [ ] Configurer alertes sur tentatives d'authentification échouées
- [ ] Monitorer les fichiers détectés comme malware
- [ ] Audit régulier des dépendances (`yarn audit`, `pip-audit`)
- [ ] Revue des accès et permissions

---

## 🛠️ Actions Recommandées (Priorité)

### ✅ Immédiat (Critique) - COMPLÉTÉ
1. ✅ Supprimer `.env` du repo (FAIT)
2. ✅ Mettre à jour pip vers 25.2 (FAIT - corrige PVE-2025-75180)
3. ✅ Configurer CSP pour production (FAIT - directives sécurisées)
4. ✅ Restreindre CORS en développement (FAIT - whitelist d'origins)
5. ✅ Ajouter rate limiting sur endpoints critiques (FAIT - 20/min uploads, 10/min AI)
6. ✅ Ajouter headers de sécurité HTTP frontend (FAIT - X-Frame-Options, etc.)
7. ✅ Renforcer validation d'entrée (FAIT - limites 50MB content, 100k chars AI)

**Commit**: `d72f52f` - "security: Apply critical security fixes"

### Court terme (1-2 semaines)
8. Remplacer secrets en clair par placeholders dans env.d/

### Moyen terme (1 mois)
9. Implémenter logs de sécurité complets
10. Ajouter pre-commit hooks pour détecter secrets
11. Mettre en place monitoring Sentry
12. Audit de sécurité externe (optionnel)

---

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Security Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [Content Security Policy](https://content-security-policy.com/)

