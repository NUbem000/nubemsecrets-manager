#!/bin/bash

set -e

PROJECT_ID="nubemsecrets"
REGION="europe-west1"
SERVICE_NAME="nubemsecrets-api"

echo "🚀 Deploying NubemSecrets Backend to Cloud Run..."

cd backend

echo "📦 Building and deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --service-account="${PROJECT_ID}@appspot.gserviceaccount.com" \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="GCP_PROJECT_ID=${PROJECT_ID}" \
  --set-env-vars="GCP_REGION=${REGION}" \
  --set-secrets="GOOGLE_CLIENT_ID=google-oauth-client-id:latest" \
  --set-secrets="GOOGLE_CLIENT_SECRET=google-oauth-client-secret:latest" \
  --set-secrets="SESSION_SECRET=session-secret:latest" \
  --labels="app=nubemsecrets,component=backend,managed-by=script"

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --format 'value(status.url)')

echo "✅ Backend deployed successfully!"
echo "🔗 Backend URL: $SERVICE_URL"
echo ""
echo "📝 Next steps:"
echo "1. Update Google OAuth callback URL to: ${SERVICE_URL}/auth/google/callback"
echo "2. Update frontend NEXT_PUBLIC_API_URL to: $SERVICE_URL"
echo "3. Deploy frontend with: ./deploy-frontend.sh"