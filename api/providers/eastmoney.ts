import type { CandleItem, MarketConfigItem, MarketReplayResult, ProxyConfig } from '../../shared/replay.js'
import { trimCandles, toUnixSeconds } from '../../shared/replay.js'
import { requestJson } from '../utils/http.js'

interface EastmoneyResponse {
  data?: {
    klines?: string[]
  }
}

interface SinaKlineItem {
  day: string
  open: string
  high: string
  low: string
  close: string
  volume: string
}

interface SinaOpenApiResponse {
  result?: {
    data?: SinaKlineItem[]
  }
}

function parseEastmoneyCandle(row: string): CandleItem {
  const [date, open, close, high, low, volume] = row.split(',')

  return {
    time: toUnixSeconds(date),
    open: Number(open),
    high: Number(high),
    low: Number(low),
    close: Number(close),
    volume: Number(volume),
  }
}

function parseSinaCandle(row: SinaKlineItem): CandleItem {
  return {
    time: toUnixSeconds(row.day),
    open: Number(row.open),
    high: Number(row.high),
    low: Number(row.low),
    close: Number(row.close),
    volume: Number(row.volume),
  }
}

async function fetchSinaIndexData(
  config: MarketConfigItem,
  proxy: ProxyConfig,
): Promise<CandleItem[]> {
  const url = new URL('https://quotes.sina.cn/cn/api/openapi.php/CN_MarketDataService.getKLineData')
  url.searchParams.set('symbol', config.symbol)
  url.searchParams.set('scale', '240')
  url.searchParams.set('ma', 'no')
  url.searchParams.set('datalen', '240')

  const response = await requestJson<SinaOpenApiResponse>(url.toString(), proxy)
  return trimCandles((response.result?.data ?? []).map(parseSinaCandle))
}

export async function fetchAShareData(
  config: MarketConfigItem,
  proxy: ProxyConfig,
): Promise<MarketReplayResult> {
  let candles: CandleItem[] = []

  try {
    candles = await fetchSinaIndexData(config, proxy)
  } catch {
    const normalized = config.symbol.trim().toLowerCase()
    const secid = normalized.startsWith('sh')
      ? `1.${normalized.slice(2)}`
      : normalized.startsWith('sz') || normalized.startsWith('bj')
        ? `0.${normalized.slice(2)}`
        : ''

    if (secid) {
      const url = new URL('https://push2his.eastmoney.com/api/qt/stock/kline/get')
      url.searchParams.set('fields1', 'f1,f2,f3,f4,f5')
      url.searchParams.set('fields2', 'f51,f52,f53,f54,f55,f56')
      url.searchParams.set('klt', '101')
      url.searchParams.set('fqt', '0')
      url.searchParams.set('lmt', '240')
      url.searchParams.set('end', '20500101')
      url.searchParams.set('secid', secid)

      const response = await requestJson<EastmoneyResponse>(url.toString(), proxy)
      candles = trimCandles((response.data?.klines ?? []).map(parseEastmoneyCandle))
    }
  }

  if (!candles.length) {
    throw new Error('A 股数据为空')
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
