#!/bin/bash

echo "=== Test de Flujo de Autenticación ==="
echo ""

API_URL="https://nubemsecrets-api-216552952339.europe-west1.run.app"
FRONTEND_URL="https://nubemsecrets-web-216552952339.europe-west1.run.app"

echo "1. Backend Health Check:"
curl -s "$API_URL/health" | jq
echo ""

echo "2. Test auth/me endpoint (should return 401 without session):"
curl -s -w "\nHTTP Status: %{http_code}\n" "$API_URL/auth/me" | head -5
echo ""

echo "3. Frontend está accesible en:"
echo "   $FRONTEND_URL"
echo ""

echo "4. OAuth login URL:"
echo "   $API_URL/auth/google"
echo ""

echo "=== Instrucciones de prueba manual ==="
echo "1. Abre una ventana de incógnito"
echo "2. Ve a: $FRONTEND_URL"
echo "3. Deberías ver el botón de 'Iniciar sesión con Google'"
echo "4. Al hacer login, NO debería haber loop de refresco"
echo "5. Después del login, deberías ver la lista de secretos"