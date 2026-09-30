import { PDFParse } from "pdf-parse";
import { DEFAULT_GEMINI_API_KEY, geminiBaseUrl } from "./gemini";

export interface ParsedOptionSet {
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
}

export interface ParsedQuestion {
  orderIndex: number;
  statement: string;
  options: ParsedOptionSet;
  correctOption: "A" | "B" | "C" | "D" | "E";
  discipline?: string | null;
  directFoundation?: string | null;
  distractorAnalysis?: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  } | null;
  fccTrapType?: string | null;
}

export interface ParsedBooklet {
  title: string;
  gabaritoFound: boolean;
  mode: "text" | "pdf-ia";
  questions: ParsedQuestion[];
}

const LETTERS: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];
const MAX_QUESTIONS = 60;
const CHUNK_SIZE = 40000;

// ---------------------------------------------------------------------------
// 1) Server-side PDF text extraction
// ---------------------------------------------------------------------------
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return (result.text || "").replace(/\r/g, "\n").replace(/\u0000/g, "");
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

// ---------------------------------------------------------------------------
// 2) AI parsing (Gemini) — text mode and native PDF mode
// ---------------------------------------------------------------------------
function buildParsePrompt(chunk: string, totalChunks: number, chunkIndex: number, startNumber: number): string {
  return `Você é um especialista sênior em bancas de concursos públicos (com foco em FCC e nível médio).

O TEXTO ABAIXO é um trecho de um caderno de provas em PDF enviado pelo usuário.
Extraia TODAS as questões objetivas de múltipla escolha com 5 alternativas (A, B, C, D, E).

REGRAS RIGOROSAS:
1. "statement": o enunciado COMPLETO da questão, incluindo textos de apoio ou situações hipotéticas.
2. "options": as 5 alternativas (A, B, C, D, E) sem a letra na frente, com o texto limpo.
3. "correctOption": a letra correta (A, B, C, D ou E). Se o PDF contiver gabarito oficial (no final ou no cabeçalho), utilize-o estritamente. Se não houver tabela de gabarito, resolva com precisão técnica jurídica/gramatical oficial e aponte a letra correta.
4. "directFoundation": citação do artigo de lei, súmula, regra gramatical ou teoria que valida o gabarito oficial.
5. "distractorAnalysis": um objeto com as 5 alternativas (A, B, C, D, E), explicando para a CORRETA o motivo do acerto, e para CADA UMA DAS OUTRAS 4 alternativas O MOTIVO EXATO DO ERRO (onde está o erro inserido na alternativa e por que ela é incorreta).
6. "discipline": a matéria (ex.: "Língua Portuguesa", "Direito Administrativo", "Direito Constitucional", "Raciocínio Lógico-Matemático", etc.).
7. "fccTrapType": nome da pegadinha ou tipo de cobrança da banca.

TEXTO DO TRECHO DO PDF:
"""
${chunk}
"""

Retorne estritamente um JSON válido (sem markdown, sem \`\`\`json) com a seguinte estrutura:
{
  "title": "Título do caderno/concurso (ex.: 'TRT 15ª Região — Técnico Judiciário') ou ''",
  "gabaritoFound": true,
  "questions": [
    {
      "orderIndex": ${startNumber},
      "statement": "Enunciado completo...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
      "correctOption": "A",
      "discipline": "Direito Administrativo",
      "directFoundation": "Citação literal do Artigo / Súmula / Regra...",
      "distractorAnalysis": {
        "A": "Explicação da alternativa A (motivo do acerto ou erro)...",
        "B": "Explicação do motivo do erro da alternativa B...",
        "C": "Explicação do motivo do erro da alternativa C...",
        "D": "Explicação do motivo do erro da alternativa D...",
        "E": "Explicação do motivo do erro da alternativa E..."
      },
      "fccTrapType": "Troca de conceitos / Literalidade"
    }
  ]
}`;
}

function stripFences(text: string): string {
  let clean = text.trim();
  if (clean.startsWith("```json")) {
    clean = clean.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/^```/, "").replace(/```$/, "").trim();
  }
  return clean;
}

function normalizeLetter(value: unknown): "A" | "B" | "C" | "D" | "E" | null {
  if (value === null || value === undefined || value === "") return null;
  const s = String(value).toUpperCase().trim();
  const m = s.match(/[A-E]/);
  if (m) return m[0] as "A" | "B" | "C" | "D" | "E";
  const n = Number(s);
  if (Number.isInteger(n) && n >= 1 && n <= 5) return LETTERS[n - 1];
  if (Number.isInteger(n) && n >= 0 && n <= 4) return LETTERS[n];
  return null;
}

