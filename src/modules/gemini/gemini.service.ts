import { GoogleGenAI, Part } from '@google/genai'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { OpenMPVersionsPrompt } from './prompts/openMPVersion.prompt'
import { GEMINI_MODEL } from 'shared/common/constants'

@Injectable()
export class GeminiService {

	constructor(
		private readonly googleGenAi: GoogleGenAI
	) {
	}

	async runAgent(prompt: string): Promise<string | undefined> {
		try {
			const response = await this.googleGenAi.models.generateContent({
				model: GEMINI_MODEL,
				contents: prompt
			})

			return response.text
		} catch (err) {
			console.log(err)
			throw new InternalServerErrorException(err)
		}
	}

	async runAgentWithFile(prompt: string, fileBuffer: Buffer, mimeType = 'application/octet-stream'): Promise<string | undefined> {
		try {
			const response = await this.googleGenAi.models.generateContent({
				model: GEMINI_MODEL,
				contents: [
					{
						parts: [
							{ text: prompt },
							{
								inlineData: {
									data: fileBuffer.toString('base64'),
									mimeType: 'text/plain'
								}
							}
						]
					}
				]
			})

			return response.text
		} catch (err) {
			console.log(err)
			throw new InternalServerErrorException(err)
		}
	}
}
