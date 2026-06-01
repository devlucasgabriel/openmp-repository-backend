import { env } from "./env-config"


export const HTTP_PORT: number = env('HTTP_PORT', 3000)
export const NODE_ENV: string = env('NODE_ENV', 'development')
export const DB_USE: any = env('DB_USE', 'postgres')
export const DATABASE_HOST: string = env('DATABASE_HOST', 'localhost')
export const DATABASE_PORT: number = env('DATABASE_PORT', 5432)
export const DATABASE_USER: string = env('DATABASE_USER')
export const DATABASE_PASSWORD: string = env('DATABASE_PASSWORD')
export const DATABASE: string = env('DATABASE')

export const GEMINI_KEY: string = env('GEMINI_KEY')
export const GEMINI_MODEL: string = env('GEMINI_MODEL')