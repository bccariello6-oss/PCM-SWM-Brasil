-- ####################################################################
-- # PCM SWM BRASIL - Database Schema                                 #
-- # Tabelas necessárias para o sistema de PCM                        #
-- ####################################################################

-- 1. Tabela de Atividades (Cronograma)
CREATE TABLE IF NOT EXISTS public.atividades (
    id TEXT PRIMARY KEY,
    descrição TEXT,
    data_inicial TEXT,
    data_final TEXT,
    duração NUMERIC DEFAULT 0,
    responsabilidade TEXT,
    caminho_crítico BOOLEAN DEFAULT FALSE,
    criticidade TEXT,
    categoria TEXT,
    os TEXT,
    recurso TEXT,
    progresso_percentual NUMERIC DEFAULT 0,
    peso NUMERIC DEFAULT 0,
    status_calculado TEXT,
    atraso_calculado NUMERIC DEFAULT 0,
    última_atualização TIMESTAMP WITH TIME ZONE,
    é_extra BOOLEAN DEFAULT FALSE,
    está_cancelada BOOLEAN DEFAULT FALSE,
    ordem_importação NUMERIC
);

-- 2. Tabela de Usuários
CREATE TABLE IF NOT EXISTS public."Usuários" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_usuário TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    função TEXT DEFAULT 'USER',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Logs de Progresso
CREATE TABLE IF NOT EXISTS public.progresso_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atividade_id TEXT NOT NULL,
    progresso_percentual NUMERIC NOT NULL,
    comentário TEXT,
    usuário_id UUID NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Habilitar RLS
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Usuários" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_logs ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS (acesso público para leitura/escrita)
DROP POLICY IF EXISTS "Allow public select atividades" ON public.atividades;
DROP POLICY IF EXISTS "Allow public insert atividades" ON public.atividades;
DROP POLICY IF EXISTS "Allow public update atividades" ON public.atividades;
DROP POLICY IF EXISTS "Allow public delete atividades" ON public.atividades;

DROP POLICY IF EXISTS "Allow public select users" ON public."Usuários";
DROP POLICY IF EXISTS "Allow public insert users" ON public."Usuários";
DROP POLICY IF EXISTS "Allow public select progress" ON public.progresso_logs;
DROP POLICY IF EXISTS "Allow public insert progress" ON public.progresso_logs;

CREATE POLICY "Allow public select atividades" ON public.atividades FOR SELECT USING (true);
CREATE POLICY "Allow public insert atividades" ON public.atividades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update atividades" ON public.atividades FOR UPDATE USING (true);
CREATE POLICY "Allow public delete atividades" ON public.atividades FOR DELETE USING (true);

CREATE POLICY "Allow public select users" ON public."Usuários" FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON public."Usuários" FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select progress" ON public.progresso_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert progress" ON public.progresso_logs FOR INSERT WITH CHECK (true);

-- 6. Inserir usuário admin padrão (ALTERAR SENHA EM PRODUÇÃO)
INSERT INTO public."Usuários" (nome_usuário, senha, função)
VALUES ('admin', 'pcm2024', 'ADMIN')
ON CONFLICT (nome_usuário) DO NOTHING;
