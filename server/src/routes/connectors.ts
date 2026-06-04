import { Hono } from 'hono';
import type { ApiResponse, ResolveRequest, ResolveResponse } from '../types/index.js';
import { resolveFeishuDocument } from '../services/feishuService.js';

const connectors = new Hono();

connectors.post('/resolve', async (c) => {
  const body = await c.req.json<ResolveRequest>();

  if (!body.source || !body.input) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Missing required fields: source, input',
      code: 'BAD_REQUEST',
    };
    c.status(400);
    return c.json(response);
  }

  if (body.source !== 'feishu' && body.source !== 'notion' && body.source !== 'local') {
    const response: ApiResponse<never> = {
      success: false,
      error: `Unsupported source: ${body.source}`,
      code: 'BAD_REQUEST',
    };
    c.status(400);
    return c.json(response);
  }

  let mockResponse: ResolveResponse;

  if (body.source === 'feishu') {
    try {
      mockResponse = await resolveFeishuDocument(body.input, body.token);
    } catch (err) {
      console.error('[FeishuConnector]', err);
      const response: ApiResponse<never> = {
        success: false,
        error: err instanceof Error ? err.message : 'Feishu document resolve failed',
        code: 'FEISHU_RESOLVE_ERROR',
      };
      c.status(502);
      return c.json(response);
    }
  } else if (body.source === 'notion') {
    mockResponse = {
      source: 'notion',
      title: 'Mock Notion Page',
      markdown: `# Mock Notion Page\n\nSource: ${body.source}\nInput: ${body.input}\nToken provided: ${body.token ? 'yes' : 'no'}`,
      assets: [],
      warnings: ['当前为 mock 实现，尚未接入真实 Notion API。'],
    };
  } else {
    mockResponse = {
      source: 'local',
      title: 'Mock Local Document',
      markdown: `# Mock Local Document\n\n${body.input}`,
      assets: [],
      warnings: [],
    };
  }

  const response: ApiResponse<ResolveResponse> = {
    success: true,
    data: mockResponse,
  };

  return c.json(response);
});

export default connectors;
