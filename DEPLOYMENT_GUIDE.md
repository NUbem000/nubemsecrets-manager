# 🚀 Guía de Despliegue - NubemSecrets Manager

## Requisitos Previos

- Cuenta de Google Cloud con proyecto `nubemsecrets` activo
- `gcloud` CLI instalado y configurado
- Node.js 20+ instalado localmente (para desarrollo)
- Permisos de administrador en el proyecto GCP

## 📋 Pasos de Configuración

### 1. Configurar Google OAuth 2.0

1. Ve a [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
2. Selecciona el proyecto `nubemsecrets`
3. Haz clic en **"CREATE CREDENTIALS"** > **"OAuth client ID"**
4. Selecciona tipo: **"Web application"**
5. Configura:
   - **Name**: `NubemSecrets Manager`
   - **Authorized JavaScript origins**:
     - `http://localhost:8080` (desarrollo)
     - `https://nubemsecrets-api-XXXXX-ew.a.run.app` (producción - añadir después del deploy)
   - **Authorized redirect URIs**:
     - `http://localhost:8080/auth/google/callback` (desarrollo)
     - `https://nubemsecrets-api-XXXXX-ew.a.run.app/auth/google/callback` (producción)
6. Haz clic en **"CREATE"**
7. **Guarda** el Client ID y Client Secret

### 2. Habilitar APIs Necesarias

```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  iamcredentials.googleapis.com \
  --project=nubemsecrets
```

### 3. Configurar Permisos IAM

```bash
PROJECT_ID="nubemsecrets"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4. Crear Secretos en Google Secret Manager

Ejecuta el script interactivo:

```bash
cd ~/nubemsecrets-manager
./setup-secrets.sh
```

Este script te pedirá:
- Google OAuth Client ID
- Google OAuth Client Secret
- Generará automáticamente un Session Secret

### 5. Desplegar Backend

```bash
./deploy-backend.sh
```

El script mostrará la URL del backend. **Copia esta URL**.

### 6. Actualizar OAuth Callback URL

1. Vuelve a [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
2. Edita el OAuth Client creado
3. Añade a **Authorized redirect URIs**:
   - `https://[TU-BACKEND-URL]/auth/google/callback`
4. Guarda los cambios

### 7. Desplegar Frontend

```bash
./deploy-frontend.sh
```

El script detectará automáticamente la URL del backend y configurará el frontend.

## ✅ Verificación del Deployment

### Verificar Backend

```bash
BACKEND_URL=$(gcloud run services describe nubemsecrets-api \
  --region europe-west1 \
  --project nubemsecrets \
  --format 'value(status.url)')

echo "Backend URL: $BACKEND_URL"

curl $BACKEND_URL/health
```

Debería responder:
```json
{"status":"healthy","timestamp":"2025-09-26T..."}
```

### Verificar Frontend

```bash
FRONTEND_URL=$(gcloud run services describe nubemsecrets-web \
  --region europe-west1 \
  --project nubemsecrets \
  --format 'value(status.url)')

echo "Frontend URL: $FRONTEND_URL"
echo "Abre en tu navegador: $FRONTEND_URL"
```

## 🔐 Configuración de Seguridad

### Restringir Acceso por Dominio

El backend solo permite emails del dominio `@nubemsystems.es`. Para cambiar esto:

1. Edita `backend/src/config/passport.ts`
2. Cambia la línea:
   ```typescript
   const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'nubemsystems.es';
   ```
3. Redeploya el backend

### Rate Limiting

Por defecto:
- **Ventana**: 15 minutos
- **Máximo de requests**: 100 por IP

Para ajustar, edita `backend/.env.example` y redeploya.

## 🛠️ Desarrollo Local

### Backend

```bash
cd backend
npm install
cp .env.example .env

# Edita .env con tus credenciales
nano .env

# Iniciar en modo desarrollo
npm run dev
```

El backend correrá en `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local

# Edita .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local

# Iniciar en modo desarrollo
npm run dev
```

El frontend correrá en `http://localhost:3000`

## 📊 Monitoreo

### Ver logs del backend

```bash
gcloud run services logs read nubemsecrets-api \
  --region europe-west1 \
  --project nubemsecrets \
  --limit 50
```

### Ver logs del frontend

```bash
gcloud run services logs read nubemsecrets-web \
  --region europe-west1 \
  --project nubemsecrets \
  --limit 50
```

### Métricas en Cloud Console

1. Ve a [Cloud Run](https://console.cloud.google.com/run)
2. Selecciona el servicio
3. Pestaña **"METRICS"** para ver:
   - Request count
   - Request latencies
   - Container instance count
   - CPU/Memory utilization

## 🔄 Actualizar la Aplicación

### Actualizar Backend

```bash
cd ~/nubemsecrets-manager
./deploy-backend.sh
```

### Actualizar Frontend

```bash
cd ~/nubemsecrets-manager
./deploy-frontend.sh
```

## 🐛 Troubleshooting

### Error: "OAuth callback mismatch"

**Causa**: La URL de callback no está autorizada en Google Console.

**Solución**:
1. Ve a Google Cloud Console > APIs & Services > Credentials
2. Edita el OAuth Client
3. Añade la URL correcta del backend + `/auth/google/callback`

### Error: "Secret not found"

**Causa**: Los secretos no están creados en Secret Manager.

**Solución**:
```bash
./setup-secrets.sh
```

### Error: "Permission denied on Secret Manager"

**Causa**: El service account no tiene permisos.

**Solución**:
```bash
PROJECT_ID="nubemsecrets"
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.admin"
```

### Backend no puede acceder a Secret Manager

**Causa**: Permisos IAM incorrectos.

**Solución**:
```bash
PROJECT_NUMBER=$(gcloud projects describe nubemsecrets --format="value(projectNumber)")

gcloud projects add-iam-policy-binding nubemsecrets \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 💰 Costos Estimados

### Cloud Run

- Backend: ~$5-10/mes (tráfico bajo)
- Frontend: ~$5-10/mes (tráfico bajo)
- Min instances = 0 (escala a cero cuando no hay uso)

### Secret Manager

- 3 secretos adicionales: ~$0.18/mes
- Accesos: ~$0.03/mes

**Total estimado: $10-20 USD/mes**

## 🎯 Configuración de Dominio Personalizado (Opcional)

Para usar un dominio personalizado:

```bash
gcloud run domain-mappings create \
  --service nubemsecrets-web \
  --domain secrets.tudominio.com \
  --region europe-west1 \
  --project nubemsecrets
```

Luego configura los registros DNS según las instrucciones de Cloud Run.

## 📞 Soporte

Para problemas o preguntas:
- Email: david.anguera@nubemsystems.es
- Documentación: `/home/david/nubemsecrets-manager/README.md`

## 🔒 Seguridad

**IMPORTANTE**: Nunca commitees a Git:
- Archivos `.env`
- Credenciales de OAuth
- Session secrets
- API keys

Todos los secretos deben estar en Google Secret Manager.