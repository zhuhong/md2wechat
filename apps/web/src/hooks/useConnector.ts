import { useState, useCallback } from 'react'
import { FeishuConnector, NotionConnector, type ResolvedDocument } from '@md2wechat/connectors'

const API_BASE_URL = ''

const feishuConnector = new FeishuConnector()
const notionConnector = new NotionConnector()

export function useConnector() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const message = err instanceof Error ? err.message : '导入失败'
      setError(message)
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
      const message = err instanceof Error ? err.message : '导入失败'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { importFeishu, importNotion, loading, error }
}
