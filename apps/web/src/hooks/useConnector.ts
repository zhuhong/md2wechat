import { useState, useCallback } from 'react'
import { FeishuConnector, NotionConnector, type ResolvedDocument } from '@md2wechat/connectors'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const feishuConnector = new FeishuConnector()
const notionConnector = new NotionConnector()

export interface ConnectorErrorInfo {
  title: string
  message: string
  code?: string
  requiredScopes?: string[]
  actionUrl?: string
  troubleshootingUrl?: string
  raw?: string
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : '导入失败'
}

function extractJsonPayload(message: string): unknown | null {
  const jsonStart = message.indexOf('{')
  if (jsonStart === -1) return null

  try {
    return JSON.parse(message.slice(jsonStart))
  } catch {
    return null
  }
}

function extractFirstUrl(text: string | undefined): string | undefined {
  return text?.match(/https?:\/\/\S+/)?.[0]
}

function normalizeConnectorError(err: unknown): ConnectorErrorInfo {
  const raw = getErrorMessage(err)
  const message = raw.replace(/^飞书文档解析失败:\s*/, '')
  const payload = extractJsonPayload(raw) as
    | {
      code?: number | string
      msg?: string
      error?: {
        message?: string
        troubleshooter?: string
        permission_violations?: Array<{ type?: string; subject?: string }>
      }
    }
    | null

  if (payload?.code || payload?.error) {
    const code = payload.code ? String(payload.code) : undefined
    const permissionViolations = payload.error?.permission_violations ?? []
    const requiredScopes = permissionViolations
      .map((violation) => violation.subject)
      .filter((scope): scope is string => Boolean(scope))
    const missingScope = code === '99991672'
      || permissionViolations.some((violation) => violation.type === 'action_scope_required')

    if (missingScope) {
      return {
        title: '飞书应用缺少权限',
        message: '当前飞书应用还没有开通读取文档内容的应用身份权限。请在飞书开放平台开通缺失权限，发布或生效应用后再重新导入。',
        code,
        requiredScopes,
        actionUrl: extractFirstUrl(payload.msg),
        troubleshootingUrl: extractFirstUrl(payload.error?.troubleshooter ?? payload.error?.message),
        raw,
      }
    }

    return {
      title: '飞书文档解析失败',
      message: payload.msg || message || '飞书接口返回了错误，请检查文档权限和应用配置。',
      code,
      raw,
    }
  }

  return {
    title: raw.startsWith('飞书文档解析失败') ? '飞书文档解析失败' : '导入失败',
    message,
    raw,
  }
}

export function useConnector() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ConnectorErrorInfo | null>(null)

  const importFeishu = useCallback(async (input: string): Promise<ResolvedDocument> => {
    setLoading(true)
    setError(null)
    try {
      const validation = feishuConnector.validateInput(input)
      if (!validation.valid) {
        throw new Error(validation.error ?? '无效的飞书文档 URL')
      }
      const result = await feishuConnector.resolve(input, { apiBaseUrl: API_BASE_URL })
      return result
    } catch (err) {
      setError(normalizeConnectorError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const importNotion = useCallback(async (input: string): Promise<ResolvedDocument> => {
    setLoading(true)
    setError(null)
    try {
      const validation = notionConnector.validateInput(input)
      if (!validation.valid) {
        throw new Error(validation.error ?? '无效的 Notion 页面 URL')
      }
      const result = await notionConnector.resolve(input, { apiBaseUrl: API_BASE_URL })
      return result
    } catch (err) {
      setError(normalizeConnectorError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { importFeishu, importNotion, loading, error }
}
