-- ============================================
-- SCRIPT COMPLETO: Criar todas as tabelas ARGUS
-- ============================================
-- Execute tudo isto no Supabase SQL Editor

-- 1. Tabela de Perfis dos Usuários
CREATE TABLE IF NOT EXISTS argus_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan_name TEXT DEFAULT 'Gratuito',
  max_messages INTEGER DEFAULT 50,
  used_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Sessões de Conversa
CREATE TABLE IF NOT EXISTS argus_sessions (
  id TEXT PRIMARY KEY,
  profile_id UUID REFERENCES argus_profiles(id) ON DELETE CASCADE,
  title TEXT,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Mensagens
CREATE TABLE IF NOT EXISTS argus_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES argus_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Memórias (Fatos que ARGUS aprende)
CREATE TABLE IF NOT EXISTS argus_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES argus_profiles(id) ON DELETE CASCADE,
  fact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sessions_profile ON argus_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_sessions_archived ON argus_sessions(is_archived, archived_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session ON argus_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON argus_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_profile ON argus_memories(profile_id);

-- ============================================
-- VERIFICAÇÃO: Listar todas as tabelas criadas
-- ============================================

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name=t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
