import { FCC_SYSTEM_PROMPT, FCC_INCIDENCE_MATRIX } from "./fcc-knowledge-base";
import { findFoundationsForTheme } from "./constitution";

export interface GeneratedQuestion {
  orderIndex: number;
  discipline: string;
  theme: string;
  statement: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctOption: "A" | "B" | "C" | "D" | "E";
  directFoundation: string;
  distractorAnalysis: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  fccTrapType?: string;
}

export interface GeneratedRayX {
  frequency: "Alta" | "Média" | "Baixa";
  typicalPattern: {
    formatPreference: string;
    targetArticles: string[];
    styleSummary: string;
  };
  trapMapping: Array<{
    trapName: string;
    description: string;
    example: string;
  }>;
  seniorTip: string;
}

export interface FCCGenerationResult {
  theme: string;
  discipline: string;
  targetExam: string;
  rayX: GeneratedRayX;
  questions: GeneratedQuestion[];
  rawText?: string;
}

// A chave Gemini vive apenas no servidor (variável de ambiente GEMINI_API_KEY no .env).
// Nunca é exportada para o bundle do cliente. Um fallback vazio força o servidor a
// responder claramente quando a variável não está configurada.
export const DEFAULT_GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function generateFCCAnalysisAndQuestions(params: {
  theme: string;
  discipline?: string;
  targetExam?: string;
  questionCount?: number;
  customApiKey?: string;
  modelName?: string;
}): Promise<FCCGenerationResult> {
  const {
    theme,
    discipline = "Geral",
    targetExam = "FCC Nível Médio (Técnico Judiciário / Administrativo)",
    questionCount = 3,
    customApiKey,
    modelName = "gemini-3.5-flash-lite",
  } = params;

  const apiKey =
    customApiKey && customApiKey.trim().length > 0
      ? customApiKey.trim()
      : DEFAULT_GEMINI_API_KEY;

  const safeCount = Math.min(Math.max(Number(questionCount) || 3, 1), 10);

  // Get rigorous legal and linguistic foundations from our expert database
  const foundations = findFoundationsForTheme(theme);
  const foundationsContext = foundations
    .map(
      (f, idx) =>
        `BASIS ${idx + 1}:\nCategory: ${f.category}\nTitle: ${f.title}\nLegal Text: "${f.content}"\nKey Insight: ${f.keyInsight}`
    )
    .join("\n\n---\n\n");

  const promptContent = `
Você é o Especialista Sênior em Bancas de Concursos Públicos, com foco exclusivo na Fundação Carlos Chagas (FCC) para Nível Médio (Técnico Judiciário de TRTs, TREs, TRFs, TJs e Administrativos).

Analise o tema e gere EXATAMENTE ${safeCount} questões inéditas RIGOROSAMENTE sobre o tema solicitado:
TEMA: "${theme}"
DISCIPLINA: "${discipline}"
CONCURSO / ÓRGÃO ALVO: "${targetExam}"

=================================================================
VERDADE AXIOLÓGICA E CONTEÚDO FUNDAMENTAL PARA ESTA QUESTÃO:
(fundamentações exatas de lei que você DEVE transcrever e seguir rigorosamente para garantir precisão jurídica e gramatical 100%)

${foundationsContext}
=================================================================

Instruções Mandatórias para a Geração:
1. ETAPA 1: RAIO-X FCC (ANÁLISE DE INCIDÊNCIA RECENTE)
   - Frequência e Relevância: Alta, Média ou Baixa nos últimos 3 a 5 anos na FCC Nível Médio.
   - Padrão Típico de Cobrança: Preferência de formato (Casos Práticos ou Literalidade), artigos reais e regras.
   - Mapeamento de Pegadinhas: Trocas de termos recorrentes de engenharia de distratores da FCC.
   - Dica de Ouro do Especialista.

2. ETAPA 2: GERAÇÃO DE QUESTÕES INÉDITAS (PADRÃO FCC)
   - Gere ${safeCount} questões com 5 alternativas (A, B, C, D, E) estritamente sobre o tema e utilizando rigorosamente as regras e preceitos de lei descritos acima.
   - Nível Médio rigoroso, com vocabulário formal e sóbrio da FCC.

3. ETAPA 3: GABARITO COMENTADO E ENGENHARIA DE DISTRATORES (RIGOR EXTREMO)
   - Gabarito Oficial: A alternativa correta com transcrição literal das normas/les literárias acima.
   - Fundamento Direto ("directFoundation"): Deverá conter a transcrição rigorosa e exata do Artigo de Lei, Súmula Consolidação ou Regra Gramatical fundamentada nos BANCOS acima.
   - Análise de cada um dos distratores (A, B, C, D, E) com precisão absoluta, explicitando exatamente em que jurisprudência ou ponto de gramática a banca inseriu o erro.

Retorne estritamente um JSON com a seguinte estrutura:
{
  "theme": "${theme}",
  "discipline": "${discipline}",
  "targetExam": "${targetExam}",
  "rayX": {
    "frequency": "Alta" | "Média" | "Baixa",
    "typicalPattern": {
      "formatPreference": "Casos Práticos Hipotéticos" | "Assertivas Diretas / Literalidade" | "Misto",
      "targetArticles": ["Artigo X...", "Regra Y..."],
      "styleSummary": "Resumo do padrão FCC para o tema..."
    },
    "trapMapping": [
      {
        "trapName": "Nome da pegadinha",
        "description": "Explicação da pegadinha",
        "example": "Exemplo do distrator montado pela banca"
      }
    ],
    "seniorTip": "Dica de ouro do especialista"
  },
  "questions": [
    {
      "orderIndex": 1,
      "discipline": "${discipline}",
      "theme": "${theme}",
      "statement": "Enunciado da questão...",
      "options": {
        "A": "Texto da alternativa A",
        "B": "Texto da alternativa B",
        "C": "Texto da alternativa C",
        "D": "Texto da alternativa D",
        "E": "Texto da alternativa E"
      },
      "correctOption": "A" | "B" | "C" | "D" | "E",
      "directFoundation": "Citação literal rigorosa do Artigo ou Regra, fundamentado nas disposições verificáveis acima...",
      "distractorAnalysis": {
        "A": "Explicação detalhada da alternativa A",
        "B": "Explicação detalhada da alternativa B",
        "C": "Explicação detalhada da alternativa C",
        "D": "Explicação detalhada da alternativa D",
        "E": "Explicação detalhada da alternativa E"
      },
      "fccTrapType": "Tipo de pegadinha explorada"
    }
  ]
}
`;

  // Try calling Gemini API with 2026 models
  if (apiKey) {
    try {
      const result = await callGeminiApi(apiKey, modelName, promptContent);
      if (
        result &&
        result.rayX &&
        Array.isArray(result.questions) &&
        result.questions.length > 0
      ) {
        return result;
      }
    } catch (err) {
      console.warn("Gemini API call returned error. Falling back to theme-aware dynamic engine:", err);
    }
  }

  // Fallback to contextualized, theme-specific knowledge generation
  return generateDynamicThemeQuestions(theme, discipline, targetExam, safeCount);
}

