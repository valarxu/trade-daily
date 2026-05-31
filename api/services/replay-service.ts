import {
  DEFAULT_MARKET_CONFIGS,
  DEFAULT_PROXY_CONFIG,
  createMarketConfigItem,
  type MarketConfigItem,
  type MarketReplayResult,
  type MarketType,
  type ProxyConfig,
} from '../../shared/replay.js'
import { fetchCryptoData } from '../providers/binance.js'
import { fetchAShareData } from '../providers/eastmoney.js'
import { fetchHyperliquidData } from '../providers/hyperliquid.js'
import { fetchUSStockData } from '../providers/yahoo.js'
import { getErrorMessage } from '../utils/http.js'

const marketProviders: Record<
  MarketType,
  (config: MarketConfigItem, proxy: ProxyConfig) => Promise<MarketReplayResult>
> = {
  a_share: fetchAShareData,
  us_stock: fetchUSStockData,
  crypto: fetchCryptoData,
  futures: fetchHyperliquidData,
}

function getDefaultMarketByType(market: MarketType): MarketConfigItem {
  return DEFAULT_MARKET_CONFIGS.find((item) => item.market === market) ?? DEFAULT_MARKET_CONFIGS[0]
}

export function normalizeProxy(input: unknown): ProxyConfig {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_PROXY_CONFIG }
  }

  const candidate = input as Partial<ProxyConfig>

  return {
    enabled: Boolean(candidate.enabled),
    host: candidate.host?.trim() || DEFAULT_PROXY_CONFIG.host,
    port:
      typeof candidate.port === 'number' && Number.isFinite(candidate.port)
        ? candidate.port
        : DEFAULT_PROXY_CONFIG.port,
  }
}

export function normalizeMarket(input: unknown): MarketConfigItem {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_MARKET_CONFIGS[0] }
  }

  const candidate = input as Partial<MarketConfigItem>
  const marketType =
    candidate.market && DEFAULT_MARKET_CONFIGS.some((item) => item.market === candidate.market)
      ? candidate.market
      : DEFAULT_MARKET_CONFIGS[0].market
  const fallback = getDefaultMarketByType(marketType)

  return {
    ...createMarketConfigItem(
      marketType,
      candidate.symbol?.trim() || fallback.symbol,
      candidate.label?.trim() || fallback.label,
    ),
    interval: candidate.interval?.trim() || fallback.interval,
  }
}

export function normalizeMarkets(input: unknown): MarketConfigItem[] {
  if (!Array.isArray(input) || !input.length) {
    return DEFAULT_MARKET_CONFIGS.map((item) => ({ ...item }))
  }

  return input
    .filter((item) => item && typeof item === 'object')
    .map((item) => normalizeMarket(item))
}

export async function fetchMarketData(
  config: MarketConfigItem,
  proxy: ProxyConfig,
): Promise<MarketReplayResult> {
  const provider = marketProviders[config.market]

  try {
    return await provider(config, proxy)
  } catch (error) {
    return {
      market: config.market,
      symbol: config.symbol,
      label: config.label,
      source: config.source,
      status: 'error',
      candles: [],
      errorMessage: getErrorMessage(error),
    }
  }
}

export async function fetchAllMarketData(
  markets: MarketConfigItem[] = DEFAULT_MARKET_CONFIGS,
  proxy: ProxyConfig = DEFAULT_PROXY_CONFIG,
): Promise<MarketReplayResult[]> {
  const queue = [...markets]
  const results: MarketReplayResult[] = []
  const concurrency = 6

  async function worker() {
    while (queue.length) {
      const market = queue.shift()

      if (!market) {
        return
      }

      results.push(await fetchMarketData(market, proxy))
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => worker()))

  return markets.map(
    (market) =>
      results.find((item) => item.market === market.market && item.symbol === market.symbol) ?? {
        market: market.market,
        symbol: market.symbol,
        label: market.label,
        source: market.source,
        status: 'error',
        candles: [],
        errorMessage: '结果缺失',
      },
  )
}
