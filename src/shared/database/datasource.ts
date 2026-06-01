import { DataSource, DataSourceOptions } from 'typeorm'
import { SeederOptions } from 'typeorm-extension'
// import { MainSeeder } from './seeds/MainSeeder'
import { DATABASE, DATABASE_HOST, DATABASE_PASSWORD, DATABASE_PORT, DATABASE_USER, DB_USE } from '../common/constants'

const options: DataSourceOptions & SeederOptions = {
  type: DB_USE,
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE,
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  // seeds: [MainSeeder],
  migrationsTableName: 'migrations_typeorm',
  entities: [__dirname + '/models/*.{ts,js}']
}

export const AppDataSource = new DataSource(options)
