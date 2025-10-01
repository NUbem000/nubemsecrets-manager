import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { isAuthenticated } from '../middleware/auth.middleware';
import { secretsService } from '../services/secrets.service';
import { logger } from '../utils/logger';

const router = Router();

router.use(isAuthenticated);

const createSecretSchema = Joi.object({
  name: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).required(),
  value: Joi.string().required(),
  labels: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
});

const updateSecretSchema = Joi.object({
  value: Joi.string().required(),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    logger.info(`GET /api/secrets - User: ${user?.email}, Session ID: ${req.sessionID}`);

    const secrets = await secretsService.listSecrets(user?.email);
    logger.info(`Returning ${secrets.length} secrets to user: ${user?.email}`);
    return res.json(secrets);
  } catch (error: any) {
    logger.error('Error in GET /api/secrets:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const user = req.user as any;

    const value = await secretsService.getSecret(name, user?.email);
    logger.info(`Secret accessed by ${user?.email}: ${name}`);

    res.json({ name, value });
  } catch (error: any) {
    logger.error(`Error in GET /api/secrets/${req.params.name}:`, error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:name/versions', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const user = req.user as any;

    const versions = await secretsService.listSecretVersions(name, user?.email);
    res.json(versions);
  } catch (error: any) {
    logger.error(`Error in GET /api/secrets/${req.params.name}/versions:`, error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = createSecretSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, value: secretValue, labels } = value;
    const user = req.user as any;

    await secretsService.createSecret(name, secretValue, user?.email, labels);
    logger.info(`Secret created by ${user?.email}: ${name}`);

    return res.status(201).json({ message: 'Secret created successfully', name });
  } catch (error: any) {
    logger.error('Error in POST /api/secrets:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:name', async (req: Request, res: Response) => {
  try {
    const { error, value } = updateSecretSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name } = req.params;
    const { value: secretValue } = value;
    const user = req.user as any;

    await secretsService.updateSecret(name, secretValue, user?.email);
    logger.info(`Secret updated by ${user?.email}: ${name}`);

    return res.json({ message: 'Secret updated successfully', name });
  } catch (error: any) {
    logger.error(`Error in PUT /api/secrets/${req.params.name}:`, error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const user = req.user as any;

    await secretsService.deleteSecret(name, user?.email);
    logger.info(`Secret deleted by ${user?.email}: ${name}`);

    res.json({ message: 'Secret deleted successfully', name });
  } catch (error: any) {
    logger.error(`Error in DELETE /api/secrets/${req.params.name}:`, error);
    res.status(500).json({ error: error.message });
  }
});

export default router;