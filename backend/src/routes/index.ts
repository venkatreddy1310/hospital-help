import { Router } from 'express'
import { aiRouter } from './ai.routes.js'
import { healthRouter } from './health.routes.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/ai', aiRouter)
