#!/bin/bash

set -e

PROJECT_ID="nubemsecrets"

echo "🔐 Setting up secrets for NubemSecrets Manager..."

echo ""
echo "This script will create the required secrets in Google Secret Manager."
echo "You will need:"
echo "  1. Google OAuth Client ID"
echo "  2. Google OAuth Client Secret"
echo "  3. Session Secret (will be generated if not provided)"
echo ""

read -p "Press Enter to continue..."

echo ""
echo "📝 Enter your Google OAuth credentials:"
echo "(Get them from: https://console.cloud.google.com/apis/credentials)"
echo ""

read -p "Google OAuth Client ID: " GOOGLE_CLIENT_ID
read -sp "Google OAuth Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
  echo "❌ Error: OAuth credentials cannot be empty"
  exit 1
fi

SESSION_SECRET=$(openssl rand -base64 32)

echo ""
echo "🔧 Creating secrets in Google Secret Manager..."

echo -n "$GOOGLE_CLIENT_ID" | gcloud secrets create google-oauth-client-id \
  --project=$PROJECT_ID \
  --replication-policy="automatic" \
  --data-file=- 2>/dev/null || \
echo -n "$GOOGLE_CLIENT_ID" | gcloud secrets versions add google-oauth-client-id \
  --project=$PROJECT_ID \
  --data-file=-

echo -n "$GOOGLE_CLIENT_SECRET" | gcloud secrets create google-oauth-client-secret \
  --project=$PROJECT_ID \
  --replication-policy="automatic" \
  --data-file=- 2>/dev/null || \
echo -n "$GOOGLE_CLIENT_SECRET" | gcloud secrets versions add google-oauth-client-secret \
  --project=$PROJECT_ID \
  --data-file=-

echo -n "$SESSION_SECRET" | gcloud secrets create session-secret \
  --project=$PROJECT_ID \
  --replication-policy="automatic" \
  --data-file=- 2>/dev/null || \
echo -n "$SESSION_SECRET" | gcloud secrets versions add session-secret \
  --project=$PROJECT_ID \
  --data-file=-

echo ""
echo "✅ Secrets created successfully!"
echo ""
echo "📋 Summary:"
echo "  • google-oauth-client-id: ✅"
echo "  • google-oauth-client-secret: ✅"
echo "  • session-secret: ✅"
echo ""
echo "🔐 Configuring IAM permissions..."

SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

gcloud secrets add-iam-policy-binding google-oauth-client-id \
  --project=$PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None

gcloud secrets add-iam-policy-binding google-oauth-client-secret \
  --project=$PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None

gcloud secrets add-iam-policy-binding session-secret \
  --project=$PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None

echo "✅ IAM permissions configured!"
echo ""
echo "🚀 Next steps:"
echo "1. Deploy backend: ./deploy-backend.sh"
echo "2. Update OAuth callback URL in Google Console"
echo "3. Deploy frontend: ./deploy-frontend.sh"