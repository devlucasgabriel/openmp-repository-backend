import { DefaultEntity } from '../default.entity'
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { FunctionEntity } from './function.entity'
import { CompilerEntity } from './compiler.entity'

@Entity('compiler_function')
export class CompilerFunctionEntity extends DefaultEntity<CompilerFunctionEntity> {
	@PrimaryColumn({ type: 'integer', name: 'compiler_id' })
	compilerId: number

	@PrimaryColumn({ type: 'integer', name: 'function_id' })
	functionId: number

	@ManyToOne(() => CompilerEntity, (compiler) => compiler.compilerFunctions)
	@JoinColumn({ name: 'compiler_id' })
	compiler: CompilerEntity

	@ManyToOne(() => FunctionEntity, (func) => func.compilerFunctions)
	@JoinColumn({ name: 'function_id' })
	function: FunctionEntity
}
