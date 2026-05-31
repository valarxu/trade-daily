import type { CandleItem, MarketConfigItem, MarketReplayResult, ProxyConfig } from '../../shared/replay.js'
import { trimCandles, toUnixSeconds } from '../../shared/replay.js'
import { requestJson } from '../utils/http.js'

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      timestamp?: number[]
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>
          high?: Array<number | null>
          low?: Array<number | null>
          close?: Array<number | null>
          volume?: Array<number | null>
        }>
      }
    }>
  }
}

function parseYahooCandles(payload: YahooChartResponse): CandleItem[] {
  const result = payload.chart?.result?.[0]
  const quote = result?.indicators?.quote?.[0]
  const timestamps = result?.timestamp ?? []
  const opens = quote?.open ?? []
  const highs = quote?.high ?? []
  const lows = quote?.low ?? []
  const closes = quote?.close ?? []
  const volumes = quote?.volume ?? []
  const candles: CandleItem[] = []

  for (let index = 0; index < timestamps.length; index += 1) {
    const open = opens[index]
    const high = highs[index]
    const low = lows[index]
    const close = closes[index]
    const volume = volumes[index]

    if (
      open === null ||
      high === null ||
      low === null ||
      close === null ||
      volume === null ||
      open === undefined ||
      high === undefined ||
      low === undefined ||
      close === undefined ||
      volume === undefined
    ) {
      continue
    }

    candles.push({
      time: toUnixSeconds(timestamps[index]),
      open,
      high,
      low,
      close,
      volume,
    })
  }

  return candles
}

export async function fetchUSStockData(
  config: MarketConfigItem,
  proxy: ProxyConfig,
): Promise<MarketReplayResult> {
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${config.symbol}`)
  url.searchParams.set('interval', '1d')
  url.searchParams.set('range', '1y')

  const response = await requestJson<YahooChartResponse>(url.toString(), proxy)
  const candles = trimCandles(parseYahooCandles(response))

  if (!candles.length) {
    throw new Error('美股数据为空')
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
