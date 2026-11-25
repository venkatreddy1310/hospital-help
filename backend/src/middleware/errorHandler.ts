import type { ErrorRequestHandler, RequestHandler } from 'express'
import type { ApiFailure } from '../types/api.js'
import { logger } from '../utils/logger.js'

export class HttpError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, message: string, code = 'http_error') {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
  }
}

export const notFoundHandler: RequestHandler = (req, res) => {
  const body: ApiFailure = {
    success: false,
    error: {
      code: 'not_found',
      message: `Route ${req.method} ${req.originalUrl} was not found.`,
    },
  }
  res.status(404).json(body)
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message },
    } satisfies ApiFailure)
    return
  }

  // body-parser reports malformed JSON as a SyntaxError carrying the raw body.
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_json', message: 'Request body must be valid JSON.' },
    } satisfies ApiFailure)
    return
  }

  logger.error('Unhandled request error', error)
  res.status(500).json({
    success: false,
    error: { code: 'internal_error', message: 'An unexpected error occurred.' },
  } satisfies ApiFailure)
}
