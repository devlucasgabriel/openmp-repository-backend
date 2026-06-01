import { DefaultEntity } from '../default.entity'
import {
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	Unique
} from 'typeorm'
import { FunctionEntity } from './function.entity'
import { DirectiveImplementancionEntity } from './directive-implementancion.entity'
import { CompilerImplementancionEntity } from './compiler-implementancion.entity'

@Entity('implementancion')
@Unique(['name', 'version'])
export class ImplementancionEntity extends DefaultEntity<ImplementancionEntity> {
	@PrimaryGeneratedColumn('identity')
	id: number

	@Column({ type: 'varchar' })
	name: string

	@Column({ type: 'varchar' })
	version: string

	@OneToMany(() => FunctionEntity, (func) => func.implementancion)
	functions: FunctionEntity[]

	@OneToMany(
		() => DirectiveImplementancionEntity,
		(directiveImplementancion) => directiveImplementancion.directive
	)
	directiviesImplementancions: DirectiveImplementancionEntity[]

	@OneToMany(
		() => CompilerImplementancionEntity,
		(compilerImplementancion) => compilerImplementancion.implementancion
	)
	compilerImplementancions: CompilerImplementancionEntity[]
}
