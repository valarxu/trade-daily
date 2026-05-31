import { RotateCcw, Settings2, X } from 'lucide-react'
import {
  getMarketConfigsByType,
  MARKET_ORDER,
  MARKET_TITLES,
  type MarketConfigItem,
  type MarketType,
  type ProxyConfig,
} from '../../shared/replay.js'

interface ConfigDrawerProps {
  open: boolean
  proxy: ProxyConfig
  markets: MarketConfigItem[]
  onClose: () => void
  onReset: () => void
  onProxyChange: (patch: Partial<ProxyConfig>) => void
  onReplaceMarketGroup: (
    marketType: MarketType,
    items: Array<{ symbol: string; label: string }>,
  ) => void
}

function getTextareaValue(markets: MarketConfigItem[], marketType: MarketType): string {
  return getMarketConfigsByType(markets, marketType)
    .map((item) => `${item.symbol}|${item.label}`)
    .join('\n')
}

function parseTextareaValue(value: string): Array<{ symbol: string; label: string }> {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [symbol, ...labelParts] = line.split('|')

      return {
        symbol: symbol?.trim() ?? '',
        label: labelParts.join('|').trim(),
      }
    })
    .filter((item) => item.symbol && item.label)
}

export default function ConfigDrawer({
  open,
  proxy,
  markets,
  onClose,
  onReset,
  onProxyChange,
  onReplaceMarketGroup,
}: ConfigDrawerProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[640px] overflow-y-auto border-l border-white/10 bg-slate-950/95 p-6 shadow-2xl md:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-cyan-300">
              <Settings2 size={18} />
              <span className="text-xs uppercase tracking-[0.4em]">Market Config</span>
            </div>
            <h2 className="font-display text-2xl text-white">市场配置</h2>
            <p className="mt-2 text-sm text-slate-400">
              每行使用 `代码|名称`。进入复盘后，先选市场，再在该市场内部切换标的。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6 rounded-3xl border border-cyan-400/20 bg-cyan-500/5 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">网络代理</p>
              <p className="text-xs text-slate-500">所有市场共用同一代理，默认端口 13004</p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={proxy.enabled}
                onChange={(event) => onProxyChange({ enabled: event.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-transparent"
              />
              启用代理
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-300">
              Host
              <input
                value={proxy.host}
                onChange={(event) => onProxyChange({ host: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-white outline-none transition focus:border-cyan-400/50"
              />
            </label>
            <label className="text-sm text-slate-300">
              Port
              <input
                type="number"
                value={proxy.port}
                onChange={(event) => onProxyChange({ port: Number(event.target.value) || 13004 })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-white outline-none transition focus:border-cyan-400/50"
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {MARKET_ORDER.map((marketType) => {
            const marketItems = getMarketConfigsByType(markets, marketType)

            return (
            <section
              key={marketType}
              className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            >
              <div className="mb-4">
                <div className="text-sm text-cyan-300">{MARKET_TITLES[marketType]}</div>
                <div className="text-xs text-slate-500">
                  已配置 {marketItems.length} 个标的
                  {marketItems[0] ? ` · 数据源 ${marketItems[0].source}` : ''}
                </div>
              </div>

              <label className="block text-sm text-slate-300">
                标的列表
                <textarea
                  value={getTextareaValue(markets, marketType)}
                  onChange={(event) =>
                    onReplaceMarketGroup(marketType, parseTextareaValue(event.target.value))
                  }
                  rows={Math.min(Math.max(marketItems.length + 1, 6), 16)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 font-mono text-sm text-white outline-none transition focus:border-cyan-400/50"
                />
              </label>

              <div className="mt-4 text-xs text-slate-500">
                示例：`{marketItems[0]?.symbol ?? 'BTCUSDT'}|{marketItems[0]?.label ?? 'BTC'}`
              </div>
            </section>
            )
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/5"
          >
            <RotateCcw size={16} />
            重置默认
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            保存并关闭
          </button>
        </div>
      </aside>
    </div>
  )
}
