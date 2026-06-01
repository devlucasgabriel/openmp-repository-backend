import { DefaultEntity } from '../default.entity'
import {
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	Unique
} from 'typeorm'
import { CompilerFunctionEntity } from './compiler-function.entity'
import { CompilerImplementancionEntity } from './compiler-implementancion.entity'

@Entity('compiler')
@Unique(['name', 'version'])
export class CompilerEntity extends DefaultEntity<CompilerEntity> {
	@PrimaryGeneratedColumn('identity')
	id: number

	@Column({ type: 'varchar' })
	name: string

	@Column({ type: 'varchar' })
	version: string

	@OneToMany(
		() => CompilerFunctionEntity,
		(compilerFunction) => compilerFunction.compiler
	)
	compilerFunctions: CompilerFunctionEntity[]

	@OneToMany(
		() => CompilerImplementancionEntity,
		(compilerImplementancion) => compilerImplementancion.compiler
	)
	compilerImplementancions: CompilerImplementancionEntity[]
}
