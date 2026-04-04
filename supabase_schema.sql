-- ####################################################################
-- # ATENÇÃO: DESATIVE O TRADUTOR DO SEU NAVEGADOR ANTES DE CONTINUAR! #
-- # WARNING: DISABLE YOUR BROWSER TRANSLATOR BEFORE CONTINUING!      #
-- ####################################################################

-- 1. Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de técnicos (English)
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    discipline TEXT,
    shift TEXT,
    is_leader BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de ordens (English)
CREATE TABLE IF NOT EXISTS public.maintenance_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_number TEXT NOT NULL,
    type TEXT NOT NULL,
    area TEXT,
    tag TEXT,
    description TEXT,
    discipline TEXT,
    priority TEXT,
    estimated_hours NUMERIC DEFAULT 0,
    operational_shutdown BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL,
    technician_id UUID REFERENCES public.technicians(id),
    collaborator_id UUID REFERENCES public.technicians(id),
    scheduled_day TEXT,
    reprogramming_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de logs (English)
CREATE TABLE IF NOT EXISTS public.log_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.maintenance_orders(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    field TEXT,
    old_value TEXT,
    new_value TEXT
);

-- 5. Tabela de perfis de usuário (English)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT,
    email TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Habilitar RLS
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Limpar e recriar políticas idempotentes
DO $$ 
BEGIN
    -- Technicians
    DROP POLICY IF EXISTS "Allow public select technicians" ON public.technicians;
    DROP POLICY IF EXISTS "Allow public insert technicians" ON public.technicians;
    -- Orders
    DROP POLICY IF EXISTS "Allow public select" ON public.maintenance_orders;
    DROP POLICY IF EXISTS "Allow public insert" ON public.maintenance_orders;
    DROP POLICY IF EXISTS "Allow public update" ON public.maintenance_orders;
    DROP POLICY IF EXISTS "Allow public delete" ON public.maintenance_orders;
    -- Logs
    DROP POLICY IF EXISTS "Allow public select logs" ON public.log_entries;
    DROP POLICY IF EXISTS "Allow public insert logs" ON public.log_entries;
    -- Profiles
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
END $$;

-- 7. Criar políticas
CREATE POLICY "Allow public select technicians" ON public.technicians FOR SELECT USING (true);
CREATE POLICY "Allow public insert technicians" ON public.technicians FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select" ON public.maintenance_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.maintenance_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.maintenance_orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.maintenance_orders FOR DELETE USING (true);

CREATE POLICY "Allow public select logs" ON public.log_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert logs" ON public.log_entries FOR INSERT WITH CHECK (true);

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
