# 🚀 NubemSecrets Manager - Quick Start

## ⚡ Despliegue Rápido (5 minutos)

### 1. Crear Google OAuth Credentials

1. Ve a: https://console.cloud.google.com/apis/credentials?project=nubemsecrets
2. Click **"CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Tipo: **"Web application"**
4. Name: `NubemSecrets Manager`
5. **Authorized redirect URIs**:
   - `http://localhost:8080/auth/google/callback` (temporal)
6. Click **CREATE** y guarda el Client ID y Secret

### 2. Habilitar APIs

```bash
cd ~/nubemsecrets-manager

gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  --project=nubemsecrets
```

### 3. Configurar Secretos

```bash
./setup-secrets.sh
```

Ingresa cuando te lo pida:
- Google OAuth Client ID (del paso 1)
- Google OAuth Client Secret (del paso 1)

### 4. Desplegar Backend

```bash
./deploy-backend.sh
```

**Importante**: Copia la URL del backend que aparece al final.

### 5. Actualizar OAuth Callback

1. Vuelve a: https://console.cloud.google.com/apis/credentials?project=nubemsecrets
2. Edita el OAuth Client creado
3. En **Authorized redirect URIs**, añade:
   - `https://[TU-BACKEND-URL]/auth/google/callback`
4. Click **SAVE**

### 6. Desplegar Frontend

```bash
./deploy-frontend.sh
```

### 7. ¡Listo! 🎉

Abre la URL del frontend en tu navegador y haz login con tu cuenta de Google.

---

## 🔧 Comandos Útiles

```bash
./verify-setup.sh

gcloud run services logs read nubemsecrets-api --region europe-west1 --project nubemsecrets

gcloud run services logs read nubemsecrets-web --region europe-west1 --project nubemsecrets

./deploy-backend.sh

./deploy-frontend.sh
```

---

## 📖 Documentación Completa

Para más detalles, ver: `DEPLOYMENT_GUIDE.md`