
import React, { useState, useMemo } from 'react';
import { OperationalShutdown } from '../types';
import { MACHINE_SHUTDOWN_BUDGETS } from '../constants';
import {
    ChevronLeft,
    ChevronRight,
    Settings,
    AlertTriangle,
    Clock,
    Plus,
    Filter,
    Calendar as CalendarIcon,
    Search,
    LayoutGrid,
    CalendarDays,
    TrendingUp,
    TrendingDown,
    CheckCircle2
} from 'lucide-react';

interface ShutdownCalendarProps {
    shutdowns: OperationalShutdown[];
    onAdd: (date: string) => void;
    onEdit: (shutdown: OperationalShutdown) => void;
}

const ShutdownCalendar: React.FC<ShutdownCalendarProps> = ({ shutdowns, onAdd, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filterMachine, setFilterMachine] = useState<string>('All');
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const machineList = useMemo(() => {
        const machines = Array.from(new Set(shutdowns.map(s => s.machine)));
        return ['All', 'MP01', 'MP03', 'MP06', ...machines.filter(m => !['MP01', 'MP03', 'MP06'].includes(m))];
    }, [shutdowns]);

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });

    const budgetStats = useMemo(() => {
        const stats = ['MP01', 'MP03', 'MP06'].map(machine => {
            const machineShutdowns = shutdowns.filter(s => s.machine === machine && new Date(s.date).getFullYear() === year);
            const totalPlanned = machineShutdowns.reduce((acc, s) => acc + s.duration, 0);
            const totalRealized = machineShutdowns.reduce((acc, s) => acc + (s.realizedDuration !== undefined ? s.realizedDuration : 0), 0);
            const budget = MACHINE_SHUTDOWN_BUDGETS[machine] || 0;
            const percentUsed = budget > 0 ? (totalRealized / budget) * 100 : 0;

            return {
                machine,
                budget,
                realized: totalRealized,
                planned: totalPlanned,
                percent: Math.round(percentUsed)
            };
        });
        return stats;
    }, [shutdowns, year]);

    const calendarDays = useMemo(() => {
        const totalDays = daysInMonth(year, month);
        const startOffset = (firstDayOfMonth(year, month) + 6) % 7;
        const days = [];
        const prevMonthDays = daysInMonth(year, month - 1);
        for (let i = startOffset - 1; i >= 0; i--) {
            days.push({ day: prevMonthDays - i, currentMonth: false, date: '' });
        }
        for (let i = 1; i <= totalDays; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({ day: i, currentMonth: true, date: dateStr });
        }
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, currentMonth: false, date: '' });
        }
        return days;
    }, [year, month]);

    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

    const getDayShutdowns = (date: string) => {
        return shutdowns.filter(s => {
            const matchesDate = s.date === date;
            const matchesMachine = filterMachine === 'All' || s.machine === filterMachine;
            return matchesDate && matchesMachine;
        });
    };

    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    const renderBudgetCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {budgetStats.map(stat => (
                <div key={stat.machine} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-110 transition-transform ${stat.percent > 90 ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.machine} | Budget Anual</p>
                            <h4 className="text-2xl font-bold text-slate-900">{stat.budget}h</h4>
                        </div>
                        <div className={`p-2 rounded-xl ${stat.percent > 90 ? 'bg-red-50' : 'bg-blue-50'}`}>
                            {stat.percent > 90 ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <TrendingUp className="w-5 h-5 text-blue-600" />}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] font-bold mb-1.5">
                            <span className="text-slate-500 uppercase">Utilizado: {stat.realized}h</span>
                            <span className={stat.percent > 90 ? 'text-red-600' : 'text-blue-600'}>{stat.percent}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${stat.percent > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(stat.percent, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderYearlyOverview = () => {
        const months = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(year, i, 1);
            return {
                name: d.toLocaleString('pt-BR', { month: 'long' }),
                index: i
            };
        });

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {months.map(m => {
                    const monthShutdowns = shutdowns.filter(s => {
                        const sDate = new Date(s.date);
                        return sDate.getFullYear() === year && sDate.getMonth() === m.index;
                    });

                    return (
                        <div key={m.index} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[300px]">
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <h4 className="font-bold text-slate-800 capitalize">{m.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">
                                        {monthShutdowns.length}
                                    </span>
                                    <button
                                        onClick={() => onAdd(`${year}-${String(m.index + 1).padStart(2, '0')}-01`)}
                                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-blue-600 transition-all"
                                        title={`Adicionar parada em ${m.name}`}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 p-3 overflow-y-auto space-y-2 scrollbar-hide">
                                {monthShutdowns.length > 0 ? (
                                    monthShutdowns.map(s => (
                                        <div
                                            key={s.id}
                                            onClick={() => onEdit(s)}
                                            className="p-2 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[9px] font-black text-red-600 uppercase">{s.machine}</span>
                                                <span className="text-[9px] font-bold text-slate-400">{new Date(s.date).getDate().toString().padStart(2, '0')}/{(m.index + 1).toString().padStart(2, '0')}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-700 leading-tight group-hover:text-red-700">{s.service}</p>
                                            <div className="flex items-center gap-2 mt-1.5 opacity-60">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    <span className="text-[9px] font-bold">{s.duration}h</span>
                                                </div>
                                                {s.realizedDuration !== undefined && (
                                                    <div className="flex items-center gap-1 text-emerald-600">
                                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                                        <span className="text-[9px] font-bold">{s.realizedDuration}h</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                                        <CalendarIcon className="w-8 h-8 mb-1" />
                                        <p className="text-[10px] font-bold">Sem paradas</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex h-full flex-col">
            {/* Stats Header */}
            {renderBudgetCards()}

            <div className="flex flex-col h-full space-y-4">
                {/* Calendar Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-xl">
                            <CalendarIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 capitalize leading-tight">
                                {viewMode === 'monthly' ? `${monthName} ${year}` : `Calendário Anual ${year}`}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">Cronograma de Paradas de Máquinas</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Toggle View Mode */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                                onClick={() => setViewMode('monthly')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'monthly' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <CalendarDays className="w-4 h-4" />
                                Mensal
                            </button>
                            <button
                                onClick={() => setViewMode('yearly')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'yearly' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                Anual
                            </button>
                        </div>

                        <div className="h-10 w-px bg-slate-200" />

                        <div className="flex items-center gap-3">
                            {viewMode === 'monthly' && (
                                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    <button
                                        onClick={prevMonth}
                                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentDate(new Date())}
                                        className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600"
                                    >
                                        Hoje
                                    </button>
                                    <button
                                        onClick={nextMonth}
                                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            <div className="relative group">
                                <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                                <select
                                    value={filterMachine}
                                    onChange={(e) => setFilterMachine(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none min-w-[140px]"
                                >
                                    {machineList.map(m => (
                                        <option key={m} value={m}>{m === 'All' ? 'Todas Máquinas' : m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {viewMode === 'monthly' ? (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px] animate-in fade-in duration-300">
                            {/* Days of week header */}
                            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                                {weekDays.map(d => (
                                    <div key={d} className="py-3 px-4 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Days grid */}
                            <div className="grid grid-cols-7 flex-1">
                                {calendarDays.map((day, i) => {
                                    const dayShutdowns = day.date ? getDayShutdowns(day.date) : [];
                                    const isToday = day.date === new Date().toISOString().split('T')[0];

                                    return (
                                        <div
                                            key={i}
                                            className={`min-h-[120px] p-2 border-r border-b border-slate-100 transition-colors relative group/day ${day.currentMonth ? 'bg-white' : 'bg-slate-50/50'
                                                } ${i % 7 === 6 ? 'border-r-0' : ''}`}
                                            onClick={() => day.date && onAdd(day.date)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-xs font-bold leading-none w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${!day.currentMonth ? 'text-slate-300' :
                                                    isToday ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-slate-500'
                                                    }`}>
                                                    {day.day}
                                                </span>

                                                {day.currentMonth && (
                                                    <button className="opacity-0 group-hover/day:opacity-100 p-1 hover:bg-slate-100 rounded text-slate-400 transition-all">
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-1 overflow-y-auto max-h-[120px] scrollbar-hide">
                                                {dayShutdowns.map(shutdown => (
                                                    <div
                                                        key={shutdown.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(shutdown);
                                                        }}
                                                        className="group/event p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-all cursor-pointer shadow-sm active:scale-95"
                                                    >
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <span className="text-[10px] font-black text-red-700 uppercase leading-none">{shutdown.machine}</span>
                                                            <div className="flex items-center gap-1 opacity-60">
                                                                <Clock className="w-2.5 h-2.5 text-red-600" />
                                                                <span className="text-[9px] font-bold text-red-600">
                                                                    {shutdown.realizedDuration !== undefined ? shutdown.realizedDuration : shutdown.duration}h
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-2">{shutdown.service}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        renderYearlyOverview()
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShutdownCalendar;

