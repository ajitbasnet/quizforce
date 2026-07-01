-- QuizForge Row Level Security policies
-- Run in the Supabase SQL editor after creating quizzes and attempts tables.
-- Requires auth.users; local-only mode does not use these tables.

ALTER TABLE IF EXISTS public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attempts ENABLE ROW LEVEL SECURITY;

-- Quizzes: users can only access their own rows
DROP POLICY IF EXISTS quizzes_select_own ON public.quizzes;
CREATE POLICY quizzes_select_own ON public.quizzes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS quizzes_insert_own ON public.quizzes;
CREATE POLICY quizzes_insert_own ON public.quizzes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS quizzes_update_own ON public.quizzes;
CREATE POLICY quizzes_update_own ON public.quizzes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS quizzes_delete_own ON public.quizzes;
CREATE POLICY quizzes_delete_own ON public.quizzes
  FOR DELETE USING (auth.uid() = user_id);

-- Attempts: users can only access their own rows
DROP POLICY IF EXISTS attempts_select_own ON public.attempts;
CREATE POLICY attempts_select_own ON public.attempts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS attempts_insert_own ON public.attempts;
CREATE POLICY attempts_insert_own ON public.attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS attempts_update_own ON public.attempts;
CREATE POLICY attempts_update_own ON public.attempts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS attempts_delete_own ON public.attempts;
CREATE POLICY attempts_delete_own ON public.attempts
  FOR DELETE USING (auth.uid() = user_id);
