"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Quote,
  Trash2,
  Edit2,
  RotateCcw,
  Play,
  Check,
  X,
  AlertTriangle,
  FileUp,
} from "lucide-react";

interface QuestionRecord {
  id: number;
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
  distractorAnalysis?: Record<string, string>;
  fccTrapType?: string | null;
}

interface SessionItem {
  id: number;
  theme: string;
  discipline: string;
  targetExam: string;
  questionCount: number;
  incidenceLevel: string;
  createdAt: string;
  source?: string;
  questions: QuestionRecord[];
  answers?: Array<{
    id: number;
    questionId: number;
    selectedOption: string;
    isCorrect: boolean;
  }>;
  stats: {
    totalQuestions: number;
    totalAnswered: number;
    totalCorrect: number;
    accuracy: number;
  };
}

interface HistoryViewProps {
  onGoToGenerator: () => void;
  onStartSimulado?: (questions: QuestionRecord[], title: string, sessionId: number) => void;
  onRefreshStats?: () => void;
}

export function HistoryView({
  onGoToGenerator,
  onStartSimulado,
  onRefreshStats,
}: HistoryViewProps) {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Rename state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitleText, setEditTitleText] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Restart state
  const [restartingId, setRestartingId] = useState<number | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/fcc/history");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handleStartRename = (sess: SessionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(sess.id);
    setEditTitleText(sess.theme);
  };

  const handleSaveRename = async (sessionId: number) => {
    if (!editTitleText.trim()) {
      setEditingId(null);
      return;
    }

    setIsRenaming(true);
    try {
      const res = await fetch(`/api/fcc/session/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTitle: editTitleText.trim() }),
      });

      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, theme: editTitleText.trim() } : s))
        );
      }
    } catch (err) {
      console.error("Erro ao renomear caderno:", err);
    } finally {
      setIsRenaming(false);
      setEditingId(null);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/fcc/session/${sessionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        // Clear local progress if any
        try {
          const sess = sessions.find((s) => s.id === sessionId);
          if (sess) {
            localStorage.removeItem(`fcc_simulado_progress_${sessionId}`);
            localStorage.removeItem(`fcc_simulado_progress_${sess.theme}`);
          }
        } catch {
          /* ignore */
        }
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error("Erro ao excluir caderno:", err);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleRestartSession = async (sess: SessionItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRestartingId(sess.id);

    try {
      await fetch(`/api/fcc/session/${sess.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restart" }),
      });

      // Clear local storage progress
      try {
        localStorage.removeItem(`fcc_simulado_progress_${sess.id}`);
        localStorage.removeItem(`fcc_simulado_progress_${sess.theme}`);
      } catch {
        /* ignore */
      }

      if (onStartSimulado) {
        onStartSimulado(sess.questions, sess.theme, sess.id);
      } else {
        // Refresh local state
        await fetchHistory();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error("Erro ao reiniciar caderno:", err);
    } finally {
      setRestartingId(null);
    }
  };

  const handleResumeSimulado = (sess: SessionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartSimulado) {
      onStartSimulado(sess.questions, sess.theme, sess.id);
    }
  };

  const optionLetters: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];

  return (
    <div className="space-y-6 pb-16 fcc-fade-in relative">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-5 sm:p-8 shadow-2xl border border-slate-800">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(700px 260px at 85% -10%, rgba(37,99,235,0.22), transparent 60%)",
          }}
        />
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-amber-400/30 px-3 py-1 text-[11px] font-bold text-amber-200">
            <History className="w-3.5 h-3.5" />
            <span>Gerenciamento de Cadernos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Histórico de Cadernos</h1>
          <p className="text-xs sm:text-sm text-slate-400 fcc-text">
            Gerencie todos os seus cadernos gerados ou importados via PDF. Você pode{" "}
            <strong className="text-slate-200">renomear</strong>,{" "}
            <strong className="text-slate-200">apagar</strong> cadernos finalizados ou{" "}
            <strong className="text-slate-200">reiniciar a bateria de questões</strong> para responder
            novamente quantas vezes desejar.
          </p>
        </div>
      </section>

      {/* List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Carregando cadernos...</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">Nenhum caderno salvo no histórico</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto fcc-text">
            Gere questões inéditas no Gerador ou importe seu próprio caderno em PDF para começar.
          </p>
          <button
            onClick={onGoToGenerator}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg shadow-blue-600/25 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #4338ca)" }}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Criar meu primeiro caderno</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Total: {sessions.length} caderno(s)</span>
            <span>Toque para expandir questões ou usar as ações</span>
          </div>

          {sessions.map((sess) => {
            const isExpanded = expandedId === sess.id;
            const isEditing = editingId === sess.id;
            const isDone = sess.stats.totalAnswered >= (sess.questions?.length || sess.questionCount);
            const inProgress = sess.stats.totalAnswered > 0 && !isDone;

            return (
              <div
                key={sess.id}
                className="rounded-3xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden transition-all"
              >
                {/* Main Card row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : sess.id)}
                  className="w-full text-left p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border ${
                          sess.source === "pdf"
                            ? "text-purple-700 bg-purple-50 border-purple-200"
                            : "text-blue-700 bg-blue-50 border-blue-200"
                        }`}
                      >
                        {sess.source === "pdf" ? "PDF IMPORTADO" : "GERADO POR IA"}
                      </span>

                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        {sess.discipline}
                      </span>

                      {isDone && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          ✓ FINALIZADO
                        </span>
                      )}
                      {inProgress && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          ⏸️ EM ANDAMENTO
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(sess.createdAt)}
                      </span>
                    </div>

                    {/* Title & In-place Rename */}
                    {isEditing ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 pt-1"
                      >
                        <input
                          type="text"
                          value={editTitleText}
                          onChange={(e) => setEditTitleText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(sess.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          className="px-3 py-1.5 rounded-xl border-2 border-blue-500 bg-white text-slate-900 text-sm font-bold focus:outline-none w-full max-w-md shadow-xs"
                        />
                        <button
                          onClick={() => handleSaveRename(sess.id)}
                          disabled={isRenaming}
                          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                          title="Salvar novo título"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                          {sess.theme}
                        </h3>
                        <button
                          onClick={(e) => handleStartRename(sess, e)}
                          className="text-slate-400 hover:text-blue-600 p-1 rounded-lg hover:bg-slate-100 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                          title="Renomear caderno"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Metrics row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                      <span>
                        <strong className="text-slate-800">
                          {sess.questions?.length || sess.questionCount}
                        </strong>{" "}
                        questões
                      </span>
                      <span>•</span>
                      <span>
                        Respondidas:{" "}
                        <strong className="text-slate-800">
                          {sess.stats.totalAnswered}
                        </strong>
                      </span>
                      {sess.stats.totalAnswered > 0 && (
                        <>
                          <span>•</span>
                          <span className="font-extrabold text-emerald-700">
                            {sess.stats.totalCorrect}/{sess.stats.totalAnswered} acertos (
                            {sess.stats.accuracy}%)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Buttons on right */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 shrink-0 flex-wrap pt-2 md:pt-0"
                  >
                    {/* Resume / Restart Battery CTA */}
                    {onStartSimulado && (
                      <button
                        onClick={(e) => handleResumeSimulado(sess, e)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                        title="Responder questões no simulado interativo"
                      >
                        <Play className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isDone ? "Ver / Resolver" : "Continuar Prova"}</span>
                      </button>
                    )}

                    {/* Restart clean attempt */}
                    <button
                      onClick={(e) => handleRestartSession(sess, e)}
                      disabled={restartingId === sess.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      title="Reiniciar bateria de questões (zerar respostas anteriores para refazer)"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Reiniciar Bateria</span>
                    </button>

                    {/* Rename Button */}
                    <button
                      onClick={(e) => handleStartRename(sess, e)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Renomear caderno"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeletingId(sess.id)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Apagar caderno"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Expand/Collapse */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : sess.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title={isExpanded ? "Recolher" : "Expandir questões"}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded questions list */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-6 space-y-4 border-t border-slate-100 pt-4 fcc-fade-in bg-slate-50/40">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Bateria de Questões ({sess.questions?.length} itens):</span>
                      {onStartSimulado && (
                        <button
                          onClick={(e) => handleResumeSimulado(sess, e)}
                          className="text-blue-700 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>Abrir no Simulado Interativo</span>
                        </button>
                      )}
                    </div>

                    {sess.questions?.map((q, idx) => (
                      <div
                        key={q.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-[11px] text-white bg-slate-900 px-2.5 py-1 rounded-lg">
                            QUESTÃO {idx + 1}
                          </span>
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                            GABARITO: ({q.correctOption})
                          </span>
                        </div>

                        <p className="fcc-text text-[13px] text-slate-800 whitespace-pre-line font-serif">
                          {q.statement}
                        </p>

                        <div className="space-y-1.5">
                          {optionLetters.map((l) => (
                            <div
                              key={l}
                              className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-xs ${
                                l === q.correctOption
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-semibold"
                                  : "border-slate-200 bg-slate-50/50 text-slate-600"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                  l === q.correctOption
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {l}
                              </span>
                              <span className="fcc-text flex-1">{q.options[l]}</span>
                            </div>
                          ))}
                        </div>

                        {q.directFoundation && (
                          <div className="rounded-xl bg-slate-50 border border-emerald-200 p-3 space-y-1">
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-900">
                              <Quote className="w-3.5 h-3.5 text-emerald-600" />
                              Fundamento / Resolução
                            </span>
                            <p className="fcc-text text-[11px] font-mono text-slate-700 whitespace-pre-line">
                              {q.directFoundation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Apagar Caderno?</h3>
                <p className="text-xs text-slate-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 fcc-text">
              Todas as questões, respostas e registros deste caderno serão removidos do sistema.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteSession(deletingId)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isDeleting ? "Apagando..." : "Sim, Apagar Caderno"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
