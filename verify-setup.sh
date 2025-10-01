#!/bin/bash

PROJECT_ID="nubemsecrets"
REGION="europe-west1"

echo "🔍 Verificando configuración de NubemSecrets Manager..."
echo ""

echo "📋 Proyecto GCP:"
gcloud config get-value project
echo ""

echo "🔐 Verificando APIs habilitadas..."
REQUIRED_APIS=(
  "run.googleapis.com"
  "secretmanager.googleapis.com"
  "cloudbuild.googleapis.com"
  "iamcredentials.googleapis.com"
)

for api in "${REQUIRED_APIS[@]}"; do
  if gcloud services list --enabled --project=$PROJECT_ID --filter="name:$api" --format="value(name)" | grep -q "$api"; then
    echo "✅ $api"
  else
    echo "❌ $api (no habilitada)"
  fi
done

echo ""
echo "🔑 Verificando secretos en Secret Manager..."
REQUIRED_SECRETS=(
  "google-oauth-client-id"
  "google-oauth-client-secret"
  "session-secret"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
  if gcloud secrets describe $secret --project=$PROJECT_ID &>/dev/null; then
    echo "✅ $secret"
  else
    echo "❌ $secret (no existe)"
  fi
done

echo ""
echo "🚀 Verificando servicios desplegados..."

if gcloud run services describe nubemsecrets-api --region=$REGION --project=$PROJECT_ID &>/dev/null; then
  BACKEND_URL=$(gcloud run services describe nubemsecrets-api --region=$REGION --project=$PROJECT_ID --format='value(status.url)')
  echo "✅ Backend: $BACKEND_URL"
else
  echo "❌ Backend: no desplegado"
fi

if gcloud run services describe nubemsecrets-web --region=$REGION --project=$PROJECT_ID &>/dev/null; then
  FRONTEND_URL=$(gcloud run services describe nubemsecrets-web --region=$REGION --project=$PROJECT_ID --format='value(status.url)')
  echo "✅ Frontend: $FRONTEND_URL"
else
  echo "❌ Frontend: no desplegado"
fi

echo ""
echo "✅ Verificación completada!"