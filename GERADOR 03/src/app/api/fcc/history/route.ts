import { NextResponse } from "next/server";
import { ensureDbInitialized } from "@/db/init";
import { db } from "@/db";
import { sessions, questions, userAnswers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    await ensureDbInitialized();

    const allSessions = await db
      .select()
      .from(sessions)
      .orderBy(desc(sessions.createdAt))
      .limit(30);

    const detailedSessions = await Promise.all(
      allSessions.map(async (sess) => {
        const sessQuestions = await db
          .select()
          .from(questions)
          .where(eq(questions.sessionId, sess.id))
          .orderBy(questions.orderIndex);

        // Get answers for these questions
        const answersList = [];
        for (const q of sessQuestions) {
          const ans = await db
            .select()
            .from(userAnswers)
            .where(eq(userAnswers.questionId, q.id));
          if (ans.length > 0) {
            answersList.push(...ans);
          }
        }

        const totalAnswered = answersList.length;
        const totalCorrect = answersList.filter((a) => a.isCorrect).length;

        return {
          ...sess,
          questions: sessQuestions,
          answers: answersList,
          stats: {
            totalQuestions: sessQuestions.length,
            totalAnswered,
            totalCorrect,
            accuracy:
              totalAnswered > 0
                ? Math.round((totalCorrect / totalAnswered) * 100)
                : 0,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      sessions: detailedSessions,
    });
  } catch (error: any) {
    console.error("Error in /api/fcc/history:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico", details: error?.message },
      { status: 500 }
    );
  }
}
