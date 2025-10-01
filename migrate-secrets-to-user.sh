#!/bin/bash

# Script para migrar secretos existentes a un usuario específico

USER_EMAIL="david.anguera@nubemsystems.es"
USER_PREFIX="david_anguera_nubemsystems_es"

echo "=== Migración de Secretos a Usuario Específico ==="
echo "Usuario: $USER_EMAIL"
echo "Prefijo: $USER_PREFIX"
echo ""

# Lista de secretos a migrar (ajusta según necesidad)
SECRETS_TO_MIGRATE=(
  "anthropic-api-key"
  "api-key"
  "app-env"
  "clouding-api"
  "debug"
  "gemini-api-key"
  "github-token"
  "gitlab-token"
  "google-oauth-client-id"
  "google-oauth-client-secret"
)

echo "Secretos a migrar: ${#SECRETS_TO_MIGRATE[@]}"
echo ""
read -p "¿Deseas continuar con la migración? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]
then
  for SECRET in "${SECRETS_TO_MIGRATE[@]}"; do
    NEW_SECRET="${USER_PREFIX}_${SECRET}"

    echo "Migrando: $SECRET -> $NEW_SECRET"

    # Verificar si el secreto original existe
    if gcloud secrets describe "$SECRET" --project=nubemsecrets >/dev/null 2>&1; then
      # Verificar si el nuevo secreto ya existe
      if gcloud secrets describe "$NEW_SECRET" --project=nubemsecrets >/dev/null 2>&1; then
        echo "  ⚠️  El secreto $NEW_SECRET ya existe, saltando..."
      else
        # Obtener el valor del secreto original y crear el nuevo
        gcloud secrets versions access latest --secret="$SECRET" --project=nubemsecrets | \
        gcloud secrets create "$NEW_SECRET" \
          --data-file=- \
          --labels="owner=${USER_PREFIX},migrated=true" \
          --project=nubemsecrets

        if [ $? -eq 0 ]; then
          echo "  ✅ Migrado exitosamente"
        else
          echo "  ❌ Error al migrar"
        fi
      fi
    else
      echo "  ⚠️  El secreto $SECRET no existe"
    fi
    echo ""
  done

  echo "=== Migración Completada ==="
  echo ""
  echo "Los secretos migrados ahora aparecerán cuando el usuario $USER_EMAIL"
  echo "haga login en https://nubemsecrets-web-216552952339.europe-west1.run.app"
else
  echo "Migración cancelada"
fi