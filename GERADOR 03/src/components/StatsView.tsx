"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BookOpen,
  Sparkles,
  BarChart3,
} from "lucide-react";

interface StatsData {
  totalGeneratedSessions: number;
  pdfSessions: number;
  totalGeneratedQuestions: number;
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  overallAccuracy: number;
  disciplineStats: Record<string, { total: number; correct: number; accuracy: number }>;
  trapStats: Record<string, { total: number; wrongCount: number }>;
}

interface StatsViewProps {
  onGoToGenerator: () => void;
}

export function StatsView({ onGoToGenerator }: StatsViewProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/fcc/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Compilando métricas de rendimento FCC...
      </div>
    );
  }

  const overallAccuracy = stats?.overallAccuracy || 0;
  const totalAnswered = stats?.totalAnswered || 0;
  const totalCorrect = stats?.totalCorrect || 0;
  const totalIncorrect = stats?.totalIncorrect || 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Métricas & Curva de Rendimento</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Painel de Desempenho no Padrão FCC Nível Médio
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Acompanhe seu percentual de acertos por disciplina, volume de questões inéditas resolvidas
            e identifique em quais pegadinhas da banca você ainda tem vulnerabilidade.
          </p>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Taxa Geral de Acertos
            </span>
            <div className={`p-2 rounded-xl ${overallAccuracy >= 75 ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {overallAccuracy}%
          </div>
          <p className="text-xs text-slate-500">
            {overallAccuracy >= 80 ? "Nível competitivo para Tribunais" : "Meta recomendada: 80%+"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Questões Resolvidas
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {totalAnswered}
          </div>
          <p className="text-xs text-slate-500">
            {totalCorrect} acertos / {totalIncorrect} erros
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sessões Analisadas
            </span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {stats?.totalGeneratedSessions || 0}
          </div>
          <p className="text-xs text-slate-500">
            {stats?.totalGeneratedQuestions || 0} questões no total
          </p>
          <p className="text-[11px] font-bold text-purple-700">
            {stats?.pdfSessions || 0} caderno(s) PDF importado(s)
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Estado de Prontidão
            </span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900">
            {totalAnswered === 0
              ? "Sem Dados"
              : overallAccuracy >= 80
              ? "Pronto para Prova"
              : overallAccuracy >= 60
              ? "Evolução Positiva"
              : "Foco em Revisão"}
          </div>
          <p className="text-xs text-slate-500">
            Calibrado com notas de corte FCC
          </p>
        </div>
      </div>

      {/* Discipline Breakdown */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              Aproveitamento por Disciplina (FCC Nível Médio)
            </h2>
            <p className="text-xs text-slate-500">
              Rendimento calculado a partir das questões resolvidas nas 3 etapas.
            </p>
          </div>
        </div>

        {stats?.disciplineStats && Object.keys(stats.disciplineStats).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(stats.disciplineStats).map(([disciplineName, item]) => {
              const accuracy = item.accuracy;
              let barColor = "bg-blue-600";
              if (accuracy >= 80) barColor = "bg-emerald-500";
              else if (accuracy < 50) barColor = "bg-rose-500";
              else barColor = "bg-amber-500";

              return (
                <div key={disciplineName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{disciplineName}</span>
                    <span className="text-slate-600">
                      {item.correct} de {item.total} corretas ({accuracy}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(accuracy, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            Resolva questões para visualizar as estatísticas por disciplina.
          </div>
        )}
      </section>

      {/* Senior Specialist Advice Box */}
      <section className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Diagnóstico & Recomendações do Especialista Sênior FCC
            </h3>
            <p className="text-xs text-slate-300">
              Estratégia para a reta final em concursos de Técnico Judiciário
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs text-slate-200">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1.5">
            <strong className="text-blue-300 font-bold block">
              1. Atenção à Literalidade Estrita
            </strong>
            <p className="text-slate-300 leading-relaxed">
              Nas provas de Nível Médio, 75% a 85% das alternativas corretas da FCC são transcrições literais
              do texto da CF/88 ou da lei de regência, sem elaborações doutrinárias complexas.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1.5">
            <strong className="text-amber-300 font-bold block">
              2. Método de Eliminação de Distratores
            </strong>
            <p className="text-slate-300 leading-relaxed">
              Ao resolver questões de Português e Direito, risque primeiro as opções que contenham palavras
              absolutistas como &ldquo;sempre&rdquo;, &ldquo;em qualquer caso&rdquo; ou trocas como &ldquo;independe&rdquo; por &ldquo;depende&rdquo;.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1.5">
            <strong className="text-emerald-300 font-bold block">
              3. Ritmo de Prova (2m30s)
            </strong>
            <p className="text-slate-300 leading-relaxed">
              Treine respondendo as questões geradas mantendo o ritmo médio de 2 minutos e 30 segundos
              por questão, garantindo fôlego para a prova completa no dia do certame.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
