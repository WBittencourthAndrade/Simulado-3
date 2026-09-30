import { NextRequest, NextResponse } from "next/server";
import {
  extractPdfText,
  parseTextWithGemini,
  parsePdfInlineWithGemini,
} from "@/lib/pdf-extractor";
import { DEFAULT_GEMINI_API_KEY } from "@/lib/gemini";
import { ensureDbInitialized } from "@/db/init";
import { db } from "@/db";
import { sessions, questions } from "@/db/schema";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_INLINE_PDF = 15 * 1024 * 1024; // 15 MB for native AI PDF reading

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();

    const form = await req.formData();
    const fileField = form.get("file");

    if (!fileField || !(fileField instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum PDF enviado. Selecione o arquivo do seu caderno." },
        { status: 400 }
      );
    }

    const isPdf =
      fileField.type === "application/pdf" ||
      fileField.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Formato inválido. Envie apenas arquivos PDF." },
        { status: 400 }
      );
    }

    if (fileField.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. O limite é de 20 MB." },
        { status: 400 }
      );
    }

    const apiKey =
      typeof form.get("apiKey") === "string" && (form.get("apiKey") as string).trim()
        ? (form.get("apiKey") as string).trim()
        : DEFAULT_GEMINI_API_KEY;

    const modelName =
      typeof form.get("modelName") === "string" && (form.get("modelName") as string).trim()
        ? (form.get("modelName") as string).trim()
        : "gemini-3.5-flash-lite";

    const buffer = Buffer.from(await fileField.arrayBuffer());

    // 1) Try server-side text extraction first (fast & reliable for digital PDFs)
    let text = "";
    try {
      text = (await extractPdfText(buffer)).trim();
    } catch (extractErr) {
      console.warn("PDF text extraction failed, will try native AI PDF reading:", extractErr);
    }

    let result;
    let mode: "text" | "pdf-ia";

    if (text.length >= 300) {
      mode = "text";
      result = await parseTextWithGemini(text, apiKey, modelName);
    } else if (fileField.size <= MAX_INLINE_PDF) {
      // Scanned or image-based PDF — let Gemini read the native PDF
      mode = "pdf-ia";
      const base64 = buffer.toString("base64");
      result = await parsePdfInlineWithGemini(base64, apiKey, modelName);
    } else {
      return NextResponse.json(
        {
          error:
            "Não foi possível ler o conteúdo do PDF. O arquivo parece ser escaneado e excede o limite de leitura direta. Tente um PDF digital.",
        },
        { status: 422 }
      );
    }

    if (!result.questions || result.questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "Nenhuma questão objetiva com 5 alternativas foi identificada no documento. Verifique se o PDF contém questões de concurso.",
        },
        { status: 422 }
      );
    }

    const title = result.title || fileField.name.replace(/\.pdf$/i, "");
    const safeFile = fileField.name;

    // 2) Persist directly in Database so it's immediately ready for Simulado & reflection in Stats/History/Caderno de Erros
    const [insertedSession] = await db
      .insert(sessions)
      .values({
        theme: title,
        discipline: result.questions[0]?.discipline || "Caderno Importado",
        targetExam: `Caderno Importado (${safeFile})`,
        questionCount: result.questions.length,
        incidenceLevel: "Alta",
        rayXData: {
          frequency: "Alta",
          typicalPattern: {
            formatPreference: "Caderno Importado (PDF)",
            targetArticles: [
              `Arquivo de origem: ${safeFile}`,
              "Questões e gabaritos extraídos diretamente do PDF enviado",
            ],
            styleSummary:
              "Simulado interativo montado a partir do caderno de provas enviado em PDF, com análise completa dos motivos dos erros em cada alternativa.",
          },
          trapMapping: [],
          seniorTip:
            "Responda mantendo a atenção às pegadinhas e revise no Caderno de Erros as questões que você errar.",
        },
        rawResponse: `PDF: ${safeFile} (modo: ${mode})`,
        source: "pdf",
      })
      .returning();

    const insertedQuestions = [];
    for (let i = 0; i < result.questions.length; i++) {
      const q = result.questions[i];
      const correctOpt = String(q.correctOption || "A").toUpperCase().slice(0, 1);

      const [insertedQ] = await db
        .insert(questions)
        .values({
          sessionId: insertedSession.id,
          orderIndex: i + 1,
          discipline: q.discipline || "Caderno Importado",
          theme: title,
          statement: q.statement,
          options: q.options,
          correctOption: correctOpt,
          directFoundation:
            q.directFoundation ||
            `Gabarito Oficial do Concurso: Letra (${correctOpt}). Resolução e fundamentação extraída conforme o caderno da banca.`,
          distractorAnalysis:
            q.distractorAnalysis || {
              A: "Análise da alternativa A",
              B: "Análise da alternativa B",
              C: "Análise da alternativa C",
              D: "Análise da alternativa D",
              E: "Análise da alternativa E",
            },
          fccTrapType: q.fccTrapType || "Questão de Prova Anterior",
        })
        .returning();
      insertedQuestions.push(insertedQ);
    }

    return NextResponse.json({
      success: true,
      mode,
      sourceFile: safeFile,
      title,
      sessionId: insertedSession.id,
      session: insertedSession,
      questions: insertedQuestions,
    });
  } catch (error: any) {
    console.error("Error in /api/fcc/import-pdfs:", error);
    return NextResponse.json(
      {
        error: "Falha ao processar o PDF",
        details: error?.message || "Erro interno ao ler o documento.",
      },
      { status: 500 }
    );
  }
}
