import { Router } from 'express'
import { getAiStatus, postAssistant } from '../controllers/ai.controller.js'
import { createRateLimiter } from '../middleware/rateLimit.js'

export const aiRouter = Router()

const assistantLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 12,
  code: 'ai_rate_limited',
  message: 'Too many assistant requests. Please wait a minute and try again.',
})

aiRouter.get('/status', getAiStatus)
aiRouter.post('/assistant', assistantLimiter, postAssistant)
