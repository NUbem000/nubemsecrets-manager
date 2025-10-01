#!/bin/bash

echo "=== Creando Repositorio GitHub para NubemSecrets Manager ==="
echo ""

# Configuración
REPO_NAME="nubemsecrets-manager"
ORG_NAME="NUbem000"
DESCRIPTION="🔐 Gestor de Secretos Multi-tenant con Google Cloud Secret Manager - OAuth2, TypeScript, Next.js"

echo "📦 Creando repositorio: $ORG_NAME/$REPO_NAME"
echo ""

# Crear el repositorio en GitHub
gh repo create "$ORG_NAME/$REPO_NAME" \
  --public \
  --description "$DESCRIPTION" \
  --add-readme \
  --clone=false

if [ $? -eq 0 ]; then
  echo "✅ Repositorio creado exitosamente"
  echo ""

  # Inicializar Git en el directorio local
  echo "🔧 Inicializando repositorio local..."
  cd /home/david/nubemsecrets-manager

  # Eliminar referencia al repositorio anterior si existe
  rm -rf .git

  # Inicializar nuevo repositorio
  git init

  # Agregar remote
  git remote add origin "https://github.com/$ORG_NAME/$REPO_NAME.git"

  # Crear .gitignore
  cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/
out/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp

# Google Cloud
*.json
!package.json
!package-lock.json
!tsconfig.json
cloud-sql-key.json

# Secrets (important!)
session-secret
*-secret.txt
*.key
*.pem
*.crt

# Documentation temp files
*.md.backup
FIXES_APPLIED.md
FIXED_AUTHENTICATION_ISSUES.md
FIX_SESSION_PROBLEM.md
EOF

  echo "📝 .gitignore creado"

  # Crear README
  cat > README.md << 'EOF'
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
EOF

  echo "📄 README.md creado"

  # Agregar archivos
  git add .

  # Primer commit
  git commit -m "🚀 Initial commit - NubemSecrets Manager v1.0

- Multi-tenant secrets management
- Google OAuth2 authentication
- TypeScript + Next.js + Express
- Google Cloud Secret Manager integration
- Complete CRUD operations for secrets
- User isolation and security"

  # Push al repositorio
  echo ""
  echo "🚀 Subiendo código a GitHub..."
  git branch -M main
  git push -u origin main

  echo ""
  echo "✅ ¡Repositorio creado y código subido!"
  echo ""
  echo "🔗 URL del repositorio: https://github.com/$ORG_NAME/$REPO_NAME"
  echo ""
  echo "📋 Próximos pasos:"
  echo "1. Configurar GitHub Actions para CI/CD"
  echo "2. Añadir badges al README"
  echo "3. Crear releases con tags"
  echo "4. Documentar la API"

else
  echo "❌ Error al crear el repositorio"
  echo "Puedes crearlo manualmente en: https://github.com/organizations/$ORG_NAME/repositories/new"
fi