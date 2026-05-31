import type { CandleItem, MarketConfigItem, MarketReplayResult, ProxyConfig } from '../../shared/replay.js'
import { trimCandles, toUnixSeconds } from '../../shared/replay.js'
import { requestJson } from '../utils/http.js'

interface BinanceKlineItem extends Array<string | number> {
  0: number
  1: string
  2: string
  3: string
  4: string
  5: string
}

function parseBinanceCandle(row: BinanceKlineItem): CandleItem {
  return {
    time: toUnixSeconds(row[0]),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
  }
}

export async function fetchCryptoData(
  config: MarketConfigItem,
  proxy: ProxyConfig,
): Promise<MarketReplayResult> {
  const baseUrl =
    config.source === 'binance-futures'
      ? 'https://fapi.binance.com/fapi/v1/klines'
      : 'https://api.binance.com/api/v3/klines'
  const url = new URL(baseUrl)
  url.searchParams.set('symbol', config.symbol.toUpperCase())
  url.searchParams.set('interval', config.interval || '1d')
  url.searchParams.set('limit', '240')

  const response = await requestJson<BinanceKlineItem[]>(url.toString(), proxy)
  const candles = trimCandles((response ?? []).map(parseBinanceCandle))

  if (!candles.length) {
    throw new Error('区块链数据为空')
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
