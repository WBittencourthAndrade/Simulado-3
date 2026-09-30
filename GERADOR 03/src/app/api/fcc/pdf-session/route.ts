import { NextRequest, NextResponse } from "next/server";
import { ensureDbInitialized } from "@/db/init";
import { db } from "@/db";
import { sessions, questions } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();

    const body = await req.json();
    const { title, sourceFile, discipline, questions: incoming } = body;

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma questão informada para o caderno importado." },
        { status: 400 }
      );
    }

    const safeQuestions = incoming
      .filter(
        (q: any) =>
          q &&
          typeof q.statement === "string" &&
          q.statement.trim().length > 0 &&
          q.options &&
          typeof q.options === "object"
      )
      .slice(0, 60);

    if (safeQuestions.length === 0) {
      return NextResponse.json(
        { error: "Questões inválidas. Nenhum enunciado completo foi recebido." },
        { status: 400 }
      );
    }

    const safeTitle =
      typeof title === "string" && title.trim() ? title.trim() : "Caderno Importado (PDF)";
    const safeFile =
      typeof sourceFile === "string" && sourceFile.trim() ? sourceFile.trim() : "caderno.pdf";

    const [insertedSession] = await db
      .insert(sessions)
      .values({
        theme: safeTitle,
        discipline:
          typeof discipline === "string" && discipline.trim()
            ? discipline.trim()
            : "Caderno Importado",
        targetExam: `Caderno Importado (${safeFile})`,
        questionCount: safeQuestions.length,
        incidenceLevel: "—",
        rayXData: {
          frequency: "—",
          typicalPattern: {
            formatPreference: "Caderno Importado",
            targetArticles: [
              `Fonte: ${safeFile}`,
              "Questões do próprio caderno do usuário, lidas e estruturadas pela IA",
            ],
            styleSummary:
              "Sessão originada de caderno de provas importado via PDF, convertida em simulado interativo com as mesmas características das questões geradas pelo especialista.",
          },
          trapMapping: [],
          seniorTip:
            "Responda com o ritmo de prova e revise no Caderno de Erros as questões em que os distratores capturaram você.",
        },
        rawResponse: `PDF: ${safeFile}`,
        source: "pdf",
      })
      .returning();

    const insertedQuestions = [];
    for (let i = 0; i < safeQuestions.length; i++) {
      const q = safeQuestions[i];
      const [insertedQ] = await db
        .insert(questions)
        .values({
          sessionId: insertedSession.id,
          orderIndex: i + 1,
          discipline:
            typeof q.discipline === "string" && q.discipline.trim()
              ? q.discipline.trim()
              : "Caderno Importado",
          theme: safeTitle,
          statement: q.statement,
          options: q.options,
          correctOption: String(q.correctOption || "A").toUpperCase().slice(0, 1),
          directFoundation:
            typeof q.directFoundation === "string" && q.directFoundation.trim()
              ? q.directFoundation.trim()
              : "Questão de prova anterior. Consulte o gabarito comentado oficial do concurso para a fundamentação completa.",
          distractorAnalysis:
            q.distractorAnalysis && typeof q.distractorAnalysis === "object"
              ? q.distractorAnalysis
              : {},
          fccTrapType:
            typeof q.fccTrapType === "string" && q.fccTrapType.trim()
              ? q.fccTrapType.trim()
              : "Questão de prova anterior (PDF)",
        })
        .returning();
      insertedQuestions.push(insertedQ);
    }

    return NextResponse.json({
      success: true,
      sessionId: insertedSession.id,
      session: insertedSession,
      questions: insertedQuestions,
    });
  } catch (error: any) {
    console.error("Error in /api/fcc/pdf-session:", error);
    return NextResponse.json(
      { error: "Erro ao salvar caderno importado", details: error?.message },
      { status: 500 }
    );
  }
}
