import log from 'loglevel'

const defaultLevel =
  import.meta.env.MODE === 'production'
    ? (import.meta.env.VITE_LOG_LEVEL_PROD || 'info')
    : (import.meta.env.VITE_LOG_LEVEL_DEV || 'debug')

log.setLevel(defaultLevel)

const formatPayload = (module, action, data = {}) => ({
  timestamp: new Date().toISOString(),
  module,
  action,
  ...('userId' in data ? { userId: data.userId } : {}),
  ...data,
})

export const logEvent = (level, module, action, data = {}) => {
  const payload = formatPayload(module, action, data)
  log[level](payload)
}

export const logger = log

export const logPerformance = (module, action, durationMs, data = {}) => {
  logEvent('info', module, action, { durationMs, ...data })
}

export const logError = (module, action, error, data = {}) => {
  logEvent('error', module, action, {
    message: error?.message,
    stack: error?.stack,
    ...data,
  })
}
