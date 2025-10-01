# 🚀 Pasos para Desplegar NubemSecrets Manager

## ✅ Ya Completado

- [x] Código creado en `~/nubemsecrets-manager/`
- [x] APIs habilitadas en GCP
- [x] Permisos IAM configurados

## 📝 Siguiente Paso: Crear OAuth Credentials (2 minutos)

### 1. Abre este enlace:
```
https://console.cloud.google.com/apis/credentials?project=nubemsecrets
```

### 2. Clic en "+ CREATE CREDENTIALS" → "OAuth client ID"

### 3. Si te pide configurar consent screen:
- Clic "CONFIGURE CONSENT SCREEN"
- User Type: **Internal**
- App name: `NubemSecrets Manager`
- User support email: tu email
- Click "SAVE AND CONTINUE" (3 veces hasta el final)

### 4. Crear OAuth Client:
- Application type: **Web application**
- Name: `NubemSecrets Manager`
- **Authorized JavaScript origins:**
  - `http://localhost:8080`
- **Authorized redirect URIs:**
  - `http://localhost:8080/auth/google/callback`
- Click **CREATE**

### 5. Copiar credenciales y ejecutar:

```bash
cd ~/nubemsecrets-manager
./setup-secrets.sh
```

(Te pedirá el Client ID y Secret que copiaste)

### 6. Desplegar backend:

```bash
./deploy-backend.sh
```

### 7. Actualizar OAuth con URL del backend

Edita el OAuth Client y añade a "Authorized redirect URIs":
```
https://[URL-DEL-BACKEND]/auth/google/callback
```

### 8. Desplegar frontend:

```bash
./deploy-frontend.sh
```

## ✅ Listo!

Abre la URL del frontend en tu navegador.