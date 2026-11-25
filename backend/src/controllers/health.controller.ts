import type { Request, Response } from 'express'
import { env } from '../config/env.js'
import type { ApiResponse, HealthStatus } from '../types/api.js'

const SERVICE_NAME = 'medipulse-api'
const SERVICE_VERSION = '0.1.0'

export function getHealth(_req: Request, res: Response<ApiResponse<HealthStatus>>): void {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    },
  })
}
