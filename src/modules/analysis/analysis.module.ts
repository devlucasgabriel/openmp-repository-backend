import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AnalysisController } from './analysis.controller'
import { AnalysisService } from './analysis.service'
import { CompilerEntity } from 'shared/database/models/compiler.entity'
import { ImplementancionEntity } from 'shared/database/models/implementencion.entity'
import { FunctionEntity } from 'shared/database/models/function.entity'
import { CompilerImplementancionEntity } from 'shared/database/models/compiler-implementancion.entity'
import { CompilerFunctionEntity } from 'shared/database/models/compiler-function.entity'
import { GeminiModule } from '../gemini/gemini.module'
import { OpenMPEntity } from 'shared/database/models/openMP.entity'
import { DirectiveEntity } from 'shared/database/models/directive.entity'
import { DirectiveGompFunctionEntity } from 'shared/database/models/directive-gomp-function.entity'
import { DirectiveImplementancionEntity } from 'shared/database/models/directive-implementancion.entity'

@Module({
	imports: [
		GeminiModule,
		TypeOrmModule.forFeature([
			CompilerEntity,
			ImplementancionEntity,
			FunctionEntity,
			CompilerImplementancionEntity,
			CompilerFunctionEntity,
			OpenMPEntity,
			DirectiveEntity,
			DirectiveImplementancionEntity,
			DirectiveGompFunctionEntity
		])
	],
	providers: [AnalysisService],
	controllers: [AnalysisController],
	exports: [AnalysisService]
})
export class AnalysisModule {}