async function callGeminiApi(
  apiKey: string,
  preferredModel: string,
  prompt: string
): Promise<FCCGenerationResult | null> {
  const modelsToTry = [
    preferredModel || "gemini-3.5-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
  ];

  // Remove duplicates while preserving order
  const uniqueModels = Array.from(new Set(modelsToTry));

  for (const model of uniqueModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${FCC_SYSTEM_PROMPT}\n\n${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // If 429 or 503, try next model or wait briefly
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = normalizeAndParseGeminiResponse(text);
        if (parsed) return parsed;
      }
    } catch (e) {
      console.warn(`Error with model ${model}:`, e);
    }
  }

  return null;
}

function normalizeAndParseGeminiResponse(text: string): FCCGenerationResult | null {
  try {
    let clean = text.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const obj = JSON.parse(clean);
    if (!obj) return null;

    // Normalize questions array
    const rawQuestions = Array.isArray(obj.questions)
      ? obj.questions
      : Array.isArray(obj.questoes)
      ? obj.questoes
      : [];

    if (rawQuestions.length === 0) return null;

    const normalizedQuestions: GeneratedQuestion[] = rawQuestions.map((q: any, idx: number) => {
      // Options can be {A: "...", B: "..."} or array ["A) ...", "B) ..."]
      let optionsObj: { A: string; B: string; C: string; D: string; E: string } = {
        A: "",
        B: "",
        C: "",
        D: "",
        E: "",
      };

      if (q.options && typeof q.options === "object" && !Array.isArray(q.options)) {
        optionsObj = {
          A: q.options.A || q.options.a || "",
          B: q.options.B || q.options.b || "",
          C: q.options.C || q.options.c || "",
          D: q.options.D || q.options.d || "",
          E: q.options.E || q.options.e || "",
        };
      } else if (Array.isArray(q.options) || Array.isArray(q.alternativas)) {
        const arr = q.options || q.alternativas;
        const letters: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];
        arr.forEach((optText: string, i: number) => {
          if (letters[i]) {
            // Strip leading "A) " or "(A) "
            const cleanText = String(optText).replace(/^(\(?[A-E]\)?[\s.:\-)—]+)/i, "").trim();
            optionsObj[letters[i]] = cleanText || String(optText);
          }
        });
      }

      // Answer / Correct Option
      let correctOpt: "A" | "B" | "C" | "D" | "E" = "A";
      const rawAns = q.correctOption || q.answer || q.gabarito || q.resposta || "A";
      const matchedLetter = String(rawAns).toUpperCase().match(/[A-E]/);
      if (matchedLetter) {
        correctOpt = matchedLetter[0] as "A" | "B" | "C" | "D" | "E";
      }

      // Distractor analysis
      let distractorObj: { A: string; B: string; C: string; D: string; E: string } = {
        A: "Análise da alternativa A",
        B: "Análise da alternativa B",
        C: "Análise da alternativa C",
        D: "Análise da alternativa D",
        E: "Análise da alternativa E",
      };

      if (q.distractorAnalysis && typeof q.distractorAnalysis === "object") {
        distractorObj = {
          A: q.distractorAnalysis.A || q.distractorAnalysis.a || "Incorreta segundo o padrão FCC.",
          B: q.distractorAnalysis.B || q.distractorAnalysis.b || "Incorreta segundo o padrão FCC.",
          C: q.distractorAnalysis.C || q.distractorAnalysis.c || "Incorreta segundo o padrão FCC.",
          D: q.distractorAnalysis.D || q.distractorAnalysis.d || "Incorreta segundo o padrão FCC.",
          E: q.distractorAnalysis.E || q.distractorAnalysis.e || "Incorreta segundo o padrão FCC.",
        };
      } else if (q.explanation || q.comentario) {
        const fullExp = String(q.explanation || q.comentario);
        distractorObj = {
          A: fullExp,
          B: fullExp,
          C: fullExp,
          D: fullExp,
          E: fullExp,
        };
        distractorObj[correctOpt] = `CORRETA. ${q.directFoundation || "Gabarito oficial fundamentado."}`;
      }

      return {
        orderIndex: q.orderIndex || idx + 1,
        discipline: q.discipline || obj.discipline || "Geral",
        theme: q.theme || obj.theme || "FCC Nível Médio",
        statement: q.statement || q.enunciado || "",
        options: optionsObj,
        correctOption: correctOpt,
        directFoundation:
          q.directFoundation ||
          q.fundamentacao ||
          q.fundamento ||
          "Conforme legislação e normas vigentes aplicadas pela FCC.",
        distractorAnalysis: distractorObj,
        fccTrapType: q.fccTrapType || q.pegadinha || "Padrão FCC de Nível Médio",
      };
    });

    // Normalize RayX
    const rayXRaw = obj.rayX || obj.raioX || {};
    const rayX: GeneratedRayX = {
      frequency: rayXRaw.frequency || "Alta",
      typicalPattern: {
        formatPreference:
          rayXRaw.typicalPattern?.formatPreference ||
          (typeof rayXRaw === "string" ? "Casos Práticos e Literalidade" : "Casos Práticos Hipotéticos"),
        targetArticles:
          Array.isArray(rayXRaw.typicalPattern?.targetArticles)
            ? rayXRaw.typicalPattern.targetArticles
            : [
                `Dispositivos e regras aplicadas ao tema ${obj.theme || ""}`,
                "Literalidade da legislação de regência e jurisprudência sumulada",
              ],
        styleSummary:
          rayXRaw.typicalPattern?.styleSummary ||
          (typeof rayXRaw === "string"
            ? rayXRaw
            : `A FCC cobra este tema com foco em literalidade e pequenas situações práticas do cotidiano funcional do servidor.`),
      },
      trapMapping: Array.isArray(rayXRaw.trapMapping)
        ? rayXRaw.trapMapping
        : [
            {
              trapName: "Troca sutil de palavras na literalidade",
              description: "A banca altera termos como 'depende' por 'independe' ou inverte prazos legais.",
              example: "Substituição de competência privativa por exclusiva ou alteração de prazos decadenciais.",
            },
          ],
      seniorTip:
        rayXRaw.seniorTip ||
        "Para gabaritar este tema na FCC Nível Médio, atente-se à literalidade estrita e elimine alternativas com termos absolutistas como 'sempre' ou 'em qualquer hipótese'.",
    };

    return {
      theme: obj.theme || "Tema FCC",
      discipline: obj.discipline || "Geral",
      targetExam: obj.targetExam || "FCC Nível Médio",
      rayX,
      questions: normalizedQuestions,
    };
  } catch (err) {
    console.error("Error normalizing Gemini JSON:", err);
    return null;
  }
}

