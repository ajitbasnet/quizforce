// Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
//
// SQL schema (run in Supabase SQL editor):
//
// -- users
// --   id uuid primary key references auth.users(id) on delete cascade
// --   email text not null
// --   created_at timestamptz not null default now()
// --   preferences jsonb not null default '{}'::jsonb
//
// -- quizzes
// --   id uuid primary key default gen_random_uuid()
// --   user_id uuid not null references users(id) on delete cascade
// --   title text not null
// --   description text not null default ''
// --   source_type text not null check (source_type in ('text','pdf','prompt','url'))
// --   source_content text not null default ''
// --   settings jsonb not null default '{}'::jsonb
// --   questions jsonb not null default '[]'::jsonb
// --   created_at timestamptz not null default now()
//
// -- attempts
// --   id uuid primary key default gen_random_uuid()
// --   quiz_id uuid not null references quizzes(id) on delete cascade
// --   user_id uuid not null references users(id) on delete cascade
// --   answers jsonb not null default '{}'::jsonb
// --   score integer not null default 0
// --   total_points integer not null default 0
// --   percentage numeric(5,2) not null default 0
// --   time_taken integer not null default 0
// --   completed_at timestamptz not null default now()
// --   feedback jsonb not null default '[]'::jsonb
//
// Add RLS policies and indexes (user_id, quiz_id, created_at desc) when auth is wired up.

import {
  createClient,
  type PostgrestError,
  type SupabaseClient,
} from '@supabase/supabase-js'
import type {
  AnswerFeedback,
  Quiz,
  QuizAttempt,
  QuizQuestion,
  QuizSettings,
  SupportedLanguage,
} from '../types/quiz'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          preferences: Json
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          preferences?: Json
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          preferences?: Json
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          source_type: string
          source_content: string
          settings: Json
          questions: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          source_type: string
          source_content?: string
          settings?: Json
          questions?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          source_type?: string
          source_content?: string
          settings?: Json
          questions?: Json
          created_at?: string
        }
        Relationships: []
      }
      attempts: {
        Row: {
          id: string
          quiz_id: string
          user_id: string
          answers: Json
          score: number
          total_points: number
          percentage: number
          time_taken: number
          completed_at: string
          feedback: Json
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id: string
          answers?: Json
          score?: number
          total_points?: number
          percentage?: number
          time_taken?: number
          completed_at?: string
          feedback?: Json
        }
        Update: {
          id?: string
          quiz_id?: string
          user_id?: string
          answers?: Json
          score?: number
          total_points?: number
          percentage?: number
          time_taken?: number
          completed_at?: string
          feedback?: Json
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type QuizRow = Database['public']['Tables']['quizzes']['Row']
type QuizInsert = Database['public']['Tables']['quizzes']['Insert']
type AttemptRow = Database['public']['Tables']['attempts']['Row']
type AttemptInsert = Database['public']['Tables']['attempts']['Insert']

let client: SupabaseClient<Database> | null = null

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return false

  // Ignore placeholders and dashboard links — API URL must be *.supabase.co
  if (
    url.includes('your-project') ||
    url.includes('supabase.com/dashboard') ||
    key === 'your-anon-key'
  ) {
    return false
  }

  try {
    const { hostname, protocol } = new URL(url)
    return protocol === 'https:' && hostname.endsWith('.supabase.co')
  } catch {
    return false
  }
}

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null

  if (!client) {
    client = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    )
  }

  return client
}

function throwIfError<T>(data: T | null, error: PostgrestError | null): T {
  if (error) throw new Error(error.message)
  if (data === null) throw new Error('No data returned')
  return data
}

function quizToRow(quiz: Quiz, userId: string): QuizInsert {
  return {
    id: quiz.id,
    user_id: userId,
    title: quiz.title,
    description: quiz.description,
    source_type: quiz.sourceType,
    source_content: quiz.sourceContent,
    settings: quiz.settings as unknown as Json,
    questions: quiz.questions as unknown as Json,
    created_at: quiz.createdAt,
  }
}

function rowToQuiz(row: QuizRow): Quiz {
  const settings = row.settings as unknown as QuizSettings
  const questions = row.questions as unknown as QuizQuestion[]

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    sourceType: row.source_type as Quiz['sourceType'],
    sourceContent: row.source_content,
    settings,
    questions,
    language: settings.language as SupportedLanguage,
    totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
    createdAt: row.created_at,
  }
}

function attemptToRow(attempt: QuizAttempt, userId: string): AttemptInsert {
  return {
    id: attempt.id,
    quiz_id: attempt.quizId,
    user_id: userId,
    answers: attempt.answers as unknown as Json,
    score: attempt.score,
    total_points: attempt.totalPoints,
    percentage: attempt.percentage,
    time_taken: attempt.timeTaken,
    completed_at: attempt.completedAt,
    feedback: attempt.feedback as unknown as Json,
  }
}

function rowToAttempt(row: AttemptRow): QuizAttempt {
  return {
    id: row.id,
    quizId: row.quiz_id,
    answers: row.answers as unknown as Record<string, string>,
    score: row.score,
    totalPoints: row.total_points,
    percentage: Number(row.percentage),
    timeTaken: row.time_taken,
    completedAt: row.completed_at,
    feedback: (row.feedback as unknown as AnswerFeedback[]) ?? [],
  }
}

export async function saveQuiz(quiz: Quiz, userId: string): Promise<Quiz> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase
    .from('quizzes')
    .upsert(quizToRow(quiz, userId), { onConflict: 'id' })
    .select()
    .single()

  return rowToQuiz(throwIfError(data, error))
}

export async function getQuizHistory(userId: string): Promise<Quiz[]> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToQuiz)
}

export async function saveAttempt(
  attempt: QuizAttempt,
  userId: string,
): Promise<QuizAttempt> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase
    .from('attempts')
    .upsert(attemptToRow(attempt, userId), { onConflict: 'id' })
    .select()
    .single()

  return rowToAttempt(throwIfError(data, error))
}

export async function getAttempt(id: string): Promise<QuizAttempt | null> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return rowToAttempt(data)
}

export async function fetchAttemptsForUser(
  userId: string,
): Promise<QuizAttempt[]> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToAttempt)
}

export async function deleteQuiz(
  quizId: string,
  userId: string,
): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', quizId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}
