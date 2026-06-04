import { config } from '../config.js';

type FeishuTenantTokenResponse = {
  code: number;
  msg?: string;
  tenant_access_token?: string;
  expire?: number;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getFeishuTenantAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60_000) {
    return cachedToken.value;
  }

  if (!config.feishuAppId || !config.feishuAppSecret) {
    throw new Error('Missing FEISHU_APP_ID or FEISHU_APP_SECRET');
  }

  const response = await fetch(
    'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        app_id: config.feishuAppId,
        app_secret: config.feishuAppSecret,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Feishu auth request failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`
    );
  }

  const data = (await response.json()) as FeishuTenantTokenResponse;
  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`Feishu auth failed: code ${data.code}${data.msg ? ` - ${data.msg}` : ''}`);
  }

  cachedToken = {
    value: data.tenant_access_token,
    expiresAt: Date.now() + (data.expire ?? 7200) * 1000,
  };

  return cachedToken.value;
}
