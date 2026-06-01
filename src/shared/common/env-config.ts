import { ConfigModule } from '@nestjs/config/dist/config.module'

ConfigModule.forRoot()

export const env = (key: string, defaultValue?: any) => {
  if (defaultValue === null && process.env[key] === null) {
    throw Error(
      `Environment variable ${key} not defined and no default value was received`
    )
  }

  return process.env[key] || defaultValue
}

export default env
