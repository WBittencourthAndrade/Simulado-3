"use client";

import React, { useState, useEffect } from "react";
import {
  Timer,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Flag,
  FileUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Quote,
  X,
  Pause,
  Play,
  Save,
  Edit2,
  Check,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface SavedQuestion {
  id: number;
  orderIndex: number;
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

interface SimuladoViewProps {
  questions: SavedQuestion[];
  title: string;
  sessionId?: number;
  initialAnswers?: Record<number, "A" | "B" | "C" | "D" | "E">;
  initialElapsedSeconds?: number;
  onExit: () => void;
  onAnswerSubmitted?: () => void;
  onTitleChange?: (newTitle: string) => void;
}

export function SimuladoView({
  questions,
  title: initialTitle,
  sessionId,
  initialAnswers,
  initialElapsedSeconds = 0,
  onExit,
  onAnswerSubmitted,
  onTitleChange,
}: SimuladoViewProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(initialTitle);
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, "A" | "B" | "C" | "D" | "E">
  >(initialAnswers || {});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(initialElapsedSeconds);

  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Sync title if prop updates
  useEffect(() => {
    setTitle(initialTitle);
    setTempTitle(initialTitle);
  }, [initialTitle]);

  // Load local progress if available
  useEffect(() => {
    if (!initialAnswers || Object.keys(initialAnswers).length === 0) {
      try {
        const storageKey = `fcc_simulado_progress_${sessionId || initialTitle}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.selectedAnswers) setSelectedAnswers(parsed.selectedAnswers);
          if (typeof parsed.secondsElapsed === "number") setSecondsElapsed(parsed.secondsElapsed);
          if (typeof parsed.currentIdx === "number") setCurrentIdx(parsed.currentIdx);
          if (parsed.flaggedQuestions) setFlaggedQuestions(parsed.flaggedQuestions);
        }
      } catch {
        /* ignore */
      }
    }
  }, [sessionId, initialTitle, initialAnswers]);

  // Save progress locally on state changes
  useEffect(() => {
    if (!isFinished && questions.length > 0) {
      try {
        const storageKey = `fcc_simulado_progress_${sessionId || title}`;
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            selectedAnswers,
            secondsElapsed,
            currentIdx,
            flaggedQuestions,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {
        /* ignore */
      }
    }
  }, [selectedAnswers, secondsElapsed, currentIdx, flaggedQuestions, isFinished, sessionId, title, questions.length]);

  // Timer: runs only when NOT finished and NOT paused
  useEffect(() => {
    if (isFinished || isPaused || questions.length === 0) return;
    const int = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(int);
  }, [isFinished, isPaused, questions.length]);

  const formatTimer = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSelectAnswer = async (
    qIndex: number,
    letter: "A" | "B" | "C" | "D" | "E"
  ) => {
    if (isFinished || isPaused || selectedAnswers[qIndex] || submittingAnswer) return;

    const q = questions[qIndex];
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: letter }));
    // Automatically open explanation/gabarito upon answering
    setShowExplanation((prev) => ({ ...prev, [qIndex]: true }));

    const isCorrect = letter === q.correctOption;
    if (isCorrect) {
      confetti({ particleCount: 55, spread: 65, origin: { y: 0.8 } });
    }

    // Persist answer immediately so Desempenho / Histórico / Erros update live
    setSubmittingAnswer(true);
    try {
      const res = await fetch("/api/fcc/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: q.id,
          selectedOption: letter,
          timeSpentSeconds: Math.round(secondsElapsed / Math.max(questions.length, 1)),
        }),
      });
      if (res.ok && onAnswerSubmitted) onAnswerSubmitted();
    } catch (err) {
      console.error("Erro ao salvar resposta:", err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const toggleFlag = (qIndex: number) =>
    setFlaggedQuestions((prev) => ({ ...prev, [qIndex]: !prev[qIndex] }));

  const handleFinish = () => {
    if (isFinished) return;
    setIsFinished(true);
    setIsPaused(false);
    // Clear in-progress local storage
    try {
      const storageKey = `fcc_simulado_progress_${sessionId || title}`;
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    if (onAnswerSubmitted) onAnswerSubmitted();
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleSaveAndExit = () => {
    setIsPaused(false);
    onExit();
  };

  const handleRestartSimulado = async () => {
    if (isRestarting) return;
    setIsRestarting(true);

    try {
      if (sessionId) {
        // Clear previous answers on server for a fresh run
        await fetch(`/api/fcc/session/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "restart" }),
        });
      }

      // Clear local progress
      try {
        const storageKey = `fcc_simulado_progress_${sessionId || title}`;
        localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }

      setSelectedAnswers({});
      setFlaggedQuestions({});
      setShowExplanation({});
      setIsFinished(false);
      setIsPaused(false);
      setCurrentIdx(0);
      setSecondsElapsed(0);

      if (onAnswerSubmitted) onAnswerSubmitted();
    } catch (err) {
      console.error("Erro ao reiniciar bateria:", err);
    } finally {
      setIsRestarting(false);
    }
  };

  const handleSaveRename = async () => {
    if (!tempTitle.trim() || tempTitle === title) {
      setIsEditingTitle(false);
      return;
    }

    setIsSavingTitle(true);
    try {
      if (sessionId) {
        const res = await fetch(`/api/fcc/session/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newTitle: tempTitle.trim() }),
        });
        if (res.ok) {
          setTitle(tempTitle.trim());
          if (onTitleChange) onTitleChange(tempTitle.trim());
        }
      } else {
        setTitle(tempTitle.trim());
        if (onTitleChange) onTitleChange(tempTitle.trim());
      }
    } catch (err) {
      console.error("Erro ao renomear caderno:", err);
    } finally {
      setIsSavingTitle(false);
      setIsEditingTitle(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm text-slate-500">Nenhuma questão no simulado.</p>
        <button
          onClick={onExit}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
        >
          Voltar
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const optionLetters: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];
  const totalAnswered = Object.keys(selectedAnswers).length;

  let correctTotal = 0;
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctOption) correctTotal += 1;
  });
  const scorePercent = Math.round((correctTotal / questions.length) * 100);

  const distractorMap = currentQ.distractorAnalysis || {};

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-16 fcc-fade-in relative">
      {/* Simulado Top Control Bar */}
      <div className="rounded-3xl bg-slate-950 text-white p-4 sm:p-5 shadow-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Title area (editable) */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl shrink-0">
            <FileUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-indigo-300">
              Simulado Interativo • Caderno
            </span>

            {isEditingTitle ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveRename();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  autoFocus
                  className="bg-slate-900 border border-indigo-400 text-white text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 w-full max-w-md"
                />
                <button
                  onClick={handleSaveRename}
                  disabled={isSavingTitle}
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                  title="Salvar novo título"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-sm sm:text-base font-black truncate">{title}</h2>
                <button
                  onClick={() => {
                    setTempTitle(title);
                    setIsEditingTitle(true);
                  }}
                  className="opacity-60 group-hover:opacity-100 hover:text-amber-300 transition-opacity p-1 rounded cursor-pointer"
                  title="Renomear caderno"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Timer & Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Timer with Pause Button */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl">
            <Timer
              className={`w-4.5 h-4.5 ${
                isPaused ? "text-amber-400" : "text-amber-300 animate-pulse"
              }`}
            />
            <span className="text-base sm:text-lg font-mono font-black tracking-wider">
              {formatTimer(secondsElapsed)}
            </span>

            {!isFinished && (
              <button
                onClick={isPaused ? handleResume : handlePause}
                className="ml-1 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isPaused ? "Continuar Simulado" : "Pausar Simulado"}
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
              </button>
            )}
          </div>

          <span className="hidden sm:block text-[11px] text-slate-400">
            {totalAnswered}/{questions.length} respondidas
          </span>

          {!isFinished ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePause}
                className="hidden xs:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer border border-slate-700"
              >
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pausar</span>
              </button>
              <button
                onClick={handleFinish}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Finalizar Prova
              </button>
            </div>
          ) : (
            <button
              onClick={onExit}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-sm"
            >
              Concluir e Voltar
            </button>
          )}
        </div>
      </div>

      {/* Bubble sheet (Interactive Navigator) */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-lg shadow-slate-200/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Folha de respostas:
          </span>
          <span className="text-[11px] text-slate-400 font-semibold">
            ({totalAnswered} de {questions.length} respondidas)
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, idx) => {
            const isCurrent = currentIdx === idx;
            const isAnswered = selectedAnswers[idx] !== undefined;
            const isCorrect = isFinished && selectedAnswers[idx] === q.correctOption;
            const isWrong =
              isFinished && isAnswered && selectedAnswers[idx] !== q.correctOption;
            const flagged = !!flaggedQuestions[idx];

            let cls = "bg-slate-100 text-slate-600 border-slate-200";
            if (isFinished) {
              cls = isCorrect
                ? "bg-emerald-600 text-white border-emerald-700"
                : isWrong
                ? "bg-rose-600 text-white border-rose-700"
                : "bg-slate-200 text-slate-400 border-slate-300";
            } else if (isCurrent) {
              cls = "bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300";
            } else if (isAnswered) {
              cls = "bg-blue-100 text-blue-900 border-blue-300 font-bold";
            }

            return (
              <button
                key={q.id}
                onClick={() => {
                  if (isPaused) setIsPaused(false);
                  setCurrentIdx(idx);
                }}
                className={`w-8 h-8 rounded-lg border text-[11px] font-bold flex items-center justify-center relative transition-all cursor-pointer ${cls}`}
              >
                {idx + 1}
                {flagged && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* PAUSE OVERLAY / BANNER */}
      {isPaused && (
        <div className="rounded-3xl bg-slate-900 border-2 border-amber-400 text-white p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Pause className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Progresso Preservado
                </span>
                <h3 className="text-xl font-black text-white">Simulado Pausado</h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Tempo pausado em</span>
              <span className="text-2xl font-mono font-black text-amber-300">
                {formatTimer(secondsElapsed)}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 fcc-text">
            Seu tempo foi pausado e todo o seu progresso (<strong>{totalAnswered}</strong> de{" "}
            <strong>{questions.length}</strong> questões respondidas) está salvo com segurança. Você
            pode continuar agora mesmo ou sair e retomar mais tarde a partir do Histórico.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleResume}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Continuar Simulado</span>
            </button>

            <button
              onClick={handleSaveAndExit}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-blue-400" />
              <span>Salvar e Sair (Continuar Depois)</span>
            </button>
          </div>
        </div>
      )}

      {/* Finished summary & Restart Battery action */}
      {isFinished && (
        <div className="rounded-3xl bg-slate-950 text-white p-5 sm:p-7 border border-slate-800 shadow-2xl space-y-4 fcc-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  scorePercent >= 70 ? "bg-emerald-600" : "bg-amber-600"
                }`}
              >
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-blue-300">
                  Resultado do Simulado
                </span>
                <h3 className="text-lg font-black">
                  {scorePercent >= 70
                    ? "Excelente aproveitamento!"
                    : "Bom treino! Revise os motivos dos erros."}
                </h3>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-emerald-400">{scorePercent}%</div>
              <div className="text-[11px] text-slate-300">
                {correctTotal} de {questions.length} questões acertadas
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <span className="block text-slate-500 text-[10px] font-bold uppercase">
                Tempo total
              </span>
              <span className="font-mono font-black text-white text-base">
                {formatTimer(secondsElapsed)}
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <span className="block text-slate-500 text-[10px] font-bold uppercase">
                Média por questão
              </span>
              <span className="font-mono font-black text-white text-base">
                {Math.round(secondsElapsed / Math.max(questions.length, 1))}s
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <span className="block text-slate-500 text-[10px] font-bold uppercase">
                Registro
              </span>
              <span className="font-bold text-emerald-400 text-sm">
                Salvo em Desempenho & Histórico
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={handleRestartSimulado}
              disabled={isRestarting}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isRestarting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              <span>Reiniciar Bateria de Questões (Responder Novamente)</span>
            </button>

            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Concluir e Voltar</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Question card */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Card header */}
        <div className="bg-slate-50/90 border-b border-slate-200 px-4 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-black text-[11px] text-white bg-slate-900 px-2.5 py-1 rounded-lg shrink-0">
              QUESTÃO {currentIdx + 1}
            </span>
            <span className="text-[11px] font-bold text-slate-600 truncate">
              {currentQ.discipline}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleFlag(currentIdx)}
              className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                flaggedQuestions[currentIdx]
                  ? "bg-amber-100 border-amber-300 text-amber-800"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {flaggedQuestions[currentIdx] ? "Marcada" : "Marcar"}
              </span>
            </button>
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
              title="Sair do simulado"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-7 space-y-5">
          {/* Statement */}
          <div className="fcc-text text-slate-900 whitespace-pre-line font-serif">
            {currentQ.statement}
          </div>

          {/* Options */}
          <div className="space-y-2.5 pt-1">
            {optionLetters.map((letter) => {
              const optionText = currentQ.options[letter];
              const isSelected = selectedAnswers[currentIdx] === letter;
              const isCorrect = letter === currentQ.correctOption;

              let style = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";
              if (isFinished || selectedAnswers[currentIdx]) {
                if (isCorrect) {
                  style =
                    "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium ring-1 ring-emerald-500";
                } else if (isSelected && !isCorrect) {
                  style =
                    "border-rose-400 bg-rose-50/80 text-rose-950 font-medium ring-1 ring-rose-400";
                } else {
                  style = "border-slate-200 bg-slate-50/50 text-slate-400";
                }
              }

              return (
                <div
                  key={letter}
                  onClick={() => handleSelectAnswer(currentIdx, letter)}
                  className={`group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border text-sm transition-all cursor-pointer ${style}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 transition-colors ${
                      isFinished || selectedAnswers[currentIdx]
                        ? isCorrect
                          ? "bg-emerald-600 text-white"
                          : isSelected
                          ? "bg-rose-600 text-white"
                          : "bg-slate-200 text-slate-600"
                        : "bg-slate-100 group-hover:bg-blue-100 text-slate-700 group-hover:text-blue-700"
                    }`}
                  >
                    {letter}
                  </div>
                  <div className="flex-1 leading-relaxed fcc-text min-w-0">{optionText}</div>
                  {(isFinished || selectedAnswers[currentIdx]) && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {(isFinished || selectedAnswers[currentIdx]) &&
                    isSelected &&
                    !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Feedback & nav */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              {!selectedAnswers[currentIdx] ? (
                <span>Toque na alternativa para responder e ver os motivos dos erros.</span>
              ) : (
                <span
                  className={`font-extrabold ${
                    selectedAnswers[currentIdx] === currentQ.correctOption
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {selectedAnswers[currentIdx] === currentQ.correctOption
                    ? "✓ Correto! Veja a fundamentação e análise abaixo."
                    : `✕ Você marcou (${selectedAnswers[currentIdx]}) — o gabarito oficial é (${currentQ.correctOption}). Veja os motivos dos erros:`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIdx((p) => Math.max(p - 1, 0))}
                disabled={currentIdx === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                onClick={() =>
                  setCurrentIdx((p) => Math.min(p + 1, questions.length - 1))
                }
                disabled={currentIdx === questions.length - 1}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Próxima</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ETAPA 3: GABARITO COMENTADO & MOTIVOS DOS ERROS DE CADA ALTERNATIVA */}
          {selectedAnswers[currentIdx] && (
            <div className="mt-4 pt-4 border-t-2 border-slate-200 space-y-4 bg-slate-50/80 -mx-4 sm:-mx-7 -mb-4 sm:-mb-7 p-4 sm:p-7 rounded-b-3xl fcc-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Etapa 3 • Gabarito Comentado & Engenharia de Distratores
                  </span>
                </div>

                <span className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-lg">
                  Gabarito Oficial: Letra ({currentQ.correctOption})
                </span>
              </div>

              {/* Fundamento Direto */}
              {currentQ.directFoundation && (
                <div className="rounded-2xl bg-white border border-emerald-200 p-4 space-y-2 shadow-2xs">
                  <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-950 uppercase tracking-wide">
                    <Quote className="w-4 h-4 text-emerald-600" />
                    Fundamento Direto / Resolução da Banca:
                  </span>
                  <blockquote className="fcc-text text-xs text-slate-900 font-mono bg-emerald-50/50 p-3 rounded-xl border-l-4 border-emerald-500 whitespace-pre-line leading-relaxed">
                    {currentQ.directFoundation}
                  </blockquote>
                </div>
              )}

              {/* Motivos dos Erros (Alternativa por Alternativa) */}
              <div className="space-y-2.5">
                <span className="block text-[11px] font-extrabold text-slate-900">
                  Motivo do Acerto e Análise dos Erros em cada Alternativa:
                </span>

                <div className="space-y-2">
                  {optionLetters.map((optLetter) => {
                    const isTheCorrectOne = optLetter === currentQ.correctOption;
                    const errorNote =
                      distractorMap[optLetter] ||
                      (isTheCorrectOne
                        ? "Alternativa CORRETA conforme a legislação e o gabarito oficial do concurso."
                        : "Alternativa INCORRETA segundo o gabarito oficial da banca examinadora.");

                    return (
                      <div
                        key={optLetter}
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                          isTheCorrectOne
                            ? "bg-emerald-50 border-emerald-200 text-emerald-950 font-medium"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`font-black px-2 py-0.5 rounded text-[11px] shrink-0 ${
                              isTheCorrectOne
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            ({optLetter})
                          </span>
                          <div className="fcc-text">
                            <span className="font-bold mr-1">
                              {isTheCorrectOne ? "CORRETA." : "INCORRETA."}
                            </span>
                            <span>{errorNote}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Sair do Simulado?</h3>
                <p className="text-xs text-slate-500">Seu progresso atual foi salvo.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 fcc-text">
              Você respondeu <strong>{totalAnswered}</strong> de <strong>{questions.length}</strong>{" "}
              questões. Você pode continuar agora ou voltar pelo Histórico mais tarde.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Continuar Respondendo
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
