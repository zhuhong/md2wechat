import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
  feishuAppId: process.env.FEISHU_APP_ID ?? '',
  feishuAppSecret: process.env.FEISHU_APP_SECRET ?? '',
  notionIntegrationToken: process.env.NOTION_INTEGRATION_TOKEN ?? '',
} as const;
