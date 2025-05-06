import dotenv from 'dotenv'
import { serverConfig } from '@workspace/env'

dotenv.config()

export const config = {
  env: serverConfig.nodeEnv,
  isDev: serverConfig.isDev,
  isProd: serverConfig.isProd,

  server: {
    port: serverConfig.port,
    host: serverConfig.host,
  },

  logger: true,
}
