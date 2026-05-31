import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  LayoutGrid,
  Settings2,
} from 'lucide-react'
import {
  getLatestCandle,
  getMarketConfigsByType,
  MARKET_ORDER,
  MARKET_TITLES,
  type MarketConfigItem,
  type MarketReplayResult,
  type MarketType,
} from '../../shared/replay.js'
import { formatDateTime, formatPercent, formatPrice, formatVolume } from '../utils/format'
import CandleChart from './CandleChart'

interface ImmersiveReplayProps {
  markets: MarketConfigItem[]
  results: MarketReplayResult[]
  activeMarket: MarketType
  activeSymbolIndex: number
  lastFetchedAt: string | null
  status: 'idle' | 'loading' | 'success' | 'error'
  errorMessage: string | null
  onBackHome: () => void
  onOpenConfig: () => void
  onSelectMarket: (market: MarketType) => void
  onSelectSymbol: (index: number) => void
  onPrevious: () => void
  onNext: () => void
}

function getStatusTone(result?: MarketReplayResult) {
  if (result?.status === 'error') {
    return 'border-rose-400/30 bg-rose-500/10 text-rose-200'
  }

  return 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100'
}

function getChangePercent(result?: MarketReplayResult) {
  if (!result || result.status !== 'success' || result.candles.length < 2) {
    return null
  }

  const latest = result.candles[result.candles.length - 1]
  const previous = result.candles[result.candles.length - 2]

  return ((latest.close - previous.close) / previous.close) * 100
}

export default function ImmersiveReplay({
  markets,
  results,
  activeMarket,
  activeSymbolIndex,
  lastFetchedAt,
  status,
  errorMessage,
  onBackHome,
  onOpenConfig,
  onSelectMarket,
  onSelectSymbol,
  onPrevious,
  onNext,
}: ImmersiveReplayProps) {
  const marketTabs = MARKET_ORDER.filter((market) => getMarketConfigsByType(markets, market).length > 0)
  const activeMarketItems = getMarketConfigsByType(markets, activeMarket)
  const activeInstrument = activeMarketItems[activeSymbolIndex] ?? activeMarketItems[0]
  const activeResult = results.find(
    (item) => item.market === activeInstrument?.market && item.symbol === activeInstrument?.symbol,
  )
  const latestCandle = activeResult?.status === 'success' ? getLatestCandle(activeResult.candles) : null
  const changePercent = getChangePercent(activeResult)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,_#020617,_#020b16_40%,_#020617)] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col px-4 pb-6 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 py-4">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
          >
            <LayoutGrid size={16} />
            返回首页
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock3 size={14} />
            最近更新 {formatDateTime(lastFetchedAt)}
          </div>

          <button
            type="button"
            onClick={onOpenConfig}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
          >
            <Settings2 size={16} />
            市场配置
          </button>
        </header>

        <nav className="flex gap-3 overflow-x-auto pb-4 pt-2">
          {marketTabs.map((market) => {
            const marketItems = getMarketConfigsByType(markets, market)
            const hasAnySuccess = results.some((item) => item.market === market && item.status === 'success')
            const isActive = market === activeMarket

            return (
              <button
                key={market}
                type="button"
                onClick={() => onSelectMarket(market)}
                className={`min-w-[132px] rounded-[22px] border px-4 py-3 text-left transition ${
                  isActive
                    ? 'border-cyan-300 bg-cyan-300 text-slate-950 shadow-[0_0_30px_rgba(103,232,249,0.18)]'
                    : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="text-sm font-semibold">{MARKET_TITLES[market]}</div>
                <div className={`mt-1 text-xs ${isActive ? 'text-slate-800/80' : 'text-slate-400'}`}>
                  {hasAnySuccess ? `${marketItems.length} 个标的` : '数据异常'}
                </div>
              </button>
            )
          })}
        </nav>

        <nav className="flex gap-2 overflow-x-auto pb-3">
          {activeMarketItems.map((item, index) => {
            const isActive = index === activeSymbolIndex
            const itemResult = results.find(
              (result) => result.market === item.market && result.symbol === item.symbol,
            )

            return (
              <button
                key={`${item.market}-${item.symbol}`}
                type="button"
                onClick={() => onSelectSymbol(index)}
                className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-sm transition ${
                  isActive
                    ? 'border-cyan-300 bg-cyan-300/15 text-cyan-100'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {item.label}
                <span className="ml-2 text-xs opacity-70">{itemResult?.status === 'error' ? '异常' : item.symbol}</span>
              </button>
            )
          })}
        </nav>

        <main className="flex flex-1 flex-col justify-between gap-5">
          <section className="rounded-[32px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl md:p-6">
            <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                  {MARKET_TITLES[activeInstrument.market]}
                </div>
                <h1 className="font-display mt-3 text-3xl text-white md:text-5xl">
                  {activeInstrument.label}
                </h1>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-white/10 px-3 py-1.5">{activeInstrument.symbol}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1.5">
                    数据源 {activeInstrument.source}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1.5">240 根 K 线</span>
                  <span className="rounded-full border border-white/10 px-3 py-1.5">
                    {activeSymbolIndex + 1} / {activeMarketItems.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs text-slate-400">最新收盘</div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    {latestCandle ? formatPrice(latestCandle.close) : '--'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs text-slate-400">涨跌幅</div>
                  <div
                    className={`mt-2 text-xl font-semibold ${
                      (changePercent ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {changePercent === null ? '--' : formatPercent(changePercent)}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs text-slate-400">成交量</div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    {latestCandle ? formatVolume(latestCandle.volume) : '--'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs text-slate-400">状态</div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    {activeResult?.status === 'error'
                      ? '异常'
                      : status === 'loading'
                        ? '加载中'
                        : activeResult?.candles.length ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {errorMessage && status === 'error' ? (
              <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {errorMessage}
              </div>
            ) : null}

            {activeResult?.status === 'error' ? (
              <div className={`rounded-[28px] border px-5 py-6 text-sm ${getStatusTone(activeResult)}`}>
                当前标的拉取失败：{activeResult.errorMessage}
              </div>
            ) : activeResult?.status === 'success' ? (
              <div className="rounded-[28px] border border-white/10 bg-[#06101a] p-3 md:p-4">
                <CandleChart candles={activeResult.candles} height={520} />
              </div>
            ) : (
              <div className={`rounded-[28px] border px-5 py-10 text-center text-sm ${getStatusTone(activeResult)}`}>
                {status === 'loading' ? '正在拉取当前标的数据...' : '点击开始复盘后进入沉浸式图表视图。'}
              </div>
            )}
          </section>

          <footer className="grid grid-cols-2 gap-3 pb-2">
            <button
              type="button"
              onClick={onPrevious}
              className="inline-flex items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-base font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/10"
            >
              <ArrowLeft size={18} />
              上一个
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center justify-center gap-2 rounded-[24px] bg-cyan-300 px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              下一个
              <ArrowRight size={18} />
            </button>
          </footer>
        </main>
      </div>
    </div>
  )
}
