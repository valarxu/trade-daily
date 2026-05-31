import { Router, type Request, type Response } from 'express'
import {
  DEFAULT_MARKET_CONFIGS,
  DEFAULT_PROXY_CONFIG,
  SOURCE_DESCRIPTORS,
} from '../../shared/replay.js'

const router = Router()

router.get('/defaults', (req: Request, res: Response) => {
  res.status(200).json({
    proxy: DEFAULT_PROXY_CONFIG,
    markets: DEFAULT_MARKET_CONFIGS,
    sources: SOURCE_DESCRIPTORS,
  })
})

export default router
