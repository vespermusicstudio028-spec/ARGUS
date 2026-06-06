-- ============================================
-- SETUP: Persistência Permanente de Históricos
-- ============================================
-- Execute este SQL no Supabase Console (SQL Editor)
-- Acesse: https://app.supabase.com → Seu Projeto → SQL Editor

-- Passo 1: Adicionar coluna para marcar sessões arquivadas
ALTER TABLE IF EXISTS argus_sessions 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Passo 2: Adicionar timestamp de arquivamento
ALTER TABLE IF EXISTS argus_sessions 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Passo 3: Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_sessions_archived 
ON argus_sessions(is_archived, archived_at DESC);

-- Verificação: Confirmar que as colunas foram criadas
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'argus_sessions' 
ORDER BY ordinal_position;
