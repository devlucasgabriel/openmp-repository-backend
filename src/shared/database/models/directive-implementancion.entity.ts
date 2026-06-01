import { DefaultEntity } from '../default.entity'
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { DirectiveEntity } from './directive.entity'
import { ImplementancionEntity } from './implementencion.entity'

@Entity('directive_implementancion')
export class DirectiveImplementancionEntity extends DefaultEntity<DirectiveImplementancionEntity> {
	@PrimaryColumn({ type: 'integer', name: 'directive_id' })
	directiveId: number

	@PrimaryColumn({ type: 'integer', name: 'implementancion_id' })
	implementancionId: number

	@ManyToOne(
		() => DirectiveEntity,
		(directive) => directive.directiviesImplementancions
	)
	@JoinColumn({ name: 'directive_id' })
	directive: DirectiveEntity

	@ManyToOne(
		() => ImplementancionEntity,
		(implementancion) => implementancion.directiviesImplementancions
	)
	@JoinColumn({ name: 'implementancion_id' })
	implementancion: ImplementancionEntity
}
