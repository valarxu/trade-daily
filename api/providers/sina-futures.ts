import type { CandleItem, MarketConfigItem, MarketReplayResult, ProxyConfig } from '../../shared/replay.js'
import { trimCandles, toUnixSeconds } from '../../shared/replay.js'
import { requestText } from '../utils/http.js'

function parseSinaFuturesCandle(row: string[]): CandleItem {
  const [date, open, high, low, close, volume] = row

  return {
    time: toUnixSeconds(date),
    open: Number(open),
    high: Number(high),
    low: Number(low),
    close: Number(close),
    volume: Number(volume),
  }
}

export async function fetchFuturesData(
  config: MarketConfigItem,
  proxy: ProxyConfig,
): Promise<MarketReplayResult> {
  const url = new URL(
    'https://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesDailyKLine',
  )
  url.searchParams.set('symbol', config.symbol.toUpperCase())

  const responseText = await requestText(url.toString(), proxy)
  const response = JSON.parse(responseText) as string[][]
  const candles = trimCandles((response ?? []).map(parseSinaFuturesCandle))

  if (!candles.length) {
    throw new Error('期货数据为空')
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
