import axios, { type AxiosProxyConfig, type AxiosRequestConfig } from 'axios'
import type { ProxyConfig } from '../../shared/replay.js'

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: '*/*',
}

function buildRequestConfig(proxy: ProxyConfig): AxiosRequestConfig {
  const proxyConfig: AxiosProxyConfig | false = proxy.enabled
    ? {
        protocol: 'http',
        host: proxy.host,
        port: proxy.port,
      }
    : false

  return {
    headers: DEFAULT_HEADERS,
    responseType: 'text',
    timeout: 15000,
    proxy: proxyConfig,
  }
}

export async function requestText(url: string, proxy: ProxyConfig): Promise<string> {
  if (!proxy.enabled) {
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
    })

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`)
    }

    return await response.text()
  }

  const response = await axios.get(url, buildRequestConfig(proxy))
  return String(response.data)
}

export async function requestJson<T>(url: string, proxy: ProxyConfig): Promise<T> {
  const text = await requestText(url, proxy)
  return JSON.parse(text) as T
}

export async function requestPostJson<TResponse>(
  url: string,
  body: unknown,
  proxy: ProxyConfig,
): Promise<TResponse> {
  if (!proxy.enabled) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`)
    }

    return (await response.json()) as TResponse
  }

  const response = await axios.post<TResponse>(url, body, {
    ...buildRequestConfig(proxy),
    responseType: 'json',
    headers: {
      ...DEFAULT_HEADERS,
      'Content-Type': 'application/json',
    },
  })

  return response.data
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return `请求失败: ${error.response.status}`
    }

    return error.message || '网络请求失败'
  }

  if (error instanceof Error) {
    return error.message
  }

  return '未知错误'
}
