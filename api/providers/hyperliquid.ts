import {
  CANDLE_LIMIT,
  trimCandles,
  toUnixSeconds,
  type CandleItem,
  type MarketConfigItem,
  type MarketReplayResult,
  type ProxyConfig,
} from '../../shared/replay.js'
import { requestPostJson } from '../utils/http.js'

interface HyperliquidCandleItem {
  t: number
  T: number
  o: string
  h: string
  l: string
  c: string
  v: string
  s: string
  i: string
  n: number
}

const INTERVAL_TO_MS: Record<string, number> = {
  '1m': 60 * 1000,
  '3m': 3 * 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '2h': 2 * 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '8h': 8 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000,
}

function parseHyperliquidCandle(row: HyperliquidCandleItem): CandleItem {
  return {
    time: toUnixSeconds(row.t),
    open: Number(row.o),
    high: Number(row.h),
    low: Number(row.l),
    close: Number(row.c),
    volume: Number(row.v),
  }
}

function getRangeForInterval(interval: string): { startTime: number; endTime: number } {
  const endTime = Date.now()
  const intervalMs = INTERVAL_TO_MS[interval] ?? INTERVAL_TO_MS['1h']
  const startTime = endTime - intervalMs * (CANDLE_LIMIT + 20)

  return { startTime, endTime }
}

export async function fetchHyperliquidData(
  config: MarketConfigItem,
  proxy: ProxyConfig,
): Promise<MarketReplayResult> {
  const interval = config.interval || '1h'
  const { startTime, endTime } = getRangeForInterval(interval)
  const response = await requestPostJson<HyperliquidCandleItem[]>(
    'https://api.hyperliquid.xyz/info',
    {
      type: 'candleSnapshot',
      req: {
        coin: config.symbol,
        interval,
        startTime,
        endTime,
      },
    },
    proxy,
  )

  const candles = trimCandles((response ?? []).map(parseHyperliquidCandle))

  if (!candles.length) {
    throw new Error('HyperLiquid 数据为空')
  }

  return {
    market: config.market,
    symbol: config.symbol,
    label: config.label,
    source: config.source,
    status: 'success',
    candles,
  }
}
