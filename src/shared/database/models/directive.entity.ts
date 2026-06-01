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
import { OpenMPEntity } from './openMP.entity'
import { DirectiveImplementancionEntity } from './directive-implementancion.entity'
import { DirectiveGompFunctionEntity } from './directive-gomp-function.entity'

@Entity('directive')
@Unique(['name', 'openMPId'])
export class DirectiveEntity extends DefaultEntity<DirectiveEntity> {
	@PrimaryGeneratedColumn('identity')
	id: number

	@Column({ type: 'varchar' })
	name: string

	@Column({ type: 'varchar' })
	description: string

	@Column({ type: 'text' })
	sintax: string

	@Column({ name: 'open_mp_id', type: 'integer' })
	openMPId: number

	@ManyToOne(() => OpenMPEntity, (openMP) => openMP.directives)
	@JoinColumn({ name: 'open_mp_id' })
	openMP: OpenMPEntity

	@OneToMany(
		() => DirectiveImplementancionEntity,
		(directiveImplementancion) => directiveImplementancion.implementancion
	)
	directiviesImplementancions: DirectiveImplementancionEntity[]

	@OneToMany(
		() => DirectiveGompFunctionEntity,
		(directiveGompFunction) => directiveGompFunction.directive
	)
	directiviesGompFunctions: DirectiveGompFunctionEntity[]
}
