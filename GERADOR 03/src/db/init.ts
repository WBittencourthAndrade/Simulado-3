import { pool } from "./index";

export async function ensureDbInitialized() {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          theme TEXT NOT NULL,
          discipline TEXT NOT NULL DEFAULT 'Geral',
          target_exam TEXT NOT NULL DEFAULT 'FCC Nível Médio',
          question_count INTEGER NOT NULL DEFAULT 3,
          incidence_level TEXT NOT NULL DEFAULT 'Alta',
          ray_x_data JSONB NOT NULL,
          raw_response TEXT,
          source TEXT NOT NULL DEFAULT 'ia',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        ALTER TABLE sessions ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'ia';

        CREATE TABLE IF NOT EXISTS questions (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
          order_index INTEGER NOT NULL DEFAULT 1,
          discipline TEXT NOT NULL DEFAULT 'Geral',
          theme TEXT NOT NULL,
          statement TEXT NOT NULL,
          options JSONB NOT NULL,
          correct_option TEXT NOT NULL,
          direct_foundation TEXT NOT NULL,
          distractor_analysis JSONB NOT NULL,
          fcc_trap_type TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS user_answers (
          id SERIAL PRIMARY KEY,
          question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
          selected_option TEXT NOT NULL,
          is_correct BOOLEAN NOT NULL,
          time_spent_seconds INTEGER DEFAULT 0,
          notes TEXT,
          answered_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS study_notes (
          id SERIAL PRIMARY KEY,
          theme TEXT NOT NULL,
          discipline TEXT NOT NULL,
          content TEXT NOT NULL,
          trap_summary TEXT,
          is_favorite BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error ensuring DB initialization:", err);
  }
}