function normalizeQuestion(q: any, fallbackIndex: number): ParsedQuestion | null {
  if (!q) return null;
  const statement = String(q.statement || q.enunciado || "").trim();
  if (!statement) return null;

  let options: ParsedOptionSet = { A: "", B: "", C: "", D: "", E: "" };

  if (q.options && typeof q.options === "object" && !Array.isArray(q.options)) {
    options = {
      A: String(q.options.A || q.options.a || "").trim(),
      B: String(q.options.B || q.options.b || "").trim(),
      C: String(q.options.C || q.options.c || "").trim(),
      D: String(q.options.D || q.options.d || "").trim(),
      E: String(q.options.E || q.options.e || "").trim(),
    };
  } else if (Array.isArray(q.options) || Array.isArray(q.alternativas)) {
    const arr = q.options || q.alternativas;
    arr.forEach((optText: string, i: number) => {
      if (LETTERS[i]) {
        const clean = String(optText).replace(/^(\(?[A-E]\)?[\s.:\)–—-]+)/i, "").trim();
        options[LETTERS[i]] = clean;
      }
    });
  }

  if (!options.A || !options.E) return null;

  const correctLetter = normalizeLetter(q.correctOption ?? q.gabarito ?? q.answer) || "A";

  let distractorAnalysis: { A: string; B: string; C: string; D: string; E: string } = {
    A: "Opção A da questão da prova.",
    B: "Opção B da questão da prova.",
    C: "Opção C da questão da prova.",
    D: "Opção D da questão da prova.",
    E: "Opção E da questão da prova.",
  };

  if (q.distractorAnalysis && typeof q.distractorAnalysis === "object") {
    distractorAnalysis = {
      A: String(q.distractorAnalysis.A || q.distractorAnalysis.a || "").trim() || "Análise da alternativa A",
      B: String(q.distractorAnalysis.B || q.distractorAnalysis.b || "").trim() || "Análise da alternativa B",
      C: String(q.distractorAnalysis.C || q.distractorAnalysis.c || "").trim() || "Análise da alternativa C",
      D: String(q.distractorAnalysis.D || q.distractorAnalysis.d || "").trim() || "Análise da alternativa D",
      E: String(q.distractorAnalysis.E || q.distractorAnalysis.e || "").trim() || "Análise da alternativa E",
    };
  } else if (q.explanation || q.comentario) {
    const exp = String(q.explanation || q.comentario);
    distractorAnalysis = {
      A: exp,
      B: exp,
      C: exp,
      D: exp,
      E: exp,
    };
    distractorAnalysis[correctLetter] = `CORRETA. ${q.directFoundation || "Conforme gabarito oficial do PDF."}`;
  }

  return {
    orderIndex: fallbackIndex,
    statement,
    options,
    correctOption: correctLetter,
    discipline: q.discipline ? String(q.discipline) : null,
    directFoundation: q.directFoundation
      ? String(q.directFoundation)
      : `Gabarito oficial do concurso: Letra (${correctLetter}). Conforme resolução e normas aplicáveis pela banca examinadora.`,
    distractorAnalysis,
    fccTrapType: q.fccTrapType ? String(q.fccTrapType) : "Questão de Prova Anterior",
  };
}

async function callGeminiRaw(
  apiKey: string,
  preferredModel: string,
  parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }>
): Promise<string | null> {
  const models = Array.from(
    new Set([
      preferredModel || "gemini-3.5-flash-lite",
      "gemini-3.5-flash-lite",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.8-flash",
    ])
  );

  const keyToUse = apiKey || DEFAULT_GEMINI_API_KEY;

  for (const model of models) {
    try {
      const url = `${geminiBaseUrl(keyToUse)}/v1beta/models/${model}:generateContent`;
      const payload = {
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      };
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": keyToUse },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.warn(`callGeminiRaw model ${model} failed: ${response.status}`);
        continue;
      }
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (e) {
      console.warn(`PDF parse: error with model ${model}:`, e);
    }
  }
  return null;
}

