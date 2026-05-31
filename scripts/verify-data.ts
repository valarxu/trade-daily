import { DEFAULT_MARKET_CONFIGS, DEFAULT_PROXY_CONFIG } from '../shared/replay.js'
import { fetchAllMarketData } from '../api/services/replay-service.js'

async function main() {
  const results = await fetchAllMarketData(DEFAULT_MARKET_CONFIGS, DEFAULT_PROXY_CONFIG)
  const summary = new Map<string, number>()

  for (const result of results) {
    if (result.status !== 'success') {
      throw new Error(`${result.market} 拉取失败: ${result.errorMessage}`)
    }

    summary.set(result.market, (summary.get(result.market) ?? 0) + 1)

    console.log(
      `${result.market}: ${result.symbol} -> ${result.candles.length} candles, latest volume ${result.candles[result.candles.length - 1]?.volume}`,
    )
  }

  console.log('summary', Object.fromEntries(summary))
}

void main()
