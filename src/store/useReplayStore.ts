import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEFAULT_MARKET_CONFIGS,
  DEFAULT_PROXY_CONFIG,
  MARKET_ORDER,
  createMarketConfigItem,
  getMarketConfigsByType,
  type MarketConfigItem,
  type MarketReplayResult,
  type MarketType,
  type ReplayResponse,
  type ProxyConfig,
} from '../../shared/replay.js'

type ReplayStatus = 'idle' | 'loading' | 'success' | 'error'

interface ReplayStore {
  proxy: ProxyConfig
  markets: MarketConfigItem[]
  results: MarketReplayResult[]
  status: ReplayStatus
  started: boolean
  activeMarket: MarketType
  activeSymbolIndex: number
  lastFetchedAt: string | null
  errorMessage: string | null
  configOpen: boolean
  setConfigOpen: (open: boolean) => void
  enterReplay: () => void
  exitReplay: () => void
  setActiveMarket: (market: MarketType) => void
  setActiveSymbolIndex: (index: number) => void
  goToPreviousSymbol: () => void
  goToNextSymbol: () => void
  updateProxy: (patch: Partial<ProxyConfig>) => void
  replaceMarketGroup: (marketType: MarketType, items: Array<{ symbol: string; label: string }>) => void
  resetConfig: () => void
  startReplay: () => Promise<void>
}

type PersistedReplayStore = Pick<ReplayStore, 'proxy' | 'markets'>

function replaceMarketGroup(
  markets: MarketConfigItem[],
  marketType: MarketType,
  items: Array<{ symbol: string; label: string }>,
): MarketConfigItem[] {
  const normalizedItems = items
    .map((item) => ({
      symbol: item.symbol.trim(),
      label: item.label.trim(),
    }))
    .filter((item) => item.symbol && item.label)
    .map((item) => createMarketConfigItem(marketType, item.symbol, item.label))

  const preserved = markets.filter((market) => market.market !== marketType)

  return MARKET_ORDER.flatMap((market) =>
    market === marketType
      ? normalizedItems.length
        ? normalizedItems
        : getMarketConfigsByType(DEFAULT_MARKET_CONFIGS, marketType)
      : preserved.filter((item) => item.market === market),
  )
}

export const useReplayStore = create<ReplayStore>()(
  persist(
    (set, get) => ({
      proxy: { ...DEFAULT_PROXY_CONFIG },
      markets: DEFAULT_MARKET_CONFIGS.map((item) => ({ ...item })),
      results: [],
      status: 'idle',
      started: false,
      activeMarket: 'a_share',
      activeSymbolIndex: 0,
      lastFetchedAt: null,
      errorMessage: null,
      configOpen: false,
      setConfigOpen: (open) => set({ configOpen: open }),
      enterReplay: () => set({ started: true }),
      exitReplay: () => set({ started: false, configOpen: false }),
      setActiveMarket: (market) =>
        set((state) => ({
          activeMarket: state.markets.some((item) => item.market === market) ? market : state.activeMarket,
          activeSymbolIndex: 0,
        })),
      setActiveSymbolIndex: (index) =>
        set((state) => ({
          activeSymbolIndex: Math.max(
            0,
            Math.min(index, getMarketConfigsByType(state.markets, state.activeMarket).length - 1),
          ),
        })),
      goToPreviousSymbol: () =>
        set((state) => ({
          activeSymbolIndex:
            (state.activeSymbolIndex -
              1 +
              getMarketConfigsByType(state.markets, state.activeMarket).length) %
            getMarketConfigsByType(state.markets, state.activeMarket).length,
        })),
      goToNextSymbol: () =>
        set((state) => ({
          activeSymbolIndex:
            (state.activeSymbolIndex + 1) % getMarketConfigsByType(state.markets, state.activeMarket).length,
        })),
      updateProxy: (patch) =>
        set((state) => ({
          proxy: {
            ...state.proxy,
            ...patch,
          },
        })),
      replaceMarketGroup: (marketType, items) =>
        set((state) => ({
          markets: replaceMarketGroup(state.markets, marketType, items),
          activeMarket: marketType,
          activeSymbolIndex: 0,
        })),
      resetConfig: () =>
        set({
          proxy: { ...DEFAULT_PROXY_CONFIG },
          markets: DEFAULT_MARKET_CONFIGS.map((item) => ({ ...item })),
          activeMarket: 'a_share',
          activeSymbolIndex: 0,
        }),
      startReplay: async () => {
        set({ status: 'loading', errorMessage: null, started: true })

        try {
          const response = await fetch('/api/replay/fetch-all', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              proxy: get().proxy,
              markets: get().markets,
            }),
          })

          if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`)
          }

          const payload = (await response.json()) as ReplayResponse
          const hasSuccess = payload.results.some((item) => item.status === 'success')

          set({
            results: payload.results,
            status: hasSuccess ? 'success' : 'error',
            lastFetchedAt: payload.fetchedAt,
            errorMessage: hasSuccess ? null : '所有市场均拉取失败，请检查代理或品种代码。',
            activeMarket: 'a_share',
            activeSymbolIndex: 0,
          })
        } catch (error) {
          set({
            status: 'error',
            errorMessage: error instanceof Error ? error.message : '复盘请求失败',
            activeMarket: 'a_share',
            activeSymbolIndex: 0,
          })
        }
      },
    }),
    {
      name: 'trade-daily-store',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        proxy: state.proxy,
        markets: state.markets,
      }),
      migrate: (persistedState: unknown, version) => {
        const state = persistedState as Partial<PersistedReplayStore> | undefined

        if (!state) {
          return {
            proxy: { ...DEFAULT_PROXY_CONFIG },
            markets: DEFAULT_MARKET_CONFIGS.map((item) => ({ ...item })),
          }
        }

        if (version < 2 || !Array.isArray(state.markets) || state.markets.length < 20) {
          return {
            proxy: state.proxy ?? { ...DEFAULT_PROXY_CONFIG },
            markets: DEFAULT_MARKET_CONFIGS.map((item) => ({ ...item })),
          }
        }

        return state as PersistedReplayStore
      },
    },
  ),
)
