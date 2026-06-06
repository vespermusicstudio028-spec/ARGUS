# 📋 Guia: Ativar Persistência de Históricos no ARGUS

## ✅ ETAPA 1: Executar SQL no Supabase (VOCÊ FAZ AGORA)

### Passos:
1. Abra https://app.supabase.com
2. Selecione seu projeto ARGUS
3. Vá em **SQL Editor** (lado esquerdo)
4. Clique em **"New Query"**
5. **Cole este SQL:**

```sql
ALTER TABLE IF EXISTS argus_sessions 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

ALTER TABLE IF EXISTS argus_sessions 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_sessions_archived 
ON argus_sessions(is_archived, archived_at DESC);

SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'argus_sessions' 
ORDER BY ordinal_position;
```

6. Clique em **"Run"** (Ctrl+Enter)
7. Você deve ver as colunas listadas no resultado

### ✓ Se funcionou:
- Veja `is_archived` e `archived_at` na lista de colunas
- Prossiga para próxima etapa

### ✗ Se der erro:
- Copie o erro e envie
- Pode ser que a tabela tenha outro nome

---

## 🔄 ETAPA 2: Eu atualizo o código (EU FAÇO DEPOIS)

Após confirmar que o SQL executou, vou:
1. Modificar `api/chat/reset.ts` para arquivar em vez de deletar
2. Modificar `src/App.tsx` para filtrar sessões arquivadas
3. Fazer deploy automático

---

## 🧪 ETAPA 3: Testar (VOCÊ VALIDA)

Depois do deploy:
1. Abra https://argus-one-kappa.vercel.app
2. Envie algumas mensagens
3. Clique em "Limpar Sessão"
4. Verifique que histórico foi preservado

---

**Estou aqui esperando seu OK após executar o SQL! 👍**
