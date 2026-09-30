import { NextRequest, NextResponse } from "next/server";
import { ensureDbInitialized } from "@/db/init";
import { db } from "@/db";
import { sessions, questions, userAnswers } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, context: RouteParams) {
  try {
    await ensureDbInitialized();
    const { id } = await context.params;
    const sessionId = Number(id);

    if (!sessionId || Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "ID de sessão inválido." }, { status: 400 });
    }

    // 1. Find all questions for this session
    const sessQuestions = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.sessionId, sessionId));

    const qIds = sessQuestions.map((q) => q.id);

    // 2. Delete user answers if any
    if (qIds.length > 0) {
      await db.delete(userAnswers).where(inArray(userAnswers.questionId, qIds));
    }

    // 3. Delete questions
    await db.delete(questions).where(eq(questions.sessionId, sessionId));

    // 4. Delete session
    const [deleted] = await db
      .delete(sessions)
      .where(eq(sessions.id, sessionId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Caderno não encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Caderno excluído com sucesso.",
      deletedId: sessionId,
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/fcc/session/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao excluir caderno", details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteParams) {
  try {
    await ensureDbInitialized();
    const { id } = await context.params;
    const sessionId = Number(id);

    if (!sessionId || Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "ID de sessão inválido." }, { status: 400 });
    }

    const body = await req.json();
    const { newTitle } = body;

    if (!newTitle || typeof newTitle !== "string" || !newTitle.trim()) {
      return NextResponse.json(
        { error: "Novo título não informado ou inválido." },
        { status: 400 }
      );
    }

    const trimmedTitle = newTitle.trim();

    // 1. Update session theme/title
    const [updatedSession] = await db
      .update(sessions)
      .set({ theme: trimmedTitle })
      .where(eq(sessions.id, sessionId))
      .returning();

    if (!updatedSession) {
      return NextResponse.json({ error: "Caderno não encontrado." }, { status: 404 });
    }

    // 2. Update questions theme
    await db
      .update(questions)
      .set({ theme: trimmedTitle })
      .where(eq(questions.sessionId, sessionId));

    return NextResponse.json({
      success: true,
      message: "Caderno renomeado com sucesso.",
      session: updatedSession,
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/fcc/session/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao renomear caderno", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: RouteParams) {
  try {
    await ensureDbInitialized();
    const { id } = await context.params;
    const sessionId = Number(id);

    if (!sessionId || Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "ID de sessão inválido." }, { status: 400 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "restart" || action === "clear_answers") {
      // Find all questions in this session
      const sessQuestions = await db
        .select({ id: questions.id })
        .from(questions)
        .where(eq(questions.sessionId, sessionId));

      const qIds = sessQuestions.map((q) => q.id);

      if (qIds.length > 0) {
        await db.delete(userAnswers).where(inArray(userAnswers.questionId, qIds));
      }

      return NextResponse.json({
        success: true,
        message: "Bateria de questões reiniciada com sucesso. Respostas anteriores foram zeradas.",
        sessionId,
      });
    }

    return NextResponse.json({ error: "Ação não suportada." }, { status: 400 });
  } catch (error: any) {
    console.error("Error in POST /api/fcc/session/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao processar ação no caderno", details: error?.message },
      { status: 500 }
    );
  }
}
