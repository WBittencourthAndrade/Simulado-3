import { NextResponse } from "next/server";
import { ensureDbInitialized } from "@/db/init";
import { db } from "@/db";
import { questions, userAnswers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    await ensureDbInitialized();

    const wrongAnswers = await db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.isCorrect, false))
      .orderBy(desc(userAnswers.answeredAt));

    const errorsWithQuestions = await Promise.all(
      wrongAnswers.map(async (ans) => {
        if (!ans.questionId) return null;

        const [q] = await db
          .select()
          .from(questions)
          .where(eq(questions.id, ans.questionId))
          .limit(1);

        if (!q) return null;

        return {
          answer: ans,
          question: q,
        };
      })
    );

    const filtered = errorsWithQuestions.filter(
      (item): item is { answer: typeof userAnswers.$inferSelect; question: typeof questions.$inferSelect } =>
        item !== null && item.question !== null
    );

    return NextResponse.json({
      success: true,
      errors: filtered,
    });
  } catch (error: any) {
    console.error("Error in /api/fcc/caderno-erros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar caderno de erros", details: error?.message },
      { status: 500 }
    );
  }
}
