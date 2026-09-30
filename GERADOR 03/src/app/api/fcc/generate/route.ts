import { NextRequest, NextResponse } from "next/server";
import { ensureDbInitialized } from "@/db/init";
import { db } from "@/db";
import { sessions, questions } from "@/db/schema";
import { generateFCCAnalysisAndQuestions } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();

    const body = await req.json();
    const {
      theme,
      discipline = "Geral",
      targetExam = "FCC Nível Médio (Técnico Judiciário)",
      questionCount = 3,
      apiKey,
      modelName,
    } = body;

    if (!theme || typeof theme !== "string" || theme.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Tema não informado",
          message:
            "Informe o Tema desejado (e, se houver, a Disciplina e o Concurso/Órgão alvo). Exemplo: Atos Administrativos - Técnico do TRT ou Crase - FCC Nível Médio",
        },
        { status: 400 }
      );
    }

    const safeCount = Math.min(Math.max(Number(questionCount) || 3, 1), 10);

    const generated = await generateFCCAnalysisAndQuestions({
      theme: theme.trim(),
      discipline: discipline.trim(),
      targetExam: targetExam.trim(),
      questionCount: safeCount,
      customApiKey: apiKey,
      modelName: modelName,
    });

    // Save session to database
    const [insertedSession] = await db
      .insert(sessions)
      .values({
        theme: generated.theme,
        discipline: generated.discipline,
        targetExam: generated.targetExam,
        questionCount: generated.questions.length,
        incidenceLevel: generated.rayX.frequency || "Alta",
        rayXData: generated.rayX,
        rawResponse: JSON.stringify(generated),
      })
      .returning();

    // Save questions to database
    const insertedQuestions = [];
    for (const q of generated.questions) {
      const [insertedQ] = await db
        .insert(questions)
        .values({
          sessionId: insertedSession.id,
          orderIndex: q.orderIndex,
          discipline: generated.discipline,
          theme: generated.theme,
          statement: q.statement,
          options: q.options,
          correctOption: q.correctOption,
          directFoundation: q.directFoundation,
          distractorAnalysis: q.distractorAnalysis,
          fccTrapType: q.fccTrapType || "Padrão FCC",
        })
        .returning();
      insertedQuestions.push(insertedQ);
    }

    return NextResponse.json({
      success: true,
      sessionId: insertedSession.id,
      session: insertedSession,
      rayX: generated.rayX,
      questions: insertedQuestions,
    });
  } catch (error: any) {
    console.error("Error in /api/fcc/generate:", error);
    return NextResponse.json(
      {
        error: "Falha ao processar análise e geração FCC",
        details: error?.message || "Erro interno",
      },
      { status: 500 }
    );
  }
}
