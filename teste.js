import { Octokit } from "@octokit/rest";
import fs from "fs";
import readline from "readline";
import path from "path";

const octokit = new Octokit();

// Regex
// aceita:
// releases/gcc-4.9
// releases/gcc-10.2
// releases/gcc-14.3
// releases/gcc-15.0.1
const regexBranch =
    /^releases\/gcc-\d+(?:\.\d+)*$/;

// aceita:
// OMP_4.9 {
// GOMP_14.2 {
// OMP_15.0.1 {
const regexInicioOmp =
    /^OMP_\d+(?:\.\d+)*\s\{$/;

const regexInicioGomp =
    /^GOMP_\d+(?:\.\d+)*\s\{$/;

// aceita:
// };
// } OMP_4.9;
// } GOMP_14.2;
// } OMP_15.0.1;
const regexFimBloco =
    /^\s*};|\}\s(OMP|GOMP)_\d+(?:\.\d+)*;$/;

// Estrutura final JSON
const resultado = [];

const getDadosGcc = async () => {

    // cria pasta caso não exista
    if (!fs.existsSync("./libgompMaps")) {
        fs.mkdirSync("./libgompMaps");
    }

    const branches = await octokit.paginate(
        "GET /repos/gcc-mirror/gcc/branches"
    );

    for (const branch of branches) {

        if (!regexBranch.test(branch.name)) {
            continue;
        }

        const subString = branch.name.split("/")[1];

        const [comNome, comVersao] =
            subString.split("-");

        // objeto compilador
        const compilador = {
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

            const filePath =
                path.join(
                    "./libgompMaps",
                    `${subString}-libgomp.map`
                );

            fs.writeFileSync(filePath, data);

            const rl = readline.createInterface({
                input: fs.createReadStream(filePath),
                crlfDelay: Infinity
            });

            let currentImp = null;

            for await (const rawLine of rl) {

                const line = rawLine.trim();

                // início implementação
                if (
                    regexInicioOmp.test(line) ||
                    regexInicioGomp.test(line)
                ) {

                    const bloco =
                        line.replace(" {", "");

                    // evita quebrar versões futuras
                    const [
                        impNome,
                        ...versaoParts
                    ] = bloco.split("_");

                    const impVersao =
                        versaoParts.join("_");

                    currentImp = {
                        imp_nome: impNome,
                        imp_versao: impVersao,
                        funcoes: []
                    };

                    compilador.implementacoes.push(
                        currentImp
                    );

                    continue;
                }

                // fim bloco
                if (regexFimBloco.test(line)) {
                    currentImp = null;
                    continue;
                }

                // função
                if (
                    currentImp &&
                    line.endsWith(";") &&
                    !line.startsWith("#")
                ) {

                    const funNome = line
                        .replace(";", "")
                        .trim();

                    currentImp.funcoes.push(funNome);
                }
            }

            resultado.push(compilador);

        } catch (error) {

            console.error(
                `Erro ao processar ${subString}:`,
                error.message
            );
        }
    }

    // salva JSON final
    fs.writeFileSync(
        "./resultado.json",
        JSON.stringify(resultado, null, 4)
    );

    console.log(
        "\nArquivo resultado.json criado com sucesso."
    );
};

getDadosGcc();