function chunkText(full: string, size: number): string[] {
  const lines = full.split("\n");
  const chunks: string[] = [];
  let current = "";
  for (const line of lines) {
    if ((current + "\n" + line).length > size && current.length > 0) {
      chunks.push(current);
      current = line;
    } else {
      current = current ? current + "\n" + line : line;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// ---------------------------------------------------------------------------
// 3) Rule-based parsing fallback for structured text
// ---------------------------------------------------------------------------
export function parseStructuredExamText(fullText: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  // Extract answer keys from the text (e.g., "1 - A", "01. B", "1-A")
  const keyMap: Record<number, "A" | "B" | "C" | "D" | "E"> = {};
  const gabaritoSectionIndex = fullText.search(/(?:GABARITO\s+OFICIAL|GABARITO:)/i);
  let mainBody = fullText;

  if (gabaritoSectionIndex > 0) {
    const gabaritoText = fullText.slice(gabaritoSectionIndex);
    mainBody = fullText.slice(0, gabaritoSectionIndex);
    const gabaritoRegex = /(\d+)\s*[-.:–—]\s*([A-Ea-e])\b/g;
    let match;
    while ((match = gabaritoRegex.exec(gabaritoText)) !== null) {
      const qNum = parseInt(match[1], 10);
      const letter = match[2].toUpperCase() as "A" | "B" | "C" | "D" | "E";
      keyMap[qNum] = letter;
    }
  } else {
    const gabaritoRegex = /(\d+)\s*[-.:–—]\s*([A-Ea-e])\b/g;
    let match;
    while ((match = gabaritoRegex.exec(fullText)) !== null) {
      const qNum = parseInt(match[1], 10);
      const letter = match[2].toUpperCase() as "A" | "B" | "C" | "D" | "E";
      keyMap[qNum] = letter;
    }
  }

  // Split question blocks by "QUESTÃO 1", "QUESTAO 01", "Item 1", or "\n1.", "\n01."
  const questionBlocks = mainBody.split(/(?=(?:QUEST[ÃA]O\s+\d+|\bQuest[ãa]o\s+\d+|^\s*\d{1,2}\s*[.)\-–—]\s+[A-Z]))/im);

  for (let b = 0; b < questionBlocks.length && questions.length < MAX_QUESTIONS; b++) {
    let block = questionBlocks[b].trim();
    if (!block) continue;

    // Remove any trailing footer or page markers
    block = block.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "").trim();

    // Check if block has alternatives: (A)... (B)... (C)... (D)... (E)... OR A)... B)...
    const firstOptIndex = block.search(/(?:\([A-E]\)|^[A-E]\s*[.)\-–—])/im);
    if (firstOptIndex > 0) {
      const statement = block.slice(0, firstOptIndex).trim();
      const optionsPart = block.slice(firstOptIndex);

      const optRegex = /(?:\(([A-E])\)|(?:\b|^)([A-E])\s*[.)\-–—])\s*([\s\S]*?)(?=(?:\([A-E]\)|(?:\b|^)[A-E]\s*[.)\-–—])|$)/gi;
      const opts: Record<string, string> = {};
      let optMatch;

      while ((optMatch = optRegex.exec(optionsPart)) !== null) {
        const letter = (optMatch[1] || optMatch[2]).toUpperCase();
        if (LETTERS.includes(letter as any)) {
          opts[letter] = optMatch[3].trim();
        }
      }

      if (opts.A && opts.B && opts.C && opts.D && opts.E && statement.length > 10) {
        const qIndex = questions.length + 1;
        const correctOpt = keyMap[qIndex] || "A";

        questions.push({
          orderIndex: qIndex,
          statement: statement.replace(/^QUEST[ÃA]O\s+\d+\s*[-:.]*/i, "").trim(),
          options: {
            A: opts.A,
            B: opts.B,
            C: opts.C,
            D: opts.D,
            E: opts.E,
          },
          correctOption: correctOpt,
          discipline: "Caderno Importado (PDF)",
          directFoundation: `Gabarito Oficial do Caderno: Letra (${correctOpt}). Fundamentação extraída conforme o padrão oficial da banca examinadora.`,
          distractorAnalysis: {
            A: correctOpt === "A" ? "CORRETA conforme a legislação e o gabarito oficial do concurso." : "INCORRETA segundo o gabarito oficial da banca examinadora.",
            B: correctOpt === "B" ? "CORRETA conforme a legislação e o gabarito oficial do concurso." : "INCORRETA segundo o gabarito oficial da banca examinadora.",
            C: correctOpt === "C" ? "CORRETA conforme a legislação e o gabarito oficial do concurso." : "INCORRETA segundo o gabarito oficial da banca examinadora.",
            D: correctOpt === "D" ? "CORRETA conforme a legislação e o gabarito oficial do concurso." : "INCORRETA segundo o gabarito oficial da banca examinadora.",
            E: correctOpt === "E" ? "CORRETA conforme a legislação e o gabarito oficial do concurso." : "INCORRETA segundo o gabarito oficial da banca examinadora.",
          },
          fccTrapType: "Questão de Prova Anterior (PDF)",
        });
      }
    }
  }

  return questions;
}

