#!/bin/bash

PROJECT_ID="nubemsecrets"

echo "🔐 Creando OAuth Client ID automáticamente..."

# Crear OAuth client usando gcloud
OAUTH_OUTPUT=$(gcloud alpha iap oauth-brands create \
  --application_title="NubemSecrets Manager" \
  --support_email="david.anguera@nubemsystems.es" \
  --project=$PROJECT_ID 2>&1)

echo "$OAUTH_OUTPUT"

# Crear OAuth client
CLIENT_OUTPUT=$(gcloud alpha iap oauth-clients create \
  projects/$PROJECT_ID/brands/216552952339 \
  --display_name="NubemSecrets Manager Web" 2>&1)

echo "$CLIENT_OUTPUT"