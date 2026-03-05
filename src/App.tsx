import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Upload,
  User as UserIcon,
  LogOut,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  TrendingUp,
  FileSpreadsheet,
  Camera,
  Trash2,
  Wrench,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Layers,
  Edit2,
  XCircle,
  ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LabelList
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Activity, User, ProgressLog, calculateActivityStatus, calculateDelay, calculateExpectedProgress } from './types';
import { generateSCurveData } from './utils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'OPERATIONAL' | 'MANAGEMENT' | 'IMPORT'>('OPERATIONAL');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterResponsibility, setFilterResponsibility] = useState<string>('ALL');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [updatePercent, setUpdatePercent] = useState(0);
  const [updateComment, setUpdateComment] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkPercent, setBulkPercent] = useState<number>(0);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [extraOrder, setExtraOrder] = useState({
    id: '',
    description: '',
    start_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    responsibility: '',
    category: 'EXTRA',
    os: '',
    resource: ''
  });

  const [activityToCancel, setActivityToCancel] = useState<Activity | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/activities?role=${user?.role}&username=${user?.username}`);
      const data = await res.json();
      setActivities(data);

      const dashRes = await fetch('/api/dashboard');
      const dashData = await dashRes.json();
      setLogs(dashData.logs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isSupabaseConfigured) {
      alert("ERRO VERCEL: As variáveis VITE_SUPABASE... não foram injetadas no projeto! Como você as adicionou recentemente no painel, por favor, vá na aba 'Deployments' da Vercel, clique nos 3 pontinhos do deploy mais recente e escolha 'Redeploy' (desmarcando 'Use Existing Build Cache') para que o sistema reconheça as novas senhas.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Usuários')
        .select('*')
        .eq('nome_usuário', loginUsername)
        .eq('senha', loginPassword)
        .single();

      if (error) {
        console.error('Database error:', error);
        alert(`Erro ao verificar credenciais: ${error.message} - Verifique se a tabela 'Usuários' existe e permite acesso.`);
        return;
      }

      if (data) {
        const loggedUser = {
          id: data.id,
          username: data['nome_usuário'],
          role: data['função']
        };
        setUser(loggedUser as any); // Cast as any to bypass exact User type constraints just in case
        if (loggedUser.role === 'ADMIN') setView('MANAGEMENT');
      } else {
        alert('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Erro inesperado ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(10);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setImportProgress(30);
        const arrayBuffer = evt.target?.result as ArrayBuffer;

        // Robust way to convert ArrayBuffer to Base64
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, uint8Array.subarray(i, i + chunkSize) as any);
        }
        const b64 = btoa(binary);

        setImportProgress(60);
        const res = await fetch('/api/activities/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileData: b64 })
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Erro na importação');

        setImportProgress(100);
        setTimeout(() => {
          fetchData();
          setIsImporting(false);
          setView('MANAGEMENT');
          setImportProgress(0);
        }, 800);
      } catch (error: any) {
        console.error('Import error:', error);
        alert('Erro ao processar arquivo: ' + error.message);
        setIsImporting(false);
        setImportProgress(0);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpdateProgress = async () => {
    if (!selectedActivity || !user) return;

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: selectedActivity.id,
          percent: updatePercent,
          comment: updateComment,
          user_id: user.id
        })
      });
      setSelectedActivity(null);
      setUpdatePercent(0);
      setUpdateComment('');
      fetchData();
    } catch (error) {
      alert('Erro ao atualizar progresso');
    }
  };

  const quickUpdateProgress = async (activityId: string, percent: number) => {
    if (!user) return;

    // Optimistic update
    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, percent_progress: percent } : a));

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: activityId,
          percent: percent,
          comment: 'Atualização rápida',
          user_id: user.id
        })
      });
      // Fetch data to sync logs and S-curve
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      fetchData(); // Rollback
    }
  };

  const handleBulkUpdate = async () => {
    if (!user || selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await fetch('/api/progress/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_ids: selectedIds,
          percent: bulkPercent,
          user_id: user.id
        })
      });
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      console.error('Erro na atualização em massa:', error);
      alert('Erro ao atualizar atividades selecionadas');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleAddExtra = async () => {
    try {
      const res = await fetch('/api/activities/extra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extraOrder)
      });
      if (res.ok) {
        setShowExtraModal(false);
        setExtraOrder({
          id: '',
          description: '',
          start_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          end_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          responsibility: '',
          category: 'EXTRA',
          os: '',
          resource: ''
        });
        fetchData();
      } else {
        alert('Erro ao adicionar ordem extra. Verifique se o ID já existe.');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  const handleCancelActivity = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/activities/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_cancelled: !currentStatus })
      });
      if (res.ok) {
        fetchData();
        setActivityToCancel(null);
      }
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleResetDatabase = async () => {
    if (resetConfirmText !== 'RESETAR') {
      alert('Por favor, digite RESETAR para confirmar.');
      return;
    }

    try {
      const res = await fetch('/api/activities/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActivities([]);
        setLogs([]);
        setShowResetConfirm(false);
        setResetConfirmText('');
        alert('Base de dados resetada com sucesso.');
        setView('IMPORT');
      } else {
        alert('Erro ao resetar base de dados: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('Erro ao resetar base de dados');
    }
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        a.description.toLowerCase().includes(searchLower) ||
        a.id.toLowerCase().includes(searchLower) ||
        a.responsibility.toLowerCase().includes(searchLower) ||
        a.category.toLowerCase().includes(searchLower) ||
        (a.os && a.os.toLowerCase().includes(searchLower)) ||
        (a.resource && a.resource.toLowerCase().includes(searchLower));

      const status = calculateActivityStatus(a);
      const matchesStatus = filterStatus === 'ALL' || status === filterStatus;
      const matchesCategory = filterCategory === 'ALL' || a.category === filterCategory;
      const matchesResponsibility = filterResponsibility === 'ALL' || a.responsibility === filterResponsibility;

      return matchesSearch && matchesStatus && matchesCategory && matchesResponsibility;
    });
  }, [activities, searchTerm, filterStatus, filterCategory, filterResponsibility]);

  const groupedActivities = useMemo(() => {
    return { 'Atividades do Cronograma': filteredActivities };
  }, [filteredActivities]);

  const categories = useMemo(() => Array.from(new Set(activities.map(a => a.category))), [activities]);
  const responsibilities = useMemo(() => Array.from(new Set(activities.map(a => a.responsibility))), [activities]);

  const categoryProgress = useMemo(() => {
    return categories.map(cat => {
      const catActivities = activities.filter(a => a.category === cat && a.description?.toUpperCase() !== a.category?.toUpperCase());
      if (catActivities.length === 0) return { name: cat, progress: 0, count: 0, cancelledCount: 0 };
      const total = catActivities.reduce((sum, a) => sum + a.percent_progress, 0);
      const cancelledCount = catActivities.filter(a => a.is_cancelled).length;
      return {
        name: cat,
        progress: Math.round(total / catActivities.length),
        count: catActivities.length,
        cancelledCount
      };
    }).sort((a, b) => b.progress - a.progress);
  }, [activities, categories]);

  const sCurveData = useMemo(() => generateSCurveData(activities, logs), [activities, logs]);

  const stats = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter(a => calculateActivityStatus(a) === 'Concluída').length;
    const delayed = activities.filter(a => calculateActivityStatus(a) === 'Pendente').length;
    const cancelled = activities.filter(a => a.is_cancelled).length;
    const extras = activities.filter(a => a.is_extra).length;

    return { total, completed, delayed, cancelled, extras };
  }, [activities]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-black/5"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
              <Wrench size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">PCM MANUTENÇÃO</h1>
            <p className="text-gray-500 italic serif text-sm">Gestão de Parada Programada</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Usuário</label>
              <input
                type="text"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                placeholder="Seu usuário"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Senha</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
            >
              Entrar no Sistema
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-gray-400">
            Acesso restrito a equipes autorizadas.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-gray-900 font-sans">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-black/5 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Wrench size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg tracking-tight hidden md:block">PCM MANUTENÇÃO</h1>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest hidden md:block">
                Última Atualização: {format(new Date(), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          </div>
          <div className="h-6 w-px bg-gray-200 hidden md:block" />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user.role === 'ADMIN' && (
            <button
              onClick={() => setView('MANAGEMENT')}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                view === 'MANAGEMENT' ? "bg-black text-white" : "hover:bg-gray-100"
              )}
            >
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          <button
            onClick={() => setView('OPERATIONAL')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
              view === 'OPERATIONAL' ? "bg-black text-white" : "hover:bg-gray-100"
            )}
          >
            <ClipboardList size={16} />
            <span className="hidden sm:inline">Cronograma</span>
          </button>

          {user.role === 'ADMIN' && (
            <>
              <button
                onClick={() => setView('IMPORT')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                  view === 'IMPORT' ? "bg-black text-white" : "hover:bg-gray-100"
                )}
              >
                <Upload size={16} />
                <span className="hidden sm:inline">Importar</span>
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 rounded-full text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-2"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Resetar</span>
              </button>
            </>
          )}

          <div className="h-8 w-px bg-gray-200 mx-2" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold uppercase tracking-tighter">{user.username}</p>
              <p className="text-[10px] text-gray-400 font-medium">{user.role}</p>
            </div>
            <button
              onClick={() => setUser(null)}
              className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className={cn("max-w-[1600px] mx-auto p-4 md:p-8", view === 'MANAGEMENT' && "flex flex-col")}>
        <AnimatePresence mode="wait">
          {view === 'MANAGEMENT' && user.role === 'ADMIN' && (
            <motion.div
              key="management"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col gap-4 pr-2"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 shrink-0">
                {[
                  { label: 'Total Atividades', value: stats.total, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Concluídas', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Pendentes', value: stats.delayed, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                  { label: 'Canceladas', value: stats.cancelled, icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
                  { label: 'Extras', value: stats.extras, icon: Plus, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm flex flex-col justify-between group hover:border-black/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                        <stat.icon size={20} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold tracking-tighter">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold tracking-tight">Curva S — Progresso Físico</h2>
                    <div className="flex gap-4 text-[10px] font-semibold uppercase tracking-widest">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600" /> Planejado</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-600" /> Real</div>
                    </div>
                  </div>

                  <div className="w-full h-[400px]">

                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
                      <LineChart data={sCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 9, fill: '#999' }}
                          interval="preserveStartEnd"
                          minTickGap={30}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#999' }} domain={[0, 100]} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-4 rounded-2xl shadow-xl border border-black/5 min-w-[200px]">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                                        <span className="text-xs font-bold text-gray-600">Planejado</span>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-bold text-black">{data.planned}%</p>
                                        <p className="text-[9px] text-gray-400 font-bold">{data.plannedActivities} / {data.totalActivities} Ativ.</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-600" />
                                        <span className="text-xs font-bold text-gray-600">Real</span>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-bold text-black">{data.real !== null ? `${data.real}%` : '--'}</p>
                                        <p className="text-[9px] text-gray-400 font-bold">{data.realActivities !== null ? `${data.realActivities} / ${data.totalActivities} Ativ.` : '--'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line type="monotone" dataKey="planned" stroke="#2563eb" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="real" stroke="#e11d48" strokeWidth={3} dot={{ r: 3, fill: '#e11d48' }} activeDot={{ r: 5 }} connectNulls={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm flex flex-col">
                <h2 className="text-lg font-bold tracking-tight mb-4">Progresso por Categoria</h2>
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={activities.reduce((acc: any[], act) => {
                        const cat = act.category;
                        if (act.description?.toUpperCase() === act.category?.toUpperCase()) return acc;
                        if (act.is_cancelled) return acc;

                        const isCompleted = act.percent_progress === 100;
                        const existing = acc.find(a => a.name === cat);
                        if (existing) {
                          existing.total += 1;
                          if (isCompleted) existing.completed += 1;
                          else existing.pending += 1;
                        } else {
                          acc.push({
                            name: cat,
                            total: 1,
                            completed: isCompleted ? 1 : 0,
                            pending: isCompleted ? 0 : 1
                          });
                        }
                        return acc;
                      }, [])}
                      layout="vertical"
                      margin={{ left: 20, right: 30 }}
                    >
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#999' }} hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#666', fontWeight: 'bold' }} width={100} />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        content={({ payload }) => (
                          <div className="flex justify-end gap-4 mb-4">
                            {payload?.map((entry: any, index: number) => (
                              <div key={`item-${index}`} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {entry.value === 'completed' ? 'Concluído' : 'Pendente'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-xl shadow-xl border border-black/5">
                                <p className="text-xs font-bold text-gray-800 mb-2">{data.name}</p>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-emerald-600">Concluídas: {data.completed}</p>
                                  <p className="text-[10px] font-bold text-gray-400">Pendentes: {data.pending}</p>
                                  <div className="pt-1 mt-1 border-t border-gray-100">
                                    <p className="text-[10px] font-bold text-black">Total: {data.total}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="completed" stackId="a" fill="#000" radius={[0, 0, 0, 0]} barSize={20} />
                      <Bar dataKey="pending" stackId="a" fill="#f3f4f6" radius={[0, 4, 4, 0]} barSize={20}>
                        <LabelList
                          dataKey="total"
                          position="right"
                          content={(props: any) => {
                            const { x, y, width, height, payload } = props;
                            if (!payload) return null;
                            return (
                              <text x={x + width + 10} y={y + height / 2 + 4} fill="#999" fontSize={10} fontWeight="bold">
                                {payload.completed}/{payload.total}
                              </text>
                            );
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Consolidated Progress by Group */}
              <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900">Consolidado por Grupo</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Acompanhamento Geral das Categorias</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Progresso Médio
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryProgress.map((cat) => (
                    <div key={cat.name} className="bg-gray-50/50 p-6 rounded-3xl border border-black/5 group hover:border-blue-200 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm tracking-tight text-gray-700 truncate pr-4">{cat.name}</h3>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-gray-400">{cat.count} Ativ.</span>
                          {cat.cancelledCount > 0 && (
                            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{cat.cancelledCount} Canceladas</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-end justify-between mb-2">
                        <span className="text-3xl font-bold tracking-tighter text-black">{cat.progress}%</span>
                        <div className={cn(
                          "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                          cat.progress === 100 ? "bg-emerald-100 text-emerald-600" :
                            cat.progress > 0 ? "bg-blue-100 text-blue-600" :
                              "bg-gray-200 text-gray-500"
                        )}>
                          {cat.progress === 100 ? 'Concluído' : cat.progress > 0 ? 'Em Andamento' : 'Pendente'}
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn(
                            "h-full transition-all duration-500",
                            cat.progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'IMPORT' && user.role === 'ADMIN' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto bg-white p-12 rounded-[40px] border border-black/5 shadow-xl text-center"
            >
              {isImporting ? (
                <div className="py-16">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-blue-100 rounded-3xl" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-t-blue-600 rounded-3xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TrendingUp size={32} className="text-blue-600" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight mb-4">Aguardando Importação</h2>
                  <p className="text-gray-500 mb-10 max-w-xs mx-auto">
                    Sincronizando dados do cronograma com o servidor. Por favor, não feche esta janela.
                  </p>

                  <div className="w-full max-w-md mx-auto">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Status do Processamento</span>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{importProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${importProgress}%` }}
                        className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <FileSpreadsheet size={40} className="text-gray-400" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight mb-4">Importar Cronograma</h2>
                  <p className="text-gray-500 mb-12 max-w-md mx-auto">
                    Faça o upload do seu arquivo Excel (.xlsx) para atualizar a base de dados do cronograma industrial.
                  </p>

                  <label className="group relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-[32px] hover:border-black transition-all cursor-pointer bg-gray-50/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-4 text-gray-400 group-hover:text-black transition-colors" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para selecionar</span> ou arraste e solte</p>
                      <p className="text-xs text-gray-400">XLSX ou XLS (Max. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImport} />
                  </label>

                  <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100 text-left">
                    <h3 className="text-amber-800 font-bold text-sm mb-2 flex items-center gap-2">
                      <AlertCircle size={16} />
                      Dica de Formatação
                    </h3>
                    <p className="text-amber-700 text-xs leading-relaxed">
                      Certifique-se de que seu Excel possui as colunas: <strong>ID, Descricao, Inicio, Fim, Duracao, Responsavel, Critico, Categoria, OS, Recurso</strong>.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {view === 'OPERATIONAL' && (
            <motion.div
              key="operational"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cronograma Operacional</h1>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Acompanhamento de Atividades em Tempo Real</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowExtraModal(true)}
                    className="px-6 py-2.5 bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                  >
                    <Plus size={16} />
                    Nova Ordem Extra
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[32px] border border-black/5 shadow-sm">
                  <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar por ID, descrição, OS, recurso..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className="bg-gray-50 border-none rounded-2xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-black/5"
                    >
                      <option value="ALL">Todas Categorias</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select
                      value={filterResponsibility}
                      onChange={e => setFilterResponsibility(e.target.value)}
                      className="bg-gray-50 border-none rounded-2xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-black/5"
                    >
                      <option value="ALL">Todos Responsáveis</option>
                      {responsibilities.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['ALL', 'Não Iniciada', 'Em Andamento', 'Pendente', 'Concluída', 'Cancelada'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={cn(
                        "px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                        filterStatus === status
                          ? "bg-black text-white border-black shadow-lg shadow-black/10"
                          : "bg-white text-gray-400 border-black/5 hover:border-black/20"
                      )}
                    >
                      {status === 'ALL' ? 'Todos Status' : status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Update Bar */}
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-black text-white px-6 py-4 rounded-[32px] shadow-2xl flex items-center gap-8 border border-white/10 backdrop-blur-md"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Selecionados</span>
                      <span className="text-lg font-bold">{selectedIds.length} Atividades</span>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                          <span>Novo Progresso</span>
                          <span>{bulkPercent}%</span>
                        </div>
                        <div className="relative pt-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={bulkPercent}
                            onChange={(e) => setBulkPercent(parseInt(e.target.value))}
                            className="w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleBulkUpdate}
                        disabled={isBulkUpdating}
                        className="bg-white text-black px-6 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isBulkUpdating ? 'Atualizando...' : 'Aplicar'}
                      </button>

                      <button
                        onClick={() => setSelectedIds([])}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <Plus size={20} className="rotate-45" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Activity List Grouped */}
              <div className="space-y-8">
                {Object.entries(groupedActivities as Record<string, Activity[]>).map(([groupName, groupActivities]) => {
                  const allSelected = groupActivities.every(a => selectedIds.includes(a.id));
                  const someSelected = groupActivities.some(a => selectedIds.includes(a.id));

                  return (
                    <div key={groupName} className="space-y-4">
                      <div className="flex items-center gap-4 px-2">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={el => el && (el.indeterminate = someSelected && !allSelected)}
                          onChange={() => {
                            if (allSelected) {
                              setSelectedIds(prev => prev.filter(id => !groupActivities.map(a => a.id).includes(id)));
                            } else {
                              setSelectedIds(prev => Array.from(new Set([...prev, ...groupActivities.map(a => a.id)])));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                        />
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">{groupName}</h2>
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] font-bold text-gray-300">{groupActivities.length} Itens</span>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {groupActivities.map((activity) => {
                          const status = calculateActivityStatus(activity);
                          const expectedProgress = calculateExpectedProgress(activity);
                          const isBehindSchedule = activity.percent_progress < expectedProgress;

                          // Summary activity logic: if description matches category, it's a title
                          // Its progress should be the average of other activities in the group
                          let displayProgress = activity.percent_progress;
                          const isSummary = activity.description.toUpperCase() === activity.category.toUpperCase();

                          if (isSummary) {
                            const children = groupActivities.filter(a => a.id !== activity.id);
                            if (children.length > 0) {
                              const totalProgress = children.reduce((sum, a) => sum + a.percent_progress, 0);
                              displayProgress = Math.round(totalProgress / children.length);
                            }
                          }

                          const cleanDescription = activity.description.replace(/^(00|0)\s*/, '');

                          return (
                            <motion.div
                              layout
                              key={activity.id}
                              className={cn(
                                "bg-white rounded-[16px] border transition-all overflow-hidden group relative",
                                activity.critical_path ? "border-rose-500 bg-rose-50/30 shadow-md" : "border-black/5 shadow-sm hover:shadow-md",
                                isSummary && "border-l-4 border-l-blue-500",
                                selectedIds.includes(activity.id) && "ring-2 ring-black border-black",
                                activity.is_cancelled && "opacity-60 grayscale-[0.3] bg-gray-50/50"
                              )}
                            >
                              <div className="p-2 md:p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1">
                                  {!isSummary && (
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.includes(activity.id)}
                                      onChange={() => toggleSelection(activity.id)}
                                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                                    />
                                  )}
                                  <div className="flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className={cn(
                                        "text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1",
                                        activity.critical_path ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-500"
                                      )}>
                                        {!!activity.critical_path && <AlertTriangle size={8} className="animate-pulse" />}
                                        {Boolean(activity.criticality && activity.criticality.toLowerCase() === 'alta') && (
                                          <TrendingUp size={8} className="text-white" />
                                        )}
                                        {String(activity.id || '').replace(/^0+/, '')}</span>
                                      {!!activity.critical_path && (
                                        <span className="text-[8px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1 animate-pulse">
                                          <AlertTriangle size={10} /> Crítico
                                        </span>
                                      )}
                                      {Boolean(activity.is_cancelled) && (
                                        <span className="text-[8px] font-bold bg-gray-600 text-white px-2 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1">
                                          <XCircle size={10} /> Cancelada
                                        </span>
                                      )}
                                      {isSummary && (
                                        <span className="text-[8px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1">
                                          <Layers size={10} /> Título
                                        </span>
                                      )}
                                    </div>

                                    <div>
                                      <h3 className={cn("text-sm font-bold tracking-tight leading-tight", isSummary ? "text-blue-900" : "text-gray-800")}>
                                        {cleanDescription}
                                      </h3>
                                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                        <div className="flex items-center gap-1">
                                          <Clock size={10} className="text-gray-300" />
                                          {format(parseISO(activity.start_date), 'dd/MM HH:mm')} — {format(parseISO(activity.end_date), 'dd/MM HH:mm')}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <UserIcon size={10} className="text-gray-300" /> {activity.responsibility}
                                        </div>
                                        {activity.os && activity.os !== '0' && activity.os !== '00' && (
                                          <div className="flex items-center gap-1 text-blue-600">
                                            <span className="text-blue-200">OS:</span> {activity.os}
                                          </div>
                                        )}
                                        {activity.resource && activity.resource !== '0' && activity.resource !== '00' && (
                                          <div className="flex items-center gap-1 text-emerald-600">
                                            <span className="text-emerald-200">REC:</span> {activity.resource}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 min-w-[280px]">
                                  {!isSummary && (
                                    <div className="flex-1 flex flex-col gap-3">
                                      <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                        <span>Progresso</span>
                                        <span>{activity.percent_progress}%</span>
                                      </div>
                                      <div className="relative pt-2">
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          step="5"
                                          value={activity.percent_progress}
                                          onChange={(e) => quickUpdateProgress(activity.id, parseInt(e.target.value))}
                                          className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <p className="text-xl font-bold tracking-tighter leading-none">{displayProgress}%</p>
                                      <div className={cn(
                                        "text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full inline-block mt-1",
                                        status === 'Concluída' ? "bg-emerald-100 text-emerald-600" :
                                          status === 'Pendente' ? "bg-rose-100 text-rose-600" :
                                            status === 'Em Andamento' ? "bg-blue-100 text-blue-600" :
                                              status === 'Cancelada' ? "bg-gray-200 text-gray-600" :
                                                "bg-gray-100 text-gray-400"
                                      )}>
                                        {status}
                                      </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-xl border border-gray-100 flex items-center justify-center relative overflow-hidden bg-gray-50/50">
                                      <div
                                        className={cn(
                                          "absolute bottom-0 left-0 w-full transition-all duration-700 ease-out",
                                          status === 'Concluída' ? "bg-emerald-500" :
                                            status === 'Pendente' ? "bg-rose-500" :
                                              status === 'Em Andamento' ? "bg-blue-500" :
                                                status === 'Cancelada' ? "bg-gray-500" :
                                                  "bg-gray-300"
                                        )}
                                        style={{ height: `${displayProgress}%` }}
                                      />
                                    </div>
                                  </div>

                                  {!isSummary && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setSelectedActivity(activity);
                                          setUpdatePercent(activity.percent_progress);
                                        }}
                                        className="p-2 bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all active:scale-95"
                                        title="Editar detalhes"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        onClick={() => setActivityToCancel(activity)}
                                        className={cn(
                                          "p-2 rounded-lg transition-all active:scale-95",
                                          activity.is_cancelled
                                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                            : "bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                                        )}
                                        title={activity.is_cancelled ? "Reativar atividade" : "Cancelar atividade"}
                                      >
                                        <XCircle size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Progress Update Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActivity(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-widest mb-2 inline-block">
                      {selectedActivity.id.replace(/^0+/, '')}
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight">{selectedActivity.description}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Progresso Atual</label>
                      <span className="text-3xl font-bold tracking-tighter">{updatePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={updatePercent}
                      onChange={e => setUpdatePercent(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Comentário / Observação</label>
                    <textarea
                      value={updateComment}
                      onChange={e => setUpdateComment(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all min-h-[100px] text-sm"
                      placeholder="Descreva o avanço ou impedimentos..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-gray-200 font-semibold hover:bg-gray-50 transition-colors text-sm">
                      <Camera size={18} /> Evidência
                    </button>
                  </div>

                  <button
                    onClick={handleUpdateProgress}
                    className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10 text-lg"
                  >
                    Confirmar Apontamento
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Extra Order Modal */}
      <AnimatePresence>
        {showExtraModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExtraModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Nova Ordem Extra</h2>
                  <button onClick={() => setShowExtraModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ID da Ordem</label>
                      <input
                        type="text"
                        value={extraOrder.id}
                        onChange={(e) => setExtraOrder({ ...extraOrder, id: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium"
                        placeholder="Ex: 12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Responsável</label>
                      <input
                        type="text"
                        value={extraOrder.responsibility}
                        onChange={(e) => setExtraOrder({ ...extraOrder, responsibility: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium"
                        placeholder="Nome"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Descrição</label>
                    <textarea
                      value={extraOrder.description}
                      onChange={(e) => setExtraOrder({ ...extraOrder, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium h-24 resize-none"
                      placeholder="Descreva a atividade..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Início</label>
                      <input
                        type="datetime-local"
                        value={extraOrder.start_date}
                        onChange={(e) => setExtraOrder({ ...extraOrder, start_date: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fim</label>
                      <input
                        type="datetime-local"
                        value={extraOrder.end_date}
                        onChange={(e) => setExtraOrder({ ...extraOrder, end_date: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">OS (Opcional)</label>
                      <input
                        type="text"
                        value={extraOrder.os}
                        onChange={(e) => setExtraOrder({ ...extraOrder, os: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Recurso (Opcional)</label>
                      <input
                        type="text"
                        value={extraOrder.resource}
                        onChange={(e) => setExtraOrder({ ...extraOrder, resource: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddExtra}
                    className="w-full py-4 bg-black text-white rounded-3xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-gray-800 transition-all active:scale-[0.98] shadow-xl shadow-black/10 mt-4"
                  >
                    Criar Ordem Extra
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {activityToCancel && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivityToCancel(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10 text-center">
                <div className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg",
                  activityToCancel.is_cancelled ? "bg-emerald-100 text-emerald-600 shadow-emerald-100" : "bg-rose-100 text-rose-600 shadow-rose-100"
                )}>
                  <AlertTriangle size={40} />
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                  {activityToCancel.is_cancelled ? 'Reativar Atividade?' : 'Cancelar Atividade?'}
                </h2>
                <p className="text-gray-500 text-sm mb-8">
                  {activityToCancel.is_cancelled
                    ? 'Esta atividade voltará a ser contabilizada no cronograma e na curva S.'
                    : 'Esta atividade deixará de ser contabilizada no cronograma e na curva S.'}
                </p>

                <div className="bg-gray-50 p-4 rounded-2xl mb-8 text-left border border-black/5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{activityToCancel.id.replace(/^0+/, '')}</span>
                  <p className="text-sm font-bold text-gray-800 line-clamp-2">{activityToCancel.description}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleCancelActivity(activityToCancel.id, !!activityToCancel.is_cancelled)}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold transition-all shadow-lg text-white",
                      activityToCancel.is_cancelled
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                        : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                    )}
                  >
                    {activityToCancel.is_cancelled ? 'Sim, Reativar' : 'Sim, Cancelar'}
                  </button>
                  <button
                    onClick={() => setActivityToCancel(null)}
                    className="w-full py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all text-sm"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Confirmar Reset</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Esta ação é irreversível. Todas as atividades, logs e progresso serão apagados permanentemente.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 text-center">
                    Digite <span className="text-rose-600">RESETAR</span> para confirmar
                  </label>
                  <input
                    type="text"
                    value={resetConfirmText}
                    onChange={e => setResetConfirmText(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-center font-bold tracking-widest"
                    placeholder="CONFIRMAÇÃO"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetConfirmText('');
                    }}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleResetDatabase}
                    disabled={resetConfirmText !== 'RESETAR'}
                    className={cn(
                      "flex-2 py-3 rounded-xl font-bold text-white transition-all text-sm shadow-lg shadow-rose-500/20",
                      resetConfirmText === 'RESETAR' ? "bg-rose-600 hover:bg-rose-700" : "bg-gray-300 cursor-not-allowed"
                    )}
                  >
                    Resetar Base de Dados
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto p-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-black/5 mt-12">
        <div className="flex items-center gap-4">
          <span>PCM BRASIL © 2026</span>
          <span className="h-3 w-px bg-gray-200" />
          <span>Última Sincronização: {format(new Date(), 'HH:mm:ss')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Sistema Online
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-[70] bg-black text-white p-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all active:scale-95 border border-white/10 group"
            title="Voltar ao Topo"
          >
            <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div >
  );
}
