# 🔒 Multi-Tenancy Implementation - NubemSecrets Manager

## ⚠️ Problema de Seguridad Identificado

**Antes**: Todos los usuarios autenticados veían y podían modificar los mismos secretos globales del proyecto.

**Ahora**: Cada usuario solo puede ver y gestionar sus propios secretos, completamente aislados de otros usuarios.

## 🛡️ Solución Implementada: Aislamiento por Usuario

### Arquitectura de Multi-Tenancy

```
Estructura de nombres de secretos:
- Usuario: david.anguera@nubemsystems.es
- Prefijo: david_anguera_nubemsystems_es_
- Secreto del usuario: david_anguera_nubemsystems_es_api-key
- Mostrado al usuario como: api-key
```

### Cómo Funciona

1. **Prefijos Únicos por Usuario**
   - Cada email se convierte en un prefijo único
   - Ejemplo: `user@domain.com` → `user_domain_com_`
   - Todos los secretos del usuario llevan este prefijo

2. **Filtrado Automático**
   - Al listar: Solo se muestran secretos con el prefijo del usuario
   - Al crear: Se añade automáticamente el prefijo
   - Al acceder: Se verifica que el secreto pertenezca al usuario

3. **Labels de Tracking**
   - Cada secreto incluye un label con el owner
   - Facilita auditoría y gestión administrativa

## 📋 Cambios Técnicos

### Backend - secrets.service.ts

```typescript
// Conversión de email a prefijo seguro
private getUserPrefix(email: string): string {
  return email.replace('@', '_').replace(/\./g, '_');
}

// Todos los métodos ahora reciben el email del usuario
async listSecrets(userEmail?: string): Promise<SecretMetadata[]>
async getSecret(secretName: string, userEmail?: string): Promise<string>
async createSecret(secretName: string, value: string, userEmail?: string): Promise<void>
async updateSecret(secretName: string, value: string, userEmail?: string): Promise<void>
async deleteSecret(secretName: string, userEmail?: string): Promise<void>
```

### Backend - secrets.routes.ts

```typescript
// El email se extrae de req.user y se pasa al servicio
const user = req.user as any;
const secrets = await secretsService.listSecrets(user?.email);
```

## 🔐 Beneficios de Seguridad

1. **Aislamiento Total**: Los usuarios no pueden ver ni acceder a secretos de otros
2. **Sin Cambios en Frontend**: La implementación es transparente para el usuario
3. **Auditoría Mejorada**: Cada secreto tiene trazabilidad del propietario
4. **Escalabilidad**: Soporta múltiples usuarios sin conflictos

## 📊 Ejemplo de Uso

### Usuario 1: david.anguera@nubemsystems.es
```
Crea: api-key
Se guarda como: david_anguera_nubemsystems_es_api-key
Ve en la lista: api-key
```

### Usuario 2: otro@example.com
```
Crea: api-key
Se guarda como: otro_example_com_api-key
Ve en la lista: api-key (su propia versión)
```

**Resultado**: Ambos usuarios tienen un secreto llamado "api-key" pero son completamente independientes.

## 🚀 Migración de Secretos Existentes

Los secretos existentes sin prefijo:
- Son considerados "globales" o del sistema
- NO aparecerán para usuarios específicos
- Pueden ser migrados manualmente añadiendo el prefijo correspondiente

### Script de Migración (si necesario)
```bash
# Para migrar un secreto existente a un usuario específico
OLD_SECRET="api-key"
NEW_SECRET="david_anguera_nubemsystems_es_api-key"
gcloud secrets versions access latest --secret="$OLD_SECRET" | \
  gcloud secrets create "$NEW_SECRET" --data-file=-
```

## ⚠️ Consideraciones Importantes

1. **Límites de Google Secret Manager**
   - Máximo 30,000 secretos por proyecto
   - Con prefijos, cada usuario puede tener cientos de secretos

2. **Nombres de Secretos**
   - Deben cumplir con: `[a-zA-Z0-9_-]+`
   - El sistema maneja automáticamente la conversión

3. **Gestión Administrativa**
   - Un admin puede ver todos los secretos accediendo directamente a GCP
   - Los labels permiten filtrar por usuario en la consola de GCP

## 📈 Mejoras Futuras

1. **Secretos Compartidos**
   - Implementar grupos/organizaciones
   - Permitir compartir secretos específicos entre usuarios

2. **Cuotas por Usuario**
   - Limitar número de secretos por usuario
   - Implementar planes de suscripción

3. **Encryption adicional**
   - Añadir una capa extra de cifrado por usuario
   - Usar KMS keys específicas por tenant

## ✅ Estado Actual

- **Multi-tenancy**: ✅ Implementado y desplegado
- **Aislamiento**: ✅ Cada usuario ve solo sus secretos
- **Seguridad**: ✅ No hay acceso cruzado entre usuarios
- **Performance**: ✅ Filtrado eficiente por prefijos

## 🔧 Testing

Para verificar el aislamiento:

1. Login con usuario 1
2. Crear secreto "test-secret" con valor "valor1"
3. Logout
4. Login con usuario 2
5. Verificar que NO se ve "test-secret"
6. Crear secreto "test-secret" con valor "valor2"
7. Ambos usuarios tienen "test-secret" pero con valores diferentes

## 📝 Notas de Implementación

La implementación es **backward-compatible**:
- Si `userEmail` es undefined, opera en modo "sistema"
- Permite migración gradual de aplicaciones existentes
- No requiere cambios en el frontend