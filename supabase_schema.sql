-- Create maintenance_orders table
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

-- Create log_entries table
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

-- Enable Row Level Security (RLS)
ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for production)
CREATE POLICY "Enable read access for all users" ON public.maintenance_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.maintenance_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.maintenance_orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.maintenance_orders FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.log_entries FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.log_entries FOR INSERT WITH CHECK (true);
