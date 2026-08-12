-- Persistent history for the Kimi AI chat (/ai-chat). Only signed-in tourists get their
-- conversation saved -- anonymous chat keeps working (see /api/v1/ai/chat) but nothing is
-- written for them, since there's no user_id to attach the rows to.
CREATE TYPE public.chat_message_role AS ENUM ('user', 'assistant');

CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.chat_message_role NOT NULL,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Strict data isolation policies
CREATE POLICY "Users can view their own chat history"
ON public.ai_chat_messages FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
ON public.ai_chat_messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_date ON public.ai_chat_messages (user_id, created_at ASC);
