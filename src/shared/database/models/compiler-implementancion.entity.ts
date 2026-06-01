import { DefaultEntity } from '../default.entity'
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { ImplementancionEntity } from './implementencion.entity'
import { CompilerEntity } from './compiler.entity'

@Entity('compiler_implementancion')
export class CompilerImplementancionEntity extends DefaultEntity<CompilerImplementancionEntity> {
	@PrimaryColumn({ type: 'integer', name: 'compiler_id' })
	compilerId: number

	@PrimaryColumn({ type: 'integer', name: 'implementancion_id' })
	implementancionId: number

	@ManyToOne(
		() => CompilerEntity,
		(compiler) => compiler.compilerImplementancions
	)
	@JoinColumn({ name: 'compiler_id' })
	compiler: CompilerEntity

	@ManyToOne(
		() => ImplementancionEntity,
		(implementancion) => implementancion.compilerImplementancions
	)
	@JoinColumn({ name: 'implementancion_id' })
	implementancion: ImplementancionEntity
}
