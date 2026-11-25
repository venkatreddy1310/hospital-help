import { createApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'

const app = createApp()

const server = app.listen(env.port, () => {
  logger.info(`MediPulse API listening on http://localhost:${env.port} (${env.nodeEnv})`)
})

server.on('error', (error) => {
  logger.error('Failed to start HTTP server', error)
  process.exit(1)
})

let isShuttingDown = false

function shutdown(signal: string): void {
  if (isShuttingDown) return
  isShuttingDown = true
  logger.info(`Received ${signal}. Closing HTTP server.`)

  server.close((error) => {
    if (error) {
      logger.error('Error while closing HTTP server', error)
      process.exit(1)
    }
    logger.info('HTTP server closed.')
    process.exit(0)
  })

  setTimeout(() => {
    logger.warn('Shutdown timed out. Forcing exit.')
    process.exit(1)
  }, 10_000).unref()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', reason)
})
