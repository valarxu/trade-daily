import { describe, expect, it } from 'vitest'
import { DEFAULT_MARKET_CONFIGS, getMarketConfigsByType } from '../../shared/replay.js'
import { normalizeMarket, normalizeMarkets, normalizeProxy } from './replay-service.js'

describe('replay-service', () => {
  it('normalizes proxy config with defaults', () => {
    expect(normalizeProxy({ enabled: true })).toEqual({
      enabled: true,
      host: '127.0.0.1',
      port: 13004,
    })
  })

  it('normalizes a single market and keeps defaults', () => {
    const cryptoDefaults = getMarketConfigsByType(DEFAULT_MARKET_CONFIGS, 'crypto')

    expect(
      normalizeMarket({
        market: 'crypto',
        symbol: 'ETHUSDT',
      }),
    ).toMatchObject({
      market: 'crypto',
      symbol: 'ETHUSDT',
      label: cryptoDefaults[0].label,
    })
  })

  it('normalizes market list without collapsing repeated markets', () => {
    const markets = normalizeMarkets([
      {
        market: 'futures',
        symbol: 'RB0',
        label: '螺纹钢主连',
      },
      {
        market: 'futures',
        symbol: 'CU0',
        label: '沪铜主连',
      },
    ])

    expect(markets).toHaveLength(2)
    expect(markets[0]).toMatchObject({
      market: 'futures',
      symbol: 'RB0',
      label: '螺纹钢主连',
    })
    expect(markets[1]).toMatchObject({
      market: 'futures',
      symbol: 'CU0',
      label: '沪铜主连',
    })
  })
})
