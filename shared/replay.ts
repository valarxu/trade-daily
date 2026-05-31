export type MarketType = 'a_share' | 'us_stock' | 'crypto' | 'futures'

export interface ProxyConfig {
  enabled: boolean
  host: string
  port: number
}

export interface MarketConfigItem {
  market: MarketType
  symbol: string
  label: string
  interval: string
  source: string
  notes?: string
}

export interface CandleItem {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketReplayResult {
  market: MarketType
  symbol: string
  label: string
  source: string
  status: 'success' | 'error'
  candles: CandleItem[]
  errorMessage?: string
}

export interface ReplayResponse {
  results: MarketReplayResult[]
  fetchedAt: string
}

export interface SourceDescriptor {
  market: MarketType
  source: string
  description: string
  endpoint: string
}

export const CANDLE_LIMIT = 360
export const MARKET_ORDER: MarketType[] = ['a_share', 'us_stock', 'crypto', 'futures']

export const DEFAULT_PROXY_CONFIG: ProxyConfig = {
  enabled: false,
  host: '127.0.0.1',
  port: 13004,
}

const DEFAULT_A_SHARE_ITEMS = [
  ['sh600570', '恒生电子'],
  ['sz002230', '科大讯飞'],
  ['sz000977', '浪潮信息'],
  ['sz000938', '紫光股份'],
  ['sz002415', '海康威视'],
  ['sz002236', '大华股份'],
  ['sh603019', '中科曙光'],
  ['sh600588', '用友网络'],
  ['sh600536', '中国软件'],
  ['sh600845', '宝信软件'],
  ['sz002410', '广联达'],
  ['sz002368', '太极股份'],
  ['sz002065', '东华软件'],
  ['sh600718', '东软集团'],
  ['sz002152', '广电运通'],
  ['sh603138', '海量数据'],
  ['sh603881', '数据港'],
  ['sh600100', '同方股份'],
  ['sh603927', '中科软'],
  ['sz002649', '博彦科技'],
] as const

const DEFAULT_US_STOCK_ITEMS = [
  ['AAPL', 'Apple'],
  ['MSFT', 'Microsoft'],
  ['NVDA', 'NVIDIA'],
  ['AMZN', 'Amazon'],
  ['GOOGL', 'Alphabet'],
  ['META', 'Meta'],
  ['TSLA', 'Tesla'],
  ['TSM', '台积电'],
  ['CRCL', 'Circle'],
  ['COIN', 'Coinbase'],
  ['PLTR', 'Palantir'],
  ['^IXIC', '纳斯达克综合指数'],
  ['^GSPC', '标普500'],
  ['^DJI', '道琼斯工业平均指数'],
] as const

const DEFAULT_CRYPTO_ITEMS = [
  ['BTCUSDT', 'BTC'],
  ['ETHUSDT', 'ETH'],
  ['SOLUSDT', 'SOL'],
  ['HYPEUSDT', 'HYPE'],
  ['SUIUSDT', 'SUI'],
  ['BNBUSDT', 'BNB'],
] as const

const DEFAULT_FUTURES_ITEMS = [
  ['xyz:GOLD', 'Gold'],
  ['xyz:SILVER', 'Silver'],
  ['xyz:CL', 'WTI Crude'],
  ['xyz:BRENTOIL', 'Brent Oil'],
  ['xyz:COPPER', 'Copper'],
  ['xyz:NATGAS', 'Natural Gas'],
] as const

function getDefaultSource(market: MarketType, symbol: string): string {
  if (market === 'a_share') {
    return 'sina'
  }

  if (market === 'us_stock') {
    return 'yahoo'
  }

  if (market === 'crypto') {
    return symbol.toUpperCase() === 'HYPEUSDT' ? 'binance-futures' : 'binance'
  }

  return 'hyperliquid'
}

function getDefaultInterval(market: MarketType): string {
  if (market === 'crypto') {
    return '4h'
  }

  if (market === 'futures') {
    return '1h'
  }

  return '1d'
}

function getDefaultNotes(market: MarketType, symbol: string): string {
  if (market === 'a_share') {
    return 'A 股使用新浪公开日线接口，东方财富作为后备'
  }

  if (market === 'us_stock') {
    return '美股和指数使用 Yahoo Finance v8 chart'
  }

  if (market === 'crypto') {
    return symbol.toUpperCase() === 'HYPEUSDT'
      ? 'HYPE 使用 Binance USD-M Futures 4H Klines 接口'
      : '区块链使用 Binance Spot 4H Klines 接口'
  }

  return 'HyperLiquid 商品使用官方 candleSnapshot 1H K 线接口'
}

export function createMarketConfigItem(
  market: MarketType,
  symbol: string,
  label: string,
): MarketConfigItem {
  return {
    market,
    symbol,
    label,
    interval: getDefaultInterval(market),
    source: getDefaultSource(market, symbol),
    notes: getDefaultNotes(market, symbol),
  }
}

export const DEFAULT_MARKET_CONFIGS: MarketConfigItem[] = [
  ...DEFAULT_A_SHARE_ITEMS.map(([symbol, label]) => createMarketConfigItem('a_share', symbol, label)),
  ...DEFAULT_US_STOCK_ITEMS.map(([symbol, label]) => createMarketConfigItem('us_stock', symbol, label)),
  ...DEFAULT_CRYPTO_ITEMS.map(([symbol, label]) => createMarketConfigItem('crypto', symbol, label)),
  ...DEFAULT_FUTURES_ITEMS.map(([symbol, label]) => createMarketConfigItem('futures', symbol, label)),
]

export const SOURCE_DESCRIPTORS: SourceDescriptor[] = [
  {
    market: 'a_share',
    source: 'sina',
    description: '新浪公开 K 线接口，默认取上证指数日线，东方财富作为后备',
    endpoint: 'https://quotes.sina.cn/cn/api/openapi.php/CN_MarketDataService.getKLineData',
  },
  {
    market: 'us_stock',
    source: 'yahoo',
    description: 'Yahoo Finance v8 chart 非官方公开接口，支持美股个股和主要指数',
    endpoint: 'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}',
  },
  {
    market: 'crypto',
    source: 'binance',
    description: 'Binance Spot Klines 接口，支持 BTC、ETH、SOL、SUI、BNB',
    endpoint: 'https://api.binance.com/api/v3/klines',
  },
  {
    market: 'crypto',
    source: 'binance-futures',
    description: 'Binance USD-M Futures Klines 接口，用于 HYPEUSDT',
    endpoint: 'https://fapi.binance.com/fapi/v1/klines',
  },
  {
    market: 'futures',
    source: 'hyperliquid',
    description: 'HyperLiquid 官方 /info candleSnapshot，覆盖 Gold、Silver、WTI、Brent、Copper、Natural Gas',
    endpoint: 'https://api.hyperliquid.xyz/info',
  },
]

export const MARKET_TITLES: Record<MarketType, string> = {
  a_share: 'A 股',
  us_stock: '美股',
  crypto: '区块链',
  futures: 'HyperLiquid',
}

export function getMarketConfigsByType(markets: MarketConfigItem[], market: MarketType): MarketConfigItem[] {
  return markets.filter((item) => item.market === market)
}

export function toUnixSeconds(value: string | number | Date): number {
  if (typeof value === 'number') {
    return value > 10_000_000_000 ? Math.floor(value / 1000) : Math.floor(value)
  }

  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1000)
  }

  const normalizedValue = value.length <= 10 ? `${value}T00:00:00Z` : value
  return Math.floor(new Date(normalizedValue).getTime() / 1000)
}

function isValidCandle(candle: CandleItem): boolean {
  return [candle.time, candle.open, candle.high, candle.low, candle.close, candle.volume].every(
    (item) => Number.isFinite(item),
  )
}

export function trimCandles(candles: CandleItem[], limit = CANDLE_LIMIT): CandleItem[] {
  return candles.filter(isValidCandle).slice(-limit)
}

export function getLatestCandle(candles: CandleItem[]): CandleItem | null {
  return candles.length ? candles[candles.length - 1] : null
}
