
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts';
import { MaintenanceOrder, Discipline, OSStatus, Technician } from '../types';
import { DISCIPLINE_COLORS, WEEK_DAYS } from '../constants';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  History,
  Zap,
  TrendingDown,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  orders: MaintenanceOrder[];
  technicians: Technician[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders, technicians }) => {
  const pendingOrders = orders.filter(o => o.status !== OSStatus.COMPLETED);
  const totalPlannedHours = orders.reduce((acc, o) => acc + o.estimatedHours, 0);
  
  const backlogHours = pendingOrders.reduce((acc, o) => acc + o.estimatedHours, 0);
  const techCount = technicians?.length || 0;
  const totalCapacity = techCount * 44; // 44h per tech
  const capacityUsedPercent = totalCapacity > 0 ? Math.round((totalPlannedHours / totalCapacity) * 100) : 0;

  const stats = [
    { label: 'Total OS', value: orders.length, icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Horas Planejadas', value: totalPlannedHours, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Backlog (Horas)', value: backlogHours, icon: History, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Capacidade Utilizada', value: `${capacityUsedPercent}%`, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const disciplineData = Object.values(Discipline).map(d => ({
    name: d,
    value: orders.filter(o => o.discipline === d).length,
    color: DISCIPLINE_COLORS[d]
  })).filter(d => d.value > 0);

  const areaData = Array.from(new Set(orders.map(o => o.area))).map(area => ({
    name: area,
    count: orders.filter(o => o.area === area).length
  }));

  // Daily Load Chart
  const dailyLoadData = WEEK_DAYS.map(day => {
    const hours = orders
      .filter(o => o.scheduledDay === day)
      .reduce((acc, o) => acc + o.estimatedHours, 0);
    return { name: day.substring(0, 3), horas: hours, limite: techCount * 8 };
  });

  const backlogDisciplineData = Object.values(Discipline).map(d => {
    const total = orders.filter(o => o.discipline === d).length;
    const pending = orders.filter(o => o.discipline === d && o.status !== OSStatus.COMPLETED).length;
    const completed = total - pending;
    return {
      name: d,
      pendentes: pending,
      concluidas: completed,
      total: total
    };
  }).filter(d => d.total > 0);

  // Identify Bottlenecks
  const techOverloads = (technicians || []).map(t => {
    const hours = orders
      .filter(o => o.technicianId === t.id || o.collaboratorId === t.id)
      .reduce((acc, o) => acc + o.estimatedHours, 0);
    return { ...t, hours };
  }).filter(t => t.hours > 44);

  const criticalDays = dailyLoadData.filter(d => d.horas > d.limite && d.limite > 0);

  return (
    <div className="h-full flex flex-col space-y-4 max-h-[calc(100vh-160px)]">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 leading-none mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Left Section: Backlog & Capacity Timeline */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Main Backlog Monitor */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-[250px]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Backlog por Disciplina</h3>
                <p className="text-xs text-slate-500 font-medium">Distribuição de carga pendente</p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Pendentes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Concluídas</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              {orders.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={backlogDisciplineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Bar dataKey="pendentes" stackId="a" fill="#fbbf24" barSize={32} />
                    <Bar dataKey="concluidas" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <ClipboardCheck className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">Sem dados de OS</p>
                </div>
              )}
            </div>
          </div>

          {/* Daily Capacity Utilization */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-[180px]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Horas Planejadas vs Capacidade</h3>
                <p className="text-[10px] text-slate-500 font-medium">Carga diária total (Limite base: {techCount * 8}h/dia)</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                <TrendingDown className="w-3 h-3" />
                Meta: &lt; 90%
              </div>
            </div>
            <div className="flex-1">
              {techCount > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyLoadData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '10px' }} />
                    <Line type="monotone" dataKey="horas" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                    <Line type="step" dataKey="limite" stroke="#f43f5e" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <Zap className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">Cadastre técnicos para ver capacidade</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Bottlenecks & Small Charts */}
        <div className="flex flex-col gap-4">
          {/* Bottlenecks Card */}
          <div className="bg-slate-900 rounded-xl p-5 shadow-lg border border-slate-800 flex flex-col gap-4 min-h-[220px]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Gargalos Detectados</h3>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              {techOverloads.length === 0 && criticalDays.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-4">
                  <CheckCircle2 className="w-10 h-10 mb-2 opacity-20 text-emerald-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Sem Sobrecargas</p>
                </div>
              ) : (
                <>
                  {techOverloads.map(t => (
                    <div key={t.id} className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                      <div>
                        <p className="text-xs font-bold text-slate-200">{t.name}</p>
                        <p className="text-[9px] text-amber-500 font-black uppercase tracking-tighter">Sobrecarga: {t.hours}h / 44h</p>
                      </div>
                      <div className="p-1.5 bg-red-500/20 text-red-500 rounded-lg">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                  {criticalDays.map(d => (
                    <div key={d.name} className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-red-100">{d.name} (Acima da Capacidade)</p>
                        <p className="text-[9px] text-red-400 font-black uppercase tracking-tighter">{d.horas}h Totais Planejadas</p>
                      </div>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-[200px]">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Por Área</h3>
            <div className="flex-1">
              {areaData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={areaData} layout="vertical" margin={{ left: -20, top: 0, right: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 500 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '10px' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-200">
                   <p className="text-[10px] font-bold uppercase tracking-widest">Aguardando dados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
