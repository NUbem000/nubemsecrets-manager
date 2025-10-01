#!/bin/bash

echo "Monitoreando logs del backend de NubemSecrets..."
echo "Presiona Ctrl+C para salir"
echo ""

while true; do
  gcloud logging read \
    "resource.type=cloud_run_revision AND resource.labels.service_name=nubemsecrets-api" \
    --project=nubemsecrets \
    --limit=20 \
    --freshness=1m \
    --format="value(timestamp,jsonPayload.message)" | \
    grep -E "GET|POST|User:|Session|Auth|Secret" | \
    head -20

  echo "---"
  sleep 10
done