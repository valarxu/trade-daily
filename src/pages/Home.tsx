import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle, Play, SlidersHorizontal } from 'lucide-react'
import ConfigDrawer from '../components/ConfigDrawer'
import ImmersiveReplay from '../components/ImmersiveReplay'
import { useReplayStore } from '../store/useReplayStore'

export default function Home() {
  const {
    markets,
    proxy,
    configOpen,
    setConfigOpen,
    updateProxy,
    replaceMarketGroup,
    resetConfig,
    results,
    status,
    started,
    activeMarket,
    activeSymbolIndex,
    lastFetchedAt,
    errorMessage,
    exitReplay,
    setActiveMarket,
    setActiveSymbolIndex,
    goToPreviousSymbol,
    goToNextSymbol,
    startReplay,
  } = useReplayStore()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const currentTime = useMemo(
    () =>
      new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now),
    [now],
  )

  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(now),
    [now],
  )

  if (started) {
    return (
      <>
        <ImmersiveReplay
          markets={markets}
          results={results}
          activeMarket={activeMarket}
          activeSymbolIndex={activeSymbolIndex}
          lastFetchedAt={lastFetchedAt}
          status={status}
          errorMessage={errorMessage}
          onBackHome={exitReplay}
          onOpenConfig={() => setConfigOpen(true)}
          onSelectMarket={setActiveMarket}
          onSelectSymbol={setActiveSymbolIndex}
          onPrevious={goToPreviousSymbol}
          onNext={goToNextSymbol}
        />

        <ConfigDrawer
          open={configOpen}
          proxy={proxy}
          markets={markets}
          onClose={() => setConfigOpen(false)}
          onReset={resetConfig}
          onProxyChange={updateProxy}
          onReplaceMarketGroup={replaceMarketGroup}
        />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.1),_transparent_22%),linear-gradient(180deg,_#020617,_#030712_50%,_#020617)] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1180px] items-center justify-center px-6 py-8">
          <section className="w-full rounded-[36px] border border-white/10 bg-slate-950/60 p-8 text-center shadow-[0_40px_120px_rgba(2,8,23,0.55)] backdrop-blur-xl md:p-12">
            <div className="mx-auto max-w-3xl">
              <div className="text-sm uppercase tracking-[0.45em] text-cyan-300">Trade Daily</div>
              <div className="font-display mt-8 text-6xl leading-none text-white md:text-8xl lg:text-9xl">
                {currentTime}
              </div>
              <div className="mt-4 text-base text-slate-400 md:text-xl">{currentDate}</div>
              <p className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
                进入后只展示一个市场标的，适合在 iPad 上沉浸式看图复盘。
              </p>

              {errorMessage ? (
                <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errorMessage}
                </div>
              ) : null}

              <div className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row">
                <button
                  type="button"
                  onClick={() => void startReplay()}
                  className="inline-flex min-w-[220px] items-center justify-center gap-3 rounded-full bg-cyan-300 px-8 py-5 text-lg font-semibold text-slate-950 shadow-[0_0_40px_rgba(103,232,249,0.22)] transition hover:translate-y-[-1px] hover:bg-cyan-200"
                >
                  {status === 'loading' ? (
                    <LoaderCircle size={20} className="animate-spin" />
                  ) : (
                    <Play size={20} />
                  )}
                  开始复盘
                </button>
                <button
                  type="button"
                  onClick={() => setConfigOpen(true)}
                  className="inline-flex min-w-[220px] items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-5 text-lg font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
                >
                  <SlidersHorizontal size={20} />
                  市场配置
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  代理 {proxy.enabled ? `${proxy.host}:${proxy.port}` : '关闭'}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  已配置 {markets.length} 个标的
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ConfigDrawer
        open={configOpen}
        proxy={proxy}
        markets={markets}
        onClose={() => setConfigOpen(false)}
        onReset={resetConfig}
        onProxyChange={updateProxy}
        onReplaceMarketGroup={replaceMarketGroup}
      />
    </>
  )
}
