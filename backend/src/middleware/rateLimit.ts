import type { RequestHandler } from 'express'
import { HttpError } from './errorHandler.js'

interface WindowEntry {
  count: number
  resetAt: number
}

export function createRateLimiter({
  windowMs,
  max,
  code,
  message,
}: {
  windowMs: number
  max: number
  code: string
  message: string
}): RequestHandler {
  const windows = new Map<string, WindowEntry>()
  let lastSweep = Date.now()

  return (req, res, next) => {
    const now = Date.now()

    if (now - lastSweep > windowMs) {
      for (const [key, entry] of windows) {
        if (entry.resetAt <= now) windows.delete(key)
      }
      lastSweep = now
    }

    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown'
    const entry = windows.get(key)

    if (!entry || entry.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + windowMs })
      next()
      return
    }

    if (entry.count >= max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))))
      next(new HttpError(429, message, code))
      return
    }

    entry.count += 1
    next()
  }
}
