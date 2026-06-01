import { DefaultEntity } from '../default.entity'
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { DirectiveEntity } from './directive.entity'
import { FunctionEntity } from './function.entity'

@Entity('directive_gomp_function')
export class DirectiveGompFunctionEntity extends DefaultEntity<DirectiveGompFunctionEntity> {
	@PrimaryColumn({ type: 'integer', name: 'directive_id' })
	directiveId: number

	@PrimaryColumn({ type: 'integer', name: 'gomp_function_id' })
	gompFunctionId: number

	@ManyToOne(
		() => DirectiveEntity,
		(directive) => directive.directiviesGompFunctions
	)
	@JoinColumn({ name: 'directive_id' })
	directive: DirectiveEntity

	@ManyToOne(
		() => FunctionEntity,
		(gompFunction) => gompFunction.directiviesGompFunctions
	)
	@JoinColumn({ name: 'gomp_function_id' })
	gompFunctions: FunctionEntity
}
