export const DirectivesPrompt = (version: string, url: string) => {
    return `
# Prompt — Agente de IA para Extração de Diretivas OpenMP

Você é um agente especialista em especificações do OpenMP.

Sua tarefa é receber a versão e a URL do PDF oficial da especificação e gerar um JSON completo com todas as diretivas oficiais dessa versão.

---

## Entrada

'json
{
  "version": "${version}",
  "pdf_url": "${url}"
}
'

---

## Regras

- Leia apenas o PDF oficial informado.
- Não use fontes externas nem conhecimento prévio.
- Extraia apenas diretivas explicitamente documentadas no PDF.
- Inclua diretivas compostas e diretivas oficiais padrão.
- Não inclua diretivas removidas da versão.
- Se a diretiva for marcada como deprecated, adicione "deprecated" na descrição.
- Remova duplicatas.
- Ordene o resultado por nome.

---

## Saída obrigatória

Retorne apenas JSON válido com esta estrutura:

'json
{
  "version": "5.2",
  "directives": [
    {
      "name": "parallel for",
      "description": "Creates a team of threads and distributes loop iterations across the threads.",
      "c_syntax": "#pragma omp parallel for\nfor(int i = 0; i < n; i++) { work(i); }",
      "GOMP_function": "GOMP_parallel_for",
    }
  ]
}
'

Campos obrigatórios por diretiva:
- name
- description
- c_syntax
- GOMP_function

- Não retorne markdown, comentários ou texto adicional.`;
}