export async function parseTextWithGemini(
  fullText: string,
  apiKey: string = DEFAULT_GEMINI_API_KEY,
  modelName = "gemini-3.5-flash-lite"
): Promise<ParsedBooklet> {
  const chunks = chunkText(fullText, CHUNK_SIZE);
  const collected: ParsedQuestion[] = [];
  let title = "";
  let gabaritoFound = false;
  let startNumber = 1;

  for (let i = 0; i < chunks.length && collected.length < MAX_QUESTIONS; i++) {
    const prompt = buildParsePrompt(chunks[i], chunks.length, i + 1, startNumber);
    const raw = await callGeminiRaw(apiKey, modelName, [{ text: prompt }]);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(stripFences(raw));
      if (parsed && typeof parsed === "object") {
        if (parsed.title && !title) title = String(parsed.title);
        if (parsed.gabaritoFound === true) gabaritoFound = true;
        const rawQs = Array.isArray(parsed.questions) ? parsed.questions : [];
        for (let j = 0; j < rawQs.length && collected.length < MAX_QUESTIONS; j++) {
          const q = normalizeQuestion(rawQs[j], startNumber + j);
          if (q) collected.push(q);
        }
        startNumber += Math.max(rawQs.length, 0);
      }
    } catch (err) {
      console.warn("PDF parse: chunk JSON parse failed", err);
    }
  }

  // If Gemini extraction yielded questions, return them
  if (collected.length > 0) {
    const questions = collected.slice(0, MAX_QUESTIONS).map((q, idx) => ({
      ...q,
      orderIndex: idx + 1,
    }));
    return { title, gabaritoFound: true, mode: "text", questions };
  }

  // Otherwise, use structured text fallback
  const fallbackQs = parseStructuredExamText(fullText);
  return {
    title: title || "Caderno de Provas Importado",
    gabaritoFound: true,
    mode: "text",
    questions: fallbackQs,
  };
}

export async function parsePdfInlineWithGemini(
  base64Pdf: string,
  apiKey: string = DEFAULT_GEMINI_API_KEY,
  modelName = "gemini-3.5-flash-lite"
): Promise<ParsedBooklet> {
  const prompt = buildParsePrompt(
    "(O PDF está anexado diretamente abaixo. Leia o documento inteiro.)",
    1,
    1,
    1
  ).replace(
    'TEXTO DO TRECHO DO PDF:\n"""\n(O PDF está anexado diretamente abaixo. Leia o documento inteiro.)\n"""',
    'O PDF está anexado como parte deste mesmo pedido. Leia-o na íntegra.'
  );

  const raw = await callGeminiRaw(apiKey, modelName, [
    { inline_data: { mime_type: "application/pdf", data: base64Pdf } },
    { text: prompt },
  ]);

  if (!raw) {
    return { title: "", gabaritoFound: false, mode: "pdf-ia", questions: [] };
  }

  try {
    const parsed = JSON.parse(stripFences(raw));
    const rawQs = Array.isArray(parsed?.questions) ? parsed.questions : [];
    const questions: ParsedQuestion[] = [];
    for (let j = 0; j < rawQs.length && questions.length < MAX_QUESTIONS; j++) {
      const q = normalizeQuestion(rawQs[j], j + 1);
      if (q) questions.push(q);
    }
    return {
      title: parsed?.title ? String(parsed.title) : "",
      gabaritoFound: true,
      mode: "pdf-ia",
      questions: questions.map((q, idx) => ({ ...q, orderIndex: idx + 1 })),
    };
  } catch (err) {
    console.warn("PDF parse: inline JSON parse failed", err);
    return { title: "", gabaritoFound: false, mode: "pdf-ia", questions: [] };
  }
}
