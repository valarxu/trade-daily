import { Activity, AlertTriangle, CandlestickChart, Database } from 'lucide-react'
import { getLatestCandle, MARKET_TITLES, type MarketConfigItem, type MarketReplayResult } from '../../shared/replay.js'
import { formatPercent, formatPrice, formatVolume } from '../utils/format'
import CandleChart from './CandleChart'

interface MarketCardProps {
  market: MarketConfigItem
  result?: MarketReplayResult
}

export default function MarketCard({ market, result }: MarketCardProps) {
  const latestCandle = result?.status === 'success' ? getLatestCandle(result.candles) : null
  const previousCandle =
    result?.status === 'success' && result.candles.length > 1 ? result.candles[result.candles.length - 2] : null
  const changePercent =
    latestCandle && previousCandle ? ((latestCandle.close - previousCandle.close) / previousCandle.close) * 100 : 0

  return (
    <article className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_30px_80px_rgba(2,8,23,0.45)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-cyan-300">
            <CandlestickChart size={16} />
            {MARKET_TITLES[market.market]}
          </div>
          <h3 className="font-display text-2xl text-white">{market.label}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-1">{market.symbol}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">来源 {market.source}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">240 根 K 线</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">最新收盘</div>
          <div className="mt-1 text-3xl font-semibold text-white">
            {latestCandle ? formatPrice(latestCandle.close) : '--'}
          </div>
          <div className={`mt-2 text-sm ${changePercent >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {latestCandle ? formatPercent(changePercent) : '等待拉取'}
          </div>
        </div>
      </div>

      {result?.status === 'error' ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle size={16} />
            数据拉取失败
          </div>
          <div>{result.errorMessage}</div>
        </div>
      ) : result?.status === 'success' ? (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                <Activity size={14} />
                开盘 / 最高 / 最低
              </div>
              <div className="text-sm text-white">
                {formatPrice(latestCandle?.open ?? 0)} / {formatPrice(latestCandle?.high ?? 0)} /{' '}
                {formatPrice(latestCandle?.low ?? 0)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                <Database size={14} />
                成交量
              </div>
              <div className="text-sm text-white">{formatVolume(latestCandle?.volume ?? 0)}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                <CandlestickChart size={14} />
                数据状态
              </div>
              <div className="text-sm text-emerald-300">已获取 {result.candles.length} 根</div>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-[#081018] p-4">
            <CandleChart candles={result.candles} />
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-500">
          点击“开始复盘”后拉取当前市场的 240 根 K 线与成交量。
        </div>
      )}
    </article>
  )
}
