export interface DocumentConnector {
  readonly source: 'local' | 'feishu' | 'notion';
  validateInput(input: string): { valid: boolean; error?: string };
  resolve(input: string, config?: ConnectorConfig): Promise<ResolvedDocument>;
}

export interface ResolvedDocument {
  source: 'local' | 'feishu' | 'notion';
  title: string;
  markdown: string;
  assets: ExternalAsset[];
  warnings: string[];
  metadata?: Record<string, unknown>;
}

export interface ExternalAsset {
  id: string;
  type: 'image' | 'file';
  originalUrl: string;
  filename?: string;
  mimeType?: string;
  requiresAuth: boolean;
  expiresAt?: string;
}

export interface ConnectorConfig {
  token?: string;
  apiBaseUrl?: string;
}
