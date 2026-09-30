import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  theme: text("theme").notNull(),
  discipline: text("discipline").notNull().default("Geral"),
  targetExam: text("target_exam").notNull().default("FCC Nível Médio"),
  questionCount: integer("question_count").notNull().default(3),
  incidenceLevel: text("incidence_level").notNull().default("Alta"), // Alta, Média, Baixa
  rayXData: jsonb("ray_x_data").notNull(), // { frequency, typicalPattern: { formatPreference, targetArticles }, trapMapping: [] }
  rawResponse: text("raw_response"),
  source: text("source").notNull().default("ia"), // "ia" | "pdf"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull().default(1),
  discipline: text("discipline").notNull().default("Geral"),
  theme: text("theme").notNull(),
  statement: text("statement").notNull(),
  options: jsonb("options").notNull(), // { A: "...", B: "...", C: "...", D: "...", E: "..." }
  correctOption: text("correct_option").notNull(), // "A", "B", "C", "D", "E"
  directFoundation: text("direct_foundation").notNull(), // Transcrição precisa do artigo/súmula/regra
  distractorAnalysis: jsonb("distractor_analysis").notNull(), // { A: "...", B: "...", C: "...", D: "...", E: "..." }
  fccTrapType: text("fcc_trap_type"), // Ex: "Troca de prazos", "Literalidade com inversão", "Regência capciosa"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAnswers = pgTable("user_answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id, { onDelete: "cascade" }),
  selectedOption: text("selected_option").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpentSeconds: integer("time_spent_seconds").default(0),
  notes: text("notes"),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

export const studyNotes = pgTable("study_notes", {
  id: serial("id").primaryKey(),
  theme: text("theme").notNull(),
  discipline: text("discipline").notNull(),
  content: text("content").notNull(),
  trapSummary: text("trap_summary"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
