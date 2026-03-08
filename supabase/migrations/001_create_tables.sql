-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  voice text NOT NULL DEFAULT 'classic',
  title text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  turn_count integer NOT NULL DEFAULT 0,
  stage text NOT NULL DEFAULT 'opening',
  safety_flag boolean NOT NULL DEFAULT false,
  safety_type text,
  model text NOT NULL,
  prompt_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  token_count integer,
  latency_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Takeaways table
CREATE TABLE IF NOT EXISTS takeaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  format text NOT NULL,
  content text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  regenerated_from_message_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_takeaways_session_id ON takeaways(session_id);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE takeaways ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own data
CREATE POLICY "Users can manage own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own messages" ON messages
  FOR ALL USING (session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own takeaways" ON takeaways
  FOR ALL USING (session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid()));
