import { DefaultEntity } from '../default.entity'
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	Unique
} from 'typeorm'
import { ImplementancionEntity } from './implementencion.entity'
import { CompilerFunctionEntity } from './compiler-function.entity'
import { DirectiveGompFunctionEntity } from './directive-gomp-function.entity'

@Entity('function')
@Unique(['name', 'implementicionId'])
export class FunctionEntity extends DefaultEntity<FunctionEntity> {
	@PrimaryGeneratedColumn('identity')
	id: number

	@Column({ type: 'varchar' })
	name: string

	@Column({ name: 'implementicion_id', type: 'integer' })
	implementicionId: number

	@ManyToOne(
		() => ImplementancionEntity,
		(implementancion) => implementancion.functions
	)
	@JoinColumn({ name: 'implementicion_id' })
	implementancion: ImplementancionEntity

	@OneToMany(
		() => CompilerFunctionEntity,
		(compilerFunction) => compilerFunction.function
	)
	compilerFunctions: CompilerFunctionEntity[]

	@OneToMany(
		() => DirectiveGompFunctionEntity,
		(directiveGompFunction) => directiveGompFunction.gompFunctions
	)
	directiviesGompFunctions: DirectiveGompFunctionEntity[]
}
