import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(currentDir, '../..');
const serverRoot = resolve(currentDir, '..');

dotenv.config({ path: resolve(workspaceRoot, '.env') });
dotenv.config({ path: resolve(serverRoot, '.env'), override: true });

export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
  feishuAppId: process.env.FEISHU_APP_ID ?? '',
  feishuAppSecret: process.env.FEISHU_APP_SECRET ?? '',
  notionIntegrationToken: process.env.NOTION_INTEGRATION_TOKEN ?? '',
} as const;
