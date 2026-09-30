import { NextRequest, NextResponse } from "next/server";
import { ensureDbInitialized } from "@/db/init";
import { db } from "@/db";
import { questions, userAnswers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();

    const body = await req.json();
    const { questionId, selectedOption, timeSpentSeconds = 0, notes } = body;

    if (!questionId || !selectedOption) {
      return NextResponse.json(
        { error: "Dados incompletos: questionId e selectedOption são obrigatórios." },
        { status: 400 }
      );
    }

    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, Number(questionId)))
      .limit(1);

    if (!question) {
      return NextResponse.json(
        { error: "Questão não encontrada." },
        { status: 404 }
      );
    }

    const isCorrect =
      String(selectedOption).trim().toUpperCase() ===
      String(question.correctOption).trim().toUpperCase();

    const [insertedAnswer] = await db
      .insert(userAnswers)
      .values({
        questionId: question.id,
        selectedOption: String(selectedOption).trim().toUpperCase(),
        isCorrect,
        timeSpentSeconds: Number(timeSpentSeconds) || 0,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      answer: insertedAnswer,
      isCorrect,
      correctOption: question.correctOption,
      directFoundation: question.directFoundation,
      distractorAnalysis: question.distractorAnalysis,
      fccTrapType: question.fccTrapType,
    });
  } catch (error: any) {
    console.error("Error in /api/fcc/answer:", error);
    return NextResponse.json(
      { error: "Erro ao registrar resposta", details: error?.message },
      { status: 500 }
    );
  }
}