// Dynamic Theme-Aware Generator for ANY custom subject
export function generateDynamicThemeQuestions(
  theme: string,
  rawDiscipline: string,
  targetExam: string,
  count: number = 3
): FCCGenerationResult {
  const lowerTheme = theme.toLowerCase();

  // Auto-detect discipline if set to Geral
  let discipline = rawDiscipline && rawDiscipline !== "Geral" ? rawDiscipline : "Direito Administrativo";
  if (
    lowerTheme.includes("crase") ||
    lowerTheme.includes("concord") ||
    lowerTheme.includes("regên") ||
    lowerTheme.includes("português") ||
    lowerTheme.includes("pontua") ||
    lowerTheme.includes("reescrit") ||
    lowerTheme.includes("pronome") ||
    lowerTheme.includes("sintaxe") ||
    lowerTheme.includes("conjunç") ||
    lowerTheme.includes("acentua") ||
    lowerTheme.includes("ortograf") ||
    lowerTheme.includes("verbo")
  ) {
    discipline = "Língua Portuguesa";
  } else if (
    lowerTheme.includes("constituc") ||
    lowerTheme.includes("artigo 5") ||
    lowerTheme.includes("art. 5") ||
    lowerTheme.includes("judiciário") ||
    lowerTheme.includes("remédios") ||
    lowerTheme.includes("nacionalidade") ||
    lowerTheme.includes("direitos fundamentais") ||
    lowerTheme.includes("organização do estado") ||
    lowerTheme.includes("poder legislativo") ||
    lowerTheme.includes("poder executivo") ||
    lowerTheme.includes("funções essenciais")
  ) {
    discipline = "Direito Constitucional";
  } else if (
    lowerTheme.includes("lógico") ||
    lowerTheme.includes("raciocínio") ||
    lowerTheme.includes("proposiç") ||
    lowerTheme.includes("tabela verdade") ||
    lowerTheme.includes("negação") ||
    lowerTheme.includes("equivalên") ||
    lowerTheme.includes("sequência") ||
    lowerTheme.includes("conjuntos") ||
    lowerTheme.includes("probabilidade") ||
    lowerTheme.includes("combinatória") ||
    lowerTheme.includes("diagramas")
  ) {
    discipline = "Raciocínio Lógico-Matemático";
  } else if (
    lowerTheme.includes("regimento") ||
    lowerTheme.includes("ética") ||
    lowerTheme.includes("1.171") ||
    lowerTheme.includes("12.527") ||
    lowerTheme.includes("13.146") ||
    lowerTheme.includes("acesso à informação") ||
    lowerTheme.includes("deficiência")
  ) {
    discipline = "Regimentos Internos e Legislação Específica";
  }

  // Determine frequency and pattern
  const matchedMatrix = FCC_INCIDENCE_MATRIX.find(
    (m) =>
      lowerTheme.includes(m.name.toLowerCase()) ||
      m.name.toLowerCase().includes(lowerTheme) ||
      m.discipline.toLowerCase() === discipline.toLowerCase()
  );

  const frequency = matchedMatrix?.frequency || "Alta";
  const preferredFormat =
    discipline === "Língua Portuguesa"
      ? "Assertivas Diretas / Literalidade e Reescrita"
      : discipline === "Raciocínio Lógico-Matemático"
      ? "Problemas de Raciocínio Situacionais"
      : "Casos Práticos Hipotéticos com Servidores";

  const rayX: GeneratedRayX = {
    frequency,
    typicalPattern: {
      formatPreference: preferredFormat,
      targetArticles: [
        `Dispositivos legais e normas basilares de ${theme}`,
        "Jurisprudência consolidada e literalidade do texto legal exigido pela FCC",
        "Situações cotidianas de tribunais (TRTs, TREs, TRFs, TJs) envolvendo Técnicos",
      ],
      styleSummary: `A FCC cobra ${theme} com rigor técnico e foco na literalidade das regras. Nos cadernos de nível médio, a banca formula enunciados com vocabulário formal e insere pegadinhas em detalhes pontuais de exceções, prazos e inversões conceituais.`,
    },
    trapMapping: [
      {
        trapName: `Inversão de Conceitos em ${theme}`,
        description: "Apresentar uma hipótese de exceção como se fosse a regra geral para induzir o candidato desatento ao erro.",
        example: `Afirmar que determinada providência em ${theme} é facultativa quando a lei a impõe de modo cogente.`,
      },
      {
        trapName: "Troca Sutil de Vocabulário ('Depende' vs 'Independe')",
        description: "Substituição pontual de uma palavra mantendo a redação idêntica ao texto de lei ou norma gramatical.",
        example: "Inserção de cláusula restritiva inexistente ou alteração de prazo legal.",
      },
      {
        trapName: "Confusão entre Institutos Correlatos",
        description: "Misturar hipóteses distintas para testar se o candidato domina a categorização precisa da matéria.",
        example: "Classificar um instituto pelo nome de outro instituto correlato no mesmo dispositivo.",
      },
    ],
    seniorTip: `Para gabaritar ${theme} na FCC de Nível Médio, faça a leitura atenta de todas as 5 alternativas até o ponto final, risque imediatamente as que contiverem termos absolutistas e procure o dispositivo literal de regência.`,
  };

  const questions: GeneratedQuestion[] = [];

  for (let i = 1; i <= count; i++) {
    // Generate specialized theme questions based on exact keywords
    if (lowerTheme.includes("licita") || lowerTheme.includes("14.133") || lowerTheme.includes("contrata")) {
      questions.push({
        orderIndex: i,
        discipline: "Direito Administrativo",
        theme: theme,
        statement: `Considere que determinado Tribunal Regional do Trabalho pretenda realizar a contratação direta para a aquisição de materiais e contratação de serviços técnicos especializados de natureza predominantemente intelectual, com profissional de notória especialização. À luz das disposições da Lei Federal nº 14.133/2021 (Nova Lei de Licitações e Contratos Administrativos):`,
        options: {
          A: "a contratação de serviços técnicos especializados de natureza predominantemente intelectual com profissional de notória especialização configura hipótese de inexigibilidade de licitação, sendo vedada a inexigibilidade para serviços de publicidade e divulgação.",
          B: "a inviabilidade de competição para serviços técnicos especializados autoriza a dispensa de licitação, dispensando-se a demonstração da notória especialização do contratado.",
          C: "a nova lei extinguiu a figura da inexigibilidade de licitação, passando todas as contratações diretas a serem enquadradas exclusivamente no rol taxativo de dispensa de licitação.",
          D: "a contratação direta por inexigibilidade independe de processo administrativo formal e dispensa a justificativa de preço quando houver notoriedade pública.",
          E: "os serviços de publicidade e divulgação institucional do Tribunal podem ser contratados diretamente por inexigibilidade, desde que contratada agência de notória especialização.",
        },
        correctOption: "A",
        directFoundation:
          "Art. 74, inciso III da Lei Federal nº 14.133/2021: 'É inexigível a licitação quando inviável a competição, em especial nos casos de: III - contratação dos seguintes serviços técnicos especializados de natureza predominantemente intelectual com profissionais ou empresas de notória especialização, vedada a inexigibilidade para serviços de publicidade e divulgação.'",
        distractorAnalysis: {
          A: "CORRETA. Transcrição exata do Art. 74, III da Lei 14.133/21, incluindo a expressa vedação legal para serviços de publicidade e divulgação.",
          B: "INCORRETA. A inviabilidade de competição é a essência da INEXIGIBILIDADE (Art. 74), e não de dispensa.",
          C: "INCORRETA. A Lei 14.133/21 manteve expressamente tanto a Inexigibilidade (Art. 74) quanto a Dispensa (Art. 75).",
          D: "INCORRETA. A contratação direta exige rigoroso processo administrativo com justificativa de preço e da escolha do fornecedor (Art. 72).",
          E: "INCORRETA. É expressamente VEDADA a contratação de publicidade e divulgação por inexigibilidade (Art. 74, III).",
        },
        fccTrapType: "Confusão entre Inexigibilidade vs Dispensa e vedação expressa para publicidade",
      });
    } else if (lowerTheme.includes("improbidade") || lowerTheme.includes("8.429") || lowerTheme.includes("14.230")) {
      questions.push({
        orderIndex: i,
        discipline: "Direito Administrativo",
        theme: theme,
        statement: `Lucas, Técnico Judiciário de um Tribunal, foi acusado de praticar conduta que resultou em prejuízo ao erário decorrente de negligência no controle de bens patrimoniais sob sua guarda, sem que houvesse qualquer vontade livre e consciente de auferir vantagem indevida ou de lesar a Administração Pública. Em conformidade com a Lei Federal nº 8.429/1992, com as alterações da Lei Federal nº 14.230/2021:`,
        options: {
          A: "a conduta de Lucas não configura ato de improbidade administrativa, pois a legislação passou a exigir a presença de dolo específico para todos os tipos de improbidade, tendo sido extinta a modalidade culposa.",
          B: "Lucas responderá por ato de improbidade administrativa que causa lesão ao erário na modalidade de culpa grave, sujeitando-se à perda da função pública.",
          C: "o ato de improbidade administrativa que causa prejuízo ao erário independe de dolo ou culpa, bastando a constatação objetiva do dano patrimonial.",
          D: "a responsabilidade por improbidade administrativa de Lucas é presumida em razão do cargo de Técnico, competindo-lhe comprovar que agiu com zelo.",
          E: "Lucas praticou ato de improbidade administrativa que atenta contra os princípios da administração pública, haja vista a violação culposa do dever de eficiência.",
        },
        correctOption: "A",
        directFoundation:
          "Art. 1º, §§ 1º, 2º e 3º, e Art. 10 da Lei Federal nº 8.429/92 (com redação dada pela Lei nº 14.230/21): '§ 1º Consideram-se atos de improbidade administrativa as condutas dolosas tipificadas nos arts. 9º, 10 e 11 desta Lei, ressalvados os tipos previstos em leis especiais. § 2º Considera-se dolo a vontade livre e consciente de alcançar o resultado ilícito tipificado nos arts. 9º, 10 e 11 desta Lei, não bastando a voluntariedade do agente. § 3º O mero exercício da função ou desempenho de competências públicas, sem comprovação de ato doloso com fim ilícito, afasta a responsabilidade por ato de improbidade administrativa'.",
        distractorAnalysis: {
          A: "CORRETA. A Lei 14.230/21 revogou a modalidade culposa dos atos de improbidade (inclusive do Art. 10), exigindo dolo específico para todos os atos.",
          B: "INCORRETA. Não existe mais improbidade por culpa (mesmo grave) na Lei 8.429/92 reformada.",
          C: "INCORRETA. A responsabilidade por improbidade é subjetiva com dolo específico, não existindo responsabilidade objetiva.",
          D: "INCORRETA. Não há presunção de dolo na Lei de Improbidade Administrativa.",
          E: "INCORRETA. Os atos do Art. 11 (princípios) também exigem dolo estrito e taxatividade dos incisos.",
        },
        fccTrapType: "Cobrança da extinção da improbidade culposa pela Lei 14.230/21",
      });
    } else if (lowerTheme.includes("crase")) {
      questions.push({
        orderIndex: i,
        discipline: "Língua Portuguesa",
        theme: theme,
        statement: `Considere o seguinte trecho adaptado de um expediente judiciário:\n\n'O magistrado comunicou _____ partes que a audiência fora redesignada _____ pedido do réu, cabendo ao oficial de justiça dirigir-se _____ residência da testemunha.'\n\nEm conformidade com a norma-padrão da língua portuguesa, as lacunas devem ser preenchidas, correta e respectivamente, por:`,
        options: {
          A: "às − a − à",
          B: "as − a − a",
          C: "às − à − à",
          D: "as − à − a",
          E: "às − a − a",
        },
        correctOption: "A",
        directFoundation:
          "Regência do verbo 'comunicar' (comunicar algo a alguém: 'a' + 'as partes' = às). A expressão 'a pedido' antecede substantivo masculino ('pedido'), ocorrendo apenas a preposição simples sem crase. O verbo 'dirigir-se' exige a preposição 'a' ('dirigir-se a' + 'a residência' = à residência).",
        distractorAnalysis: {
          A: "CORRETA. Emprego perfeito do sinal grave na 1ª e 3ª lacunas e preposição simples sem crase antes de substantivo masculino na 2ª lacuna.",
          B: "INCORRETA. Omitiu o sinal indicativo de crase em 'às partes' e 'à residência'.",
          C: "INCORRETA. Inseriu crase indevida antes de 'pedido', palavra masculina que recusa artigo feminino.",
          D: "INCORRETA. Incorreu em erro na 1ª, 2ª e 3ª lacunas.",
          E: "INCORRETA. Deixou de assinalar a crase no adjunto adverbial de lugar regido por 'dirigir-se a'.",
        },
        fccTrapType: "Crase antes de palavra masculina vs crase em regência verbal com regência em cadeia",
      });
    } else if (lowerTheme.includes("concord")) {
      questions.push({
        orderIndex: i,
        discipline: "Língua Portuguesa",
        theme: theme,
        statement: `A frase inteiramente correta quanto à concordância verbal e nominal, de acordo com a norma-padrão, é:`,
        options: {
          A: "Devem-se aos esforços contínuos da equipe a rápida tramitação dos recursos nos cartórios judiciais.",
          B: "Deve-se aos esforços contínuos da equipe a rápida tramitação dos recursos nos cartórios judiciais.",
          C: "Haviam muitos mandados pendentes de cumprimento pelos oficiais de justiça daquela comarca.",
          D: "Registrou-se, nos últimos trimestres, diversas melhorias nos fluxos de processos eletrônicos.",
          E: "Fazem mais de três meses que a nova versão do sistema de peticionamento foi homologada.",
        },
        correctOption: "B",
        directFoundation:
          "Na oração 'Deve-se aos esforços contínuos da equipe a rápida tramitação', o sujeito paciente é 'a rápida tramitação' (singular). Portanto, o verbo 'dever' deve flexionar-se na 3ª pessoa do singular acompanhado do pronome apassivador 'se'.",
        distractorAnalysis: {
          A: "INCORRETA. O verbo 'devem' foi indevidamente flexionado no plural por atração do termo preposicionado 'aos esforços contínuos', quando o sujeito é 'a rápida tramitação' (singular).",
          B: "CORRETA. Concordância rigorosa com o sujeito paciente posposto no singular ('a rápida tramitação').",
          C: "INCORRETA. O verbo 'haver' com sentido de 'existir' é impessoal e deve ficar na 3ª pessoa do singular: 'Havia muitos mandados'.",
          D: "INCORRETA. Com a partícula apassivadora 'se', o verbo concorda com o sujeito paciente no plural ('Registraram-se [...] diversas melhorias').",
          E: "INCORRETA. O verbo 'fazer' indicando tempo transcorrido é impessoal, devendo ficar no singular: 'Faz mais de três meses'.",
        },
        fccTrapType: "Atração indevida por adjunto adverbial posposto e verbos impessoais",
      });
    } else if (
      lowerTheme.includes("artigo 5") ||
      lowerTheme.includes("art. 5") ||
      lowerTheme.includes("remédios") ||
      lowerTheme.includes("constitui")
    ) {
      questions.push({
        orderIndex: i,
        discipline: "Direito Constitucional",
        theme: theme,
        statement: `Considere que determinado grupo de servidores pretenda impetrar remédio constitucional para assegurar o conhecimento de informações relativas à sua pessoa constantes de registros de banco de dados de entidade governamental, ao passo que outro cidadão busca anular ato lesivo ao patrimônio público. Segundo o Art. 5º da CF/88:`,
        options: {
          A: "conceder-se-á habeas data para assegurar o conhecimento de informações relativas à pessoa do impetrante, e qualquer cidadão é parte legítima para propor ação popular que vise a anular ato lesivo ao patrimônio público.",
          B: "o mandado de segurança é a via cabível para a obtenção de informações personalíssimas, sendo a ação popular privativa de partidos políticos com representação no Congresso.",
          C: "o habeas data e a ação popular são ações judiciais onerosas, exigindo-se o pagamento prévio de custas processuais em qualquer hipótese.",
          D: "a ação popular pode ser proposta por pessoa jurídica de direito privado para anulação de atos de improbidade sem necessidade de advogado.",
          E: "o mandado de injunção é o instrumento cabível para anular ato lesivo ao patrimônio histórico e cultural.",
        },
        correctOption: "A",
        directFoundation:
          "Art. 5º, incisos LXXII, 'a', e LXXIII da CF/88: 'LXXII - conceder-se-á habeas data: a) para assegurar o conhecimento de informações relativas à pessoa do impetrante, constantes de registros ou bancos de dados de entidades governamentais ou de caráter público; LXXIII - qualquer cidadão é parte legítima para propor ação popular que vise a anular ato lesivo ao patrimônio público ou de entidade de que o Estado participe, à moralidade administrativa, ao meio ambiente e ao patrimônio histórico e cultural, ficando o autor, salvo comprovada má-fé, isento de custas judiciais e do ônus da sucumbência'.",
        distractorAnalysis: {
          A: "CORRETA. Reproduz a exata literalidade das hipóteses constitucionais do Habeas Data e da Ação Popular.",
          B: "INCORRETA. O remédio específico para dados pessoais é o Habeas Data (e não Mandado de Segurança); ademais, Ação Popular é proposta por qualquer CIDADÃO.",
          C: "INCORRETA. O Habeas Data é gratuito (Art. 5º, LXXVII), e a Ação Popular é isenta de custas salvo comprovada má-fé (Art. 5º, LXXIII).",
          D: "INCORRETA. Pessoa jurídica não tem legitimidade ativa para propor Ação Popular (Súmula 365 do STF).",
          E: "INCORRETA. Mandado de Injunção serve para suprir falta de norma regulamentadora (Art. 5º, LXXI), não para anular atos lesivos.",
        },
        fccTrapType: "Confusão de hipóteses de cabimento e legitimidade ativa entre remédios constitucionais",
      });
    } else if (
      lowerTheme.includes("lógico") ||
      lowerTheme.includes("proposiç") ||
      lowerTheme.includes("equivalên") ||
      lowerTheme.includes("negação")
    ) {
      questions.push({
        orderIndex: i,
        discipline: "Raciocínio Lógico-Matemático",
        theme: theme,
        statement: `Considere a proposição lógica formulada por um Técnico Judiciário: 'Se o recurso foi tempestivo, então o mérito foi apreciado pelo Colegiado.' Do ponto de vista da lógica proposicional clássica, a proposição que constitui a NEGAÇÃO LÓGICA dessa afirmação é:`,
        options: {
          A: "O recurso foi tempestivo e o mérito não foi apreciado pelo Colegiado.",
          B: "Se o recurso não foi tempestivo, então o mérito não foi apreciado pelo Colegiado.",
          C: "Se o mérito não foi apreciado pelo Colegiado, então o recurso não foi tempestivo.",
          D: "O recurso não foi tempestivo ou o mérito foi apreciado pelo Colegiado.",
          E: "O recurso não foi tempestivo e o mérito foi apreciado pelo Colegiado.",
        },
        correctOption: "A",
        directFoundation:
          "Regra da Negação da Condicional (Regra do MANÉ): ~(P -> Q) <=> P ^ ~Q. Mantém-se o antecedente ('O recurso foi tempestivo') E nega-se o consequente ('o mérito não foi apreciado pelo Colegiado').",
        distractorAnalysis: {
          A: "CORRETA. Aplicação perfeita da regra da negação da condicional (P ^ ~Q).",
          B: "INCORRETA. Falácia comum (a negação de P -> Q não é uma condicional ~P -> ~Q).",
          C: "INCORRETA. Esta frase representa a EQUIVALÊNCIA da condicional (contrapositiva ~Q -> ~P), e não a sua negação.",
          D: "INCORRETA. Esta frase representa a equivalência disjuntiva da condicional (~P v Q).",
          E: "INCORRETA. Negou indevidamente o antecedente mantendo o consequente (~P ^ Q).",
        },
        fccTrapType: "Confusão clássica entre Equivalência (Contrapositiva) e Negação da Condicional",
      });
    } else {
      // General tailored question matching the exact theme words
      questions.push({
        orderIndex: i,
        discipline: discipline,
        theme: theme,
        statement: `Considere a disciplina jurídica aplicável a ${theme} no âmbito de certames conduzidos pela Fundação Carlos Chagas (FCC) para cargos de Nível Médio. A respeito das regras vigentes que regem essa matéria, assinale a alternativa correta:`,
        options: {
          A: `Em conformidade com a legislação de regência de ${theme}, a atuação administrativa vincula-se estritamente aos requisitos formais e materiais expressos em lei, sendo vedada a inovação por ato discricionário desprovido de respaldo legal.`,
          B: `As prerrogativas relativas a ${theme} podem ser exercidas de maneira discricionária pela autoridade pública, prescindindo de motivação expressa quando praticadas em sede de juízo monocrático.`,
          C: `A aplicação das regras de ${theme} depende obrigatoriamente de prévia autorização judicial, sendo nulo qualquer ato administrativo praticado de ofício pela Administração.`,
          D: `Os atos praticados no âmbito de ${theme} possuem eficácia retroativa automática (ex tunc), mesmo na hipótese de revogação por razões supervenientes de conveniência e oportunidade.`,
          E: `O descumprimento dos preceitos de ${theme} acarreta unicamente sanções de natureza moral, sendo expressamente vedada a responsabilização disciplinar do servidor envolvido.`,
        },
        correctOption: "A",
        directFoundation:
          `Princípio da Legalidade e normas de regência aplicadas a ${theme}: A Administração Pública está estritamente vinculada ao princípio da legalidade estrita (Art. 37, caput da CF/88), segundo o qual o agente público somente pode agir nos termos expressamente autorizados ou determinados por lei.`,
        distractorAnalysis: {
          A: "CORRETA. Reflete com fidelidade o princípio basilar da legalidade estrita e os requisitos formais e materiais exigidos pela FCC.",
          B: "INCORRETA. A motivação dos atos administrativos é regra cogente, não podendo ser dispensada arbitrariamente.",
          C: "INCORRETA. Em razão do atributo da autoexecutoriedade, a Administração pode agir de ofício sem prévia autorização judicial.",
          D: "INCORRETA. A revogação produz efeitos prospectivos (ex nunc), e não retroativos (ex tunc).",
          E: "INCORRETA. O servidor responde civil, penal e administrativamente pelos atos praticados no exercício do cargo.",
        },
        fccTrapType: `Princípio da Legalidade vs Discricionariedade em ${theme}`,
      });
    }
  }

  return {
    theme,
    discipline,
    targetExam,
    rayX,
    questions,
  };
}
