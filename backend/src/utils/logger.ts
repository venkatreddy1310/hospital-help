type LogLevel = 'info' | 'warn' | 'error'

const levels: Record<LogLevel, (...data: unknown[]) => void> = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

function write(level: LogLevel, message: string, ...meta: unknown[]): void {
  levels[level](`[medipulse-api] ${new Date().toISOString()} ${level.toUpperCase()} ${message}`, ...meta)
}

export const logger = {
  info: (message: string, ...meta: unknown[]) => write('info', message, ...meta),
  warn: (message: string, ...meta: unknown[]) => write('warn', message, ...meta),
  error: (message: string, ...meta: unknown[]) => write('error', message, ...meta),
}
