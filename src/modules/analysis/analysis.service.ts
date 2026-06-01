import { CompilerEntity } from "shared/database/models/compiler.entity"
import { ImplementancionEntity } from "shared/database/models/implementencion.entity"
import { FunctionEntity } from "shared/database/models/function.entity"
import { CompilerImplementancionEntity } from "shared/database/models/compiler-implementancion.entity"
import { CompilerFunctionEntity } from "shared/database/models/compiler-function.entity"
import { Injectable, BadRequestException, InternalServerErrorException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { GeminiService } from "../gemini/gemini.service"
import { OpenMPVersionsPrompt } from "../gemini/prompts/openMPVersion.prompt"
import { AnalyzeOpenMPSourcePrompt } from "../gemini/prompts/analyzeOpenMPSource.prompt"
import { OpenMPEntity } from "shared/database/models/openMP.entity"
import { DirectivesPrompt } from "../gemini/prompts/directives.prompt"
import { DirectiveEntity } from "shared/database/models/directive.entity"
import { Octokit } from "@octokit/rest"
import "multer"
import fs from "fs"
import readline from "readline";
import path from "path";
import { DirectiveImplementancionEntity } from "shared/database/models/directive-implementancion.entity"
import { DirectiveGompFunctionEntity } from "shared/database/models/directive-gomp-function.entity"
import { NotFoundException } from "@nestjs/common"

interface CompilerData {
	com_nome: string
	com_versao: string
	implementacoes: {
		imp_nome: string
		imp_versao: string
		funcoes: string[]
	}[]
}

@Injectable()
export class AnalysisService {

	 constructor(
		private readonly geminiService: GeminiService,
		@InjectRepository(CompilerEntity)
		private readonly compilerRepository: Repository<CompilerEntity>,
		@InjectRepository(ImplementancionEntity)
		private readonly implementancionRepository: Repository<ImplementancionEntity>,
		@InjectRepository(FunctionEntity)
		private readonly functionRepository: Repository<FunctionEntity>,
		@InjectRepository(CompilerImplementancionEntity)
		private readonly compilerImplementancionRepository: Repository<CompilerImplementancionEntity>,
		@InjectRepository(CompilerFunctionEntity)
		private readonly compilerFunctionRepository: Repository<CompilerFunctionEntity>,
		@InjectRepository(OpenMPEntity)
		private readonly openMPRepository: Repository<OpenMPEntity>,
		@InjectRepository(DirectiveEntity)
		private readonly directiveRepository: Repository<DirectiveEntity>,
		@InjectRepository(DirectiveImplementancionEntity)
		private readonly directiveImplementancionRepository: Repository<DirectiveImplementancionEntity>,
		@InjectRepository(DirectiveGompFunctionEntity)
		private readonly directiveGompFunctionRepository: Repository<DirectiveGompFunctionEntity>
	) {}

	async analyzeOpenMPSource(file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException('Nenhum arquivo foi fornecido');
		}

		const sourceCode = file.buffer.toString('utf8');
		const prompt = AnalyzeOpenMPSourcePrompt(file.originalname ?? 'source.c', sourceCode);
		const response = await this.geminiService.runAgentWithFile(
			prompt,
			file.buffer,
			file.mimetype || 'text/x-csrc'
		);

		if (!response) {
			throw new InternalServerErrorException('Nenhuma resposta do agente de IA');
		}

		try {
			return JSON.parse(response);
		} catch (error) {
			throw new InternalServerErrorException('Resposta do agente de IA não é JSON válido');
		}
	}

	async getGccVersions() {
		const regexBranch = /^releases\/gcc-\d+(?:\.\d+)*$/;
		const regexInicioOmp = /^OMP_\d+(?:\.\d+)*\s\{$/;
		const regexInicioGomp = /^GOMP_\d+(?:\.\d+)*\s\{$/;
		const regexFimBloco = /^\s*};|\}\s(OMP|GOMP)_\d+(?:\.\d+)*;$/;
		const resultado: CompilerData[] = [];
		const outputDir = path.join(process.cwd(), "libgompMaps");

		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		const octokit = new Octokit();
		const branches = await octokit.paginate<any>(
			"GET /repos/gcc-mirror/gcc/branches"
		);

		for (const branch of branches) {
			if (!branch.name || !regexBranch.test(branch.name)) {
				continue;
			}

			const subString = branch.name.split("/")[1];
			const [comNome, comVersao] = subString.split("-");

			const compilador: CompilerData = {
				com_nome: comNome,
				com_versao: comVersao,
				implementacoes: []
			};

			console.log(`\nProcessando ${subString}...`);

			try {
				const url =
					`https://raw.githubusercontent.com/gcc-mirror/gcc/releases/${subString}/libgomp/libgomp.map`;
				const response = await fetch(url);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}

				const data = await response.text();
				const filePath = path.join(outputDir, `${subString}-libgomp.map`);
				fs.writeFileSync(filePath, data, "utf8");

				const rl = readline.createInterface({
					input: fs.createReadStream(filePath),
					crlfDelay: Infinity
				});

				let currentImp: CompilerData["implementacoes"][number] | null = null;

				for await (const rawLine of rl) {
					const line = rawLine.trim();

					if (regexInicioOmp.test(line) || regexInicioGomp.test(line)) {
						const bloco = line.replace(" {", "");
						const [impNome, ...versaoParts] = bloco.split("_");
						const impVersao = versaoParts.join("_");

						currentImp = {
							imp_nome: impNome,
							imp_versao: impVersao,
							funcoes: []
						};

						compilador.implementacoes.push(currentImp);
						continue;
					}

					if (regexFimBloco.test(line)) {
						currentImp = null;
						continue;
					}

					if (
						currentImp &&
						line.endsWith(";") &&
						!line.startsWith("#")
					) {
						const funNome = line.replace(";", "").trim();
						currentImp.funcoes.push(funNome);
					}
				}

				resultado.push(compilador);
			} catch (error) {
				console.error(
					`Erro ao processar ${subString}:`,
					error instanceof Error ? error.message : error
				);
			}
		}

		fs.writeFileSync(
			path.join(process.cwd(), "resultado.json"),
			JSON.stringify(resultado, null, 4),
			"utf8"
		);

		console.log("\nArquivo resultado.json criado com sucesso.");
		this.processAndInsertData()
	}

	private async processAndInsertData() {
		try {
			const filePath = path.join(process.cwd(), "resultado.json")
			const fileBuffer = fs.readFileSync(filePath)
			const data = JSON.parse(fileBuffer.toString()) as CompilerData[]

			const results = []

			for (const compilerData of data) {
				const compiler = await this.compilerRepository.findOne({
					where: {
						name: compilerData.com_nome,
						version: compilerData.com_versao
					}
				})

				let compilerId: number

				if (compiler) {
					compilerId = compiler.id
				} else {
					const newCompiler = this.compilerRepository.create({
						name: compilerData.com_nome,
						version: compilerData.com_versao
					})
					const savedCompiler = await this.compilerRepository.save(newCompiler)
					compilerId = savedCompiler.id
				}

				for (const impl of compilerData.implementacoes) {
					let implementancion = await this.implementancionRepository.findOne({
						where: {
							name: impl.imp_nome,
							version: impl.imp_versao
						}
					})

					let implementancionId: number

					if (!implementancion) {
						implementancion = this.implementancionRepository.create({
							name: impl.imp_nome,
							version: impl.imp_versao
						})
						const savedImpl = await this.implementancionRepository.save(implementancion)
						implementancionId = savedImpl.id
					} else {
						implementancionId = implementancion.id
					}

					const existingRelation = await this.compilerImplementancionRepository.findOne({
						where: {
							compilerId,
							implementancionId
						}
					})

					if (!existingRelation) {
						const relation = this.compilerImplementancionRepository.create({
							compilerId,
							implementancionId
						})
						await this.compilerImplementancionRepository.save(relation)
					}

					for (const funcName of impl.funcoes) {
						if (funcName === '*') {
							continue
						}

						let func = await this.functionRepository.findOne({
							where: {
								name: funcName,
								implementicionId: implementancionId
							}
						})

						let functionId: number

						if (!func) {
							func = this.functionRepository.create({
								name: funcName,
								implementicionId: implementancionId
							})
							const savedFunc = await this.functionRepository.save(func)
							functionId = savedFunc.id
						} else {
							functionId = func.id
						}

						const existingFuncRelation = await this.compilerFunctionRepository.findOne({
							where: {
								compilerId,
								functionId
							}
						})

						if (!existingFuncRelation) {
							const funcRelation = this.compilerFunctionRepository.create({
								compilerId,
								functionId
							})
							await this.compilerFunctionRepository.save(funcRelation)
						}
					}
				}

				results.push({
					compiler: compilerData.com_nome,
					version: compilerData.com_versao,
					implementacoes: compilerData.implementacoes.length,
					status: 'Inserido com sucesso'
				})
			}

			console.log({
				sucesso: true,
				mensagem: `${data.length} compilador(es) processado(s) com sucesso`,
				detalhes: results
			})
			this.getOpenMPVersions()
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new BadRequestException('Arquivo JSON inválido')
			}
			throw error
		}
	}

	async getOpenMPVersions() {
		const response = await this.geminiService.runAgent(OpenMPVersionsPrompt)
		
		if (!response) {
			return
		}

		const versions = JSON.parse(response) as { version: string, pdf_url: string }[]

		for (const versionData of versions) {
			const existingVersion = await this.openMPRepository.findOne({
				where: {
					version: versionData.version
				}
			})

			if (existingVersion) {
				continue
			}

			await this.openMPRepository.save({
					version: versionData.version,
					pdf_url: versionData.pdf_url
			})
		}

		return this.getDirectives()
	}

	async getDirectives() {

		const versions = await this.openMPRepository.find()
		const directivesImplementancion: {id: number, gompFunction: string}[] = []

		for (const version of versions) {
			const response = await this.geminiService.runAgent(DirectivesPrompt(version.version, version.pdf_url))
			if (!response) {
				continue
			}
			const directives = JSON.parse(response) as {version: string, directives: {name: string, description: string, c_syntax: string, GOMP_function: string}[]}
			console.log(directives)
			for (const directive of directives.directives) {

				const directiveExists = await this.directiveRepository.findOne({
					where: {
						name: directive.name,
						openMPId: version.id
					}
				})

				if (directiveExists) {
					continue
				}

				const createdDirective = await this.directiveRepository.save({
					name: directive.name,
					description: directive.description,
					sintax: directive.c_syntax,
					openMPId: version.id
				})

				const implementancion = await this.implementancionRepository.findOne({
					where: {
						name: 'OMP',
						version: version.version
					}
				})

				if (implementancion) {
					await this.directiveImplementancionRepository.save({
						directiveId: createdDirective.id,
						implementancionId: implementancion.id
					})
				}

				if (directive.GOMP_function.includes('GOMP_')) {

					const gompFunction = await this.functionRepository.find({
						where: {
							name: directive.GOMP_function
						}
					})

					for (const func of gompFunction) {
						await this.directiveGompFunctionRepository.save({
							directiveId: createdDirective.id,
							gompFunctionId: func.id
						})
					}
			}
			}

			await new Promise(resolve => setTimeout(resolve, 10000))
		}

		console.log('Diretivas inseridas com sucesso')
	}

	async getDirectiveById(id: number) {
		const directive = await this.directiveRepository.findOne({
			where: { id }
		})

		if (!directive) {
			throw new NotFoundException('Diretiva não encontrada')
		}

		// all OpenMP versions that contain this directive name
		const sameNameDirectives = await this.directiveRepository.find({
			where: { name: directive.name },
			relations: ['openMP']
		})

		const openMPVersions = Array.from(new Set(sameNameDirectives.map(d => d.openMP?.version).filter(Boolean)))

		// GOMP functions linked to this directive
		const gompRelations = await this.directiveGompFunctionRepository.find({
			where: { directiveId: id },
			relations: ['gompFunctions', 'gompFunctions.implementancion']
		})

		const gompFunctions = gompRelations.map(r => ({
			name: r.gompFunctions?.name,
			implementacion: r.gompFunctions?.implementancion ? {
				name: r.gompFunctions.implementancion.name,
				version: r.gompFunctions.implementancion.version
			} : null
		}))

		// GCC versions: from implementacions linked to directive and from gomp functions' implementacions
		const directiveImpls = await this.directiveImplementancionRepository.find({
			where: { directiveId: id },
			relations: ['implementancion', 'implementancion.compilerImplementancions', 'implementancion.compilerImplementancions.compiler']
		})

		const gccVersionsSet = new Set<string>()

		for (const rel of directiveImpls) {
			const impl = rel.implementancion
			if (!impl) continue
			if (impl.compilerImplementancions) {
				for (const ci of impl.compilerImplementancions) {
					const comp = ci.compiler
					if (comp && comp.name && comp.name.toLowerCase().includes('gcc')) {
						gccVersionsSet.add(`${comp.name}-${comp.version}`)
					}
				}
			}
		}

		// also check gomp functions' implementacions
		for (const rel of gompRelations) {
			const impl = rel.gompFunctions?.implementancion
			if (!impl) continue
			if (impl.compilerImplementancions) {
				for (const ci of impl.compilerImplementancions) {
					const comp = ci.compiler
					if (comp && comp.name && comp.name.toLowerCase().includes('gcc')) {
						gccVersionsSet.add(`${comp.name}-${comp.version}`)
					}
				}
			}
		}

		const gccVersions = Array.from(gccVersionsSet)

		return {
			id: directive.id,
			name: directive.name,
			description: directive.description,
			sintax: directive.sintax,
			openMP_versions: openMPVersions,
			gomp_functions: gompFunctions,
			gcc_versions: gccVersions
		}
	}

	async getUniqueDirectiveNames() {
		const rows = await this.directiveRepository
			.createQueryBuilder('d')
			.select('MIN(d.id)', 'id')
			.addSelect('d.name', 'name')
			.groupBy('d.name')
			.orderBy('d.name', 'ASC')
			.getRawMany()

		return rows.map(r => ({ id: Number(r.id), name: r.name }))
	}
}
	
