import { Router, type Request, type Response } from 'express'
import {
  fetchAllMarketData,
  fetchMarketData,
  normalizeMarket,
  normalizeMarkets,
  normalizeProxy,
} from '../services/replay-service.js'

const router = Router()

router.post('/fetch-all', async (req: Request, res: Response) => {
  const proxy = normalizeProxy(req.body?.proxy)
  const markets = normalizeMarkets(req.body?.markets)
  const results = await fetchAllMarketData(markets, proxy)

  res.status(200).json({
    results,
    fetchedAt: new Date().toISOString(),
  })
})

router.post('/fetch-market', async (req: Request, res: Response) => {
  const proxy = normalizeProxy(req.body?.proxy)
  const market = normalizeMarket(req.body?.market)
  const result = await fetchMarketData(market, proxy)

  res.status(200).json(result)
})

export default router
