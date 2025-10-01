import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { logger } from '../utils/logger';

const client = new SecretManagerServiceClient();
const projectId = process.env.GCP_PROJECT_ID || 'nubemsecrets';

export interface SecretMetadata {
  name: string;
  displayName: string;
  createTime: string;
  latestVersion?: string;
  versionCount?: number;
  labels?: { [key: string]: string };
  fullName?: string; // Full name with user prefix for internal use
}

export interface SecretVersion {
  version: string;
  state: string;
  createTime: string;
}

export class SecretsService {
  private getUserPrefix(email: string): string {
    // Convert email to safe prefix: user@domain.com -> user_domain_com
    return email.replace('@', '_').replace(/\./g, '_');
  }

  async listSecrets(userEmail?: string): Promise<SecretMetadata[]> {
    try {
      const [secrets] = await client.listSecrets({
        parent: `projects/${projectId}`,
      });

      // Filter secrets by user prefix if email provided
      const userPrefix = userEmail ? this.getUserPrefix(userEmail) : '';
      const filteredSecrets = userEmail
        ? secrets.filter(secret => {
            const secretName = secret.name!.split('/').pop()!;
            return secretName.startsWith(`${userPrefix}_`);
          })
        : secrets;

      const secretsData = await Promise.all(
        filteredSecrets.map(async (secret) => {
          const fullSecretName = secret.name!.split('/').pop()!;
          // Remove user prefix from display name
          const secretName = userEmail && fullSecretName.startsWith(`${userPrefix}_`)
            ? fullSecretName.substring(userPrefix.length + 1)
            : fullSecretName;

          const [versions] = await client.listSecretVersions({
            parent: secret.name!,
            pageSize: 1,
          });

          const latestVersion = versions[0]?.name?.split('/').pop();

          const [allVersions] = await client.listSecretVersions({
            parent: secret.name!,
          });

          return {
            name: secretName,
            displayName: secretName,
            createTime: secret.createTime?.seconds?.toString() || '',
            latestVersion,
            versionCount: allVersions.length,
            labels: secret.labels || {},
            fullName: fullSecretName, // Keep full name for operations
          };
        })
      );

      logger.info(`Listed ${secretsData.length} secrets for user ${userEmail || 'all'}`);
      return secretsData;
    } catch (error: any) {
      logger.error('Error listing secrets:', error);
      throw new Error(`Failed to list secrets: ${error.message}`);
    }
  }

  async getSecret(secretName: string, userEmail?: string): Promise<string> {
    try {
      // Add user prefix if email provided
      const fullSecretName = userEmail
        ? `${this.getUserPrefix(userEmail)}_${secretName}`
        : secretName;

      const [version] = await client.accessSecretVersion({
        name: `projects/${projectId}/secrets/${fullSecretName}/versions/latest`,
      });

      const payload = version.payload?.data?.toString();
      if (!payload) {
        throw new Error('Secret payload is empty');
      }

      logger.info(`Retrieved secret: ${fullSecretName} for user ${userEmail || 'system'}`);
      return payload;
    } catch (error: any) {
      logger.error(`Error getting secret ${secretName}:`, error);
      throw new Error(`Failed to get secret: ${error.message}`);
    }
  }

  async listSecretVersions(secretName: string, userEmail?: string): Promise<SecretVersion[]> {
    try {
      const fullSecretName = userEmail
        ? `${this.getUserPrefix(userEmail)}_${secretName}`
        : secretName;

      const [versions] = await client.listSecretVersions({
        parent: `projects/${projectId}/secrets/${fullSecretName}`,
      });

      const versionData = versions.map((version) => ({
        version: version.name!.split('/').pop()!,
        state: (version.state?.toString() || 'UNKNOWN'),
        createTime: version.createTime?.seconds?.toString() || '',
      }));

      logger.info(`Listed ${versionData.length} versions for secret: ${secretName}`);
      return versionData;
    } catch (error: any) {
      logger.error(`Error listing versions for ${secretName}:`, error);
      throw new Error(`Failed to list secret versions: ${error.message}`);
    }
  }

  async createSecret(secretName: string, secretValue: string, userEmail?: string, labels?: { [key: string]: string }): Promise<void> {
    try {
      const fullSecretName = userEmail
        ? `${this.getUserPrefix(userEmail)}_${secretName}`
        : secretName;

      // Add user email as a label for tracking
      const secretLabels = {
        ...labels,
        ...(userEmail ? { owner: userEmail.replace(/[@.]/g, '_') } : {}),
      };

      const [secret] = await client.createSecret({
        parent: `projects/${projectId}`,
        secretId: fullSecretName,
        secret: {
          replication: {
            automatic: {},
          },
          labels: secretLabels,
        },
      });

      await client.addSecretVersion({
        parent: secret.name!,
        payload: {
          data: Buffer.from(secretValue, 'utf8'),
        },
      });

      logger.info(`Created secret: ${fullSecretName} for user ${userEmail || 'system'}`);
    } catch (error: any) {
      logger.error(`Error creating secret ${secretName}:`, error);
      throw new Error(`Failed to create secret: ${error.message}`);
    }
  }

  async updateSecret(secretName: string, secretValue: string, userEmail?: string): Promise<void> {
    try {
      const fullSecretName = userEmail
        ? `${this.getUserPrefix(userEmail)}_${secretName}`
        : secretName;

      await client.addSecretVersion({
        parent: `projects/${projectId}/secrets/${fullSecretName}`,
        payload: {
          data: Buffer.from(secretValue, 'utf8'),
        },
      });

      logger.info(`Updated secret: ${fullSecretName} for user ${userEmail || 'system'}`);
    } catch (error: any) {
      logger.error(`Error updating secret ${secretName}:`, error);
      throw new Error(`Failed to update secret: ${error.message}`);
    }
  }

  async deleteSecret(secretName: string, userEmail?: string): Promise<void> {
    try {
      const fullSecretName = userEmail
        ? `${this.getUserPrefix(userEmail)}_${secretName}`
        : secretName;

      await client.deleteSecret({
        name: `projects/${projectId}/secrets/${fullSecretName}`,
      });

      logger.info(`Deleted secret: ${fullSecretName} for user ${userEmail || 'system'}`);
    } catch (error: any) {
      logger.error(`Error deleting secret ${secretName}:`, error);
      throw new Error(`Failed to delete secret: ${error.message}`);
    }
  }
}

export const secretsService = new SecretsService();