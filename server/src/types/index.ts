import type { ResolvedDocument, ExternalAsset } from '@md2wechat/connectors';

export type ResolveRequest = {
  source: 'local' | 'feishu' | 'notion';
  input: string;
  token?: string;
  meta?: Record<string, unknown>;
};

export type ResolveResponse = ResolvedDocument;

export type UploadAssetRequest = {
  source: 'feishu' | 'notion' | 'external';
  assets: ExternalAsset[];
  target: 'image-host' | 'wechat-material';
};

export type ApiError = {
  success: false;
  error: string;
  code?: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
