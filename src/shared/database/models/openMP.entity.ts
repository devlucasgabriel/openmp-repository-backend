import { DefaultEntity } from '../default.entity'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { DirectiveEntity } from './directive.entity'

@Entity('open_mp')
export class OpenMPEntity extends DefaultEntity<OpenMPEntity> {
	@PrimaryGeneratedColumn('identity')
	id: number

	@Column({ type: 'varchar', unique: true })
	version: string

	@Column({ type: 'varchar', unique: true })
	pdf_url: string

	@OneToMany(() => DirectiveEntity, (directive) => directive.openMP)
	directives: DirectiveEntity[]
}
