import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mhelewhkrscejjvksmyi.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZWxld2hrcnNjZWpqdmtzbXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDI4NjcsImV4cCI6MjA4NDI3ODg2N30.BJzSspmyJlIZbQ9-jcxcMRl3MXQRNUEAZQqBgUMAtCo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const activities = [];
const progressLogs = [];

function calculateActivityStatus(activity) {
  const now = new Date();
  const end = new Date(activity.end_date);
  if (activity.percent_progress === 100) return 'Concluída';
  if (activity.is_cancelled) return 'Cancelada';
  if (now > end && activity.percent_progress < 100) return 'Pendente';
  if (activity.percent_progress > 0) return 'Em Andamento';
  return 'Não Iniciada';
}

// Activities API
app.get('/api/activities', async (req, res) => {
  try {
    const { data, error } = await supabase.from('atividades').select('*').order('start_date', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error:', err.message);
    res.json(activities);
  }
});

app.post('/api/activities/import', async (req, res) => {
  try {
    const { fileData } = req.body;
    const XLSX = await import('xlsx');
    const binary = atob(fileData);
    const workbook = XLSX.read(binary, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    const mapped = data.map(row => ({
      id: row.ID || row.id,
      description: row.Descricao || row.description,
      start_date: row.Inicio || row.start_date,
      end_date: row.Fim || row.end_date,
      duration_days: row.Duracao || row.duration_days,
      responsibility: row.Responsavel || row.responsibility,
      criticality: row.Critico || row.criticality,
      category: row.Categoria || row.category,
      os: row.OS || row.os,
      resource: row.Recurso || row.resource,
      percent_progress: 0,
      is_cancelled: false,
      is_extra: false
    }));
    
    await supabase.from('atividades').delete().neq('id', '');
    const { error } = await supabase.from('atividades').insert(mapped);
    if (error) throw error;
    
    res.json({ success: true, count: mapped.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/progress', async (req, res) => {
  try {
    const { activity_id, percent, comment, user_id } = req.body;
    
    const { data: act } = await supabase.from('atividades').select('*').eq('id', activity_id).single();
    if (!act) return res.status(404).json({ error: 'Atividade não encontrada' });
    
    await supabase.from('atividades').update({ percent_progress: percent }).eq('id', activity_id);
    
    await supabase.from('progresso_logs').insert({
      activity_id,
      percent,
      comment,
      user_id,
      created_at: new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const { data: acts } = await supabase.from('atividades').select('*');
    const { data: logs } = await supabase.from('progresso_logs').select('*').order('created_at', { ascending: true });
    res.json({ activities: acts || [], logs: logs || [] });
  } catch (err) {
    res.json({ activities: [], logs: progressLogs });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { data, error } = await supabase
      .from('Usuários')
      .select('*')
      .eq('nome_usuário', username)
      .eq('senha', password)
      .single();
    
    if (error || !data) {
      return res.json({ success: false, error: 'Credenciais inválidas' });
    }
    
    res.json({ success: true, user: { id: data.id, username: data['nome_usuário'], role: data['função'] } });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));