# 🔐 NubemSecrets Manager

Gestor de secretos multi-tenant seguro basado en Google Cloud Secret Manager.

## ✨ Características

- 🔒 **Multi-tenancy**: Cada usuario tiene su propio espacio aislado de secretos
- 🔑 **Autenticación OAuth2**: Login seguro con Google
- 🚀 **Tecnología moderna**: TypeScript, Next.js 14, Express, Tailwind CSS
- ☁️ **Cloud Native**: Desplegado en Google Cloud Run
- 🛡️ **Seguridad**: Aislamiento total entre usuarios, cifrado en reposo

## 🏗️ Arquitectura

```
Frontend (Next.js) → Backend API (Express) → Google Secret Manager
                          ↓
                    Google OAuth 2.0
```

## 🚀 Despliegue

### Prerrequisitos

- Node.js 20+
- Cuenta de Google Cloud Platform
- Proyecto GCP configurado con Secret Manager API habilitada

### Variables de Entorno

Backend:
```env
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_CALLBACK_URL=https://tu-backend-url/auth/google/callback
FRONTEND_URL=https://tu-frontend-url
GCP_PROJECT_ID=tu-proyecto-id
SESSION_SECRET=tu-session-secret
NODE_ENV=production
```

Frontend:
```env
NEXT_PUBLIC_API_URL=https://tu-backend-url
```

### Comandos

```bash
# Backend
cd backend
npm install
npm run build
npm start

# Frontend
cd frontend
npm install
npm run build
npm start
```

## 🐳 Docker

```bash
# Backend
docker build -t nubemsecrets-api ./backend
docker run -p 8080:8080 nubemsecrets-api

# Frontend
docker build -t nubemsecrets-web ./frontend
docker run -p 3000:3000 nubemsecrets-web
```

## 📝 Licencia

MIT

## 👥 Equipo

Desarrollado por NubemSystems
