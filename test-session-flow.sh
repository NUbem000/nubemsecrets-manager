#!/bin/bash

API_URL="https://nubemsecrets-api-216552952339.europe-west1.run.app"

echo "=== Test de Flujo de Sesión ==="
echo ""

echo "1. Test sin cookies (debe fallar):"
curl -s "$API_URL/auth/me" | jq
echo ""

echo "2. Verificar estado de sesión debug:"
curl -s "$API_URL/auth/debug/session" | jq
echo ""

echo "3. Test con cookies (simulando sesión):"
# Este test necesitaría una cookie válida del navegador
echo "Para probar con sesión válida:"
echo "1. Abre el navegador y haz login en https://nubemsecrets-web-216552952339.europe-west1.run.app"
echo "2. Abre las herramientas de desarrollo (F12)"
echo "3. Ve a la pestaña Network"
echo "4. Intenta ver o editar un secreto"
echo "5. Busca la petición fallida y copia el header 'Cookie'"
echo "6. Ejecuta: curl -H 'Cookie: [tu-cookie-aqui]' $API_URL/auth/me"
echo ""

echo "=== Verificando logs recientes ==="
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=nubemsecrets-api" \
  --project=nubemsecrets \
  --limit=20 \
  --freshness=10m \
  --format="table(timestamp,jsonPayload.message)" | head -25