#!/bin/bash

set -e

PROJECT_ID="nubemsecrets"
REGION="europe-west1"
SERVICE_NAME="nubemsecrets-web"
BACKEND_SERVICE="nubemsecrets-api"

echo "🚀 Deploying NubemSecrets Frontend to Cloud Run..."

BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --format 'value(status.url)' 2>/dev/null || echo "")

if [ -z "$BACKEND_URL" ]; then
  echo "❌ Error: Backend service not found. Deploy backend first with: ./deploy-backend.sh"
  exit 1
fi

echo "📝 Backend URL: $BACKEND_URL"

cd frontend

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
  --set-env-vars="NEXT_PUBLIC_API_URL=${BACKEND_URL}" \
  --labels="app=nubemsecrets,component=frontend,managed-by=script"

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --format 'value(status.url)')

echo "✅ Frontend deployed successfully!"
echo "🔗 Frontend URL: $SERVICE_URL"
echo ""
echo "🎉 Deployment complete!"
echo "📝 Access your application at: $SERVICE_URL"