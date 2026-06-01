import { Module } from '@nestjs/common'

import { GoogleGenAI } from '@google/genai'
import { GeminiService } from './gemini.service'
import { GEMINI_KEY } from 'shared/common/constants'

@Module({
	imports: [],
	providers: [
		GeminiService,
		{
			provide: GoogleGenAI,
			inject: [],
			useFactory: () => {
				return new GoogleGenAI({
					apiKey: GEMINI_KEY
				})
			}
		}
	],
	exports: [GeminiService]
})
export class GeminiModule {}
