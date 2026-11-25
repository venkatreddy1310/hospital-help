import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { apiRouter } from './routes/index.js'

function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

function isAllowedOrigin(origin: string | undefined): boolean {
  // Same-origin and non-browser requests arrive without an Origin header.
  if (!origin) return true
  if (env.corsOrigins.includes(origin)) return true
  if (env.isProduction) return false

  // In development, localhost and 127.0.0.1 are the same machine, and Vite may
  // fall back to another port. Treat them as one trusted loopback origin so the
  // assistant does not silently drop into offline mode.
  try {
    return isLoopbackHost(new URL(origin).hostname)
  } catch {
    return false
  }
}

export function createApp(): express.Express {
  const app = express()

  app.disable('x-powered-by')

  app.use(
    cors({
      origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  app.use(express.json({ limit: '1mb' }))

  app.use('/api', apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
