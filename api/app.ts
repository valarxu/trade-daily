import express, { type Request, type Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import configRoutes from './routes/config.js'
import replayRoutes from './routes/replay.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'ok',
  })
})

app.use('/api/config', configRoutes)
app.use('/api/replay', replayRoutes)

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
