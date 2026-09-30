import { NextResponse } from "next/server";
import { ensureDbInitialized } from "@/db/init";
import { db } from "@/db";
import { questions, userAnswers, sessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    await ensureDbInitialized();

    const allAnswers = await db.select().from(userAnswers).orderBy(desc(userAnswers.answeredAt));
    const allQuestions = await db.select().from(questions);
    const allSessions = await db.select().from(sessions);

    const questionMap = new Map();
    allQuestions.forEach((q) => questionMap.set(q.id, q));

    const totalAnswered = allAnswers.length;
    const totalCorrect = allAnswers.filter((a) => a.isCorrect).length;
    const totalIncorrect = totalAnswered - totalCorrect;
    const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    // Breakdown by discipline
    const disciplineStats: Record<string, { total: number; correct: number; accuracy: number }> = {};
    const trapStats: Record<string, { total: number; wrongCount: number }> = {};

    allAnswers.forEach((ans) => {
      const q = questionMap.get(ans.questionId);
      if (q) {
        const disc = q.discipline || "Geral";
        if (!disciplineStats[disc]) {
          disciplineStats[disc] = { total: 0, correct: 0, accuracy: 0 };
        }
        disciplineStats[disc].total += 1;
        if (ans.isCorrect) {
          disciplineStats[disc].correct += 1;
        }

        const trap = q.fccTrapType || "Geral";
        if (!trapStats[trap]) {
          trapStats[trap] = { total: 0, wrongCount: 0 };
        }
        trapStats[trap].total += 1;
        if (!ans.isCorrect) {
          trapStats[trap].wrongCount += 1;
        }
      }
    });

    Object.keys(disciplineStats).forEach((k) => {
      const item = disciplineStats[k];
      item.accuracy = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalGeneratedSessions: allSessions.length,
        pdfSessions: allSessions.filter((s) => s.source === "pdf").length,
        totalGeneratedQuestions: allQuestions.length,
        totalAnswered,
        totalCorrect,
        totalIncorrect,
        overallAccuracy,
        disciplineStats,
        trapStats,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/fcc/stats:", error);
    return NextResponse.json(
      { error: "Erro ao compilar estatísticas", details: error?.message },
      { status: 500 }
    );
  }
}
