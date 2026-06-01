import { Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors, Get, Param, ParseIntPipe } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AnalysisService } from "./analysis.service";
import { Express } from "express";

@Controller('analysis')
export class AnalysisController {
	constructor(private readonly analysisService: AnalysisService) {}

	@Post('upload')
	@HttpCode(HttpStatus.CREATED)
	async uploadata() {
		return this.analysisService.getGccVersions();
	}

	@Post('analyze-openmp')
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(FileInterceptor('file'))
	async analyzeOpenMPSource(@UploadedFile() file: Express.Multer.File) {
		return this.analysisService.analyzeOpenMPSource(file);
	}

	@Post('directives')
	async analyzeDirectives() {
		return this.analysisService.getDirectives()
	}

	@Get('directive/:id')
	@HttpCode(HttpStatus.OK)
	async getDirectiveById(@Param('id', ParseIntPipe) id: number) {
		return this.analysisService.getDirectiveById(id)
	}

	@Get('directives/names')
	@HttpCode(HttpStatus.OK)
	async getDirectivesNames() {
		return this.analysisService.getUniqueDirectiveNames()
	}
}
