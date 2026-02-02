
import React, { useState, useMemo } from 'react';
import { OperationalShutdown } from '../types';
import {
    ChevronLeft,
    ChevronRight,
    Settings,
    AlertTriangle,
    Clock,
    Plus,
    Filter,
    Calendar as CalendarIcon,
    Search
} from 'lucide-react';

interface ShutdownCalendarProps {
    shutdowns: OperationalShutdown[];
    onAdd: (date: string) => void;
    onEdit: (shutdown: OperationalShutdown) => void;
}

const ShutdownCalendar: React.FC<ShutdownCalendarProps> = ({ shutdowns, onAdd, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filterMachine, setFilterMachine] = useState<string>('All');

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const machineList = useMemo(() => {
        const machines = Array.from(new Set(shutdowns.map(s => s.machine)));
        return ['All', 'MP01', 'MP03', 'MP06', ...machines.filter(m => !['MP01', 'MP03', 'MP06'].includes(m))];
    }, [shutdowns]);

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });

    const calendarDays = useMemo(() => {
        const totalDays = daysInMonth(year, month);
        // Adjust for Monday as first day (0 = Sunday, 1 = Monday...)
        // (firstDayOfMonth(year, month) + 6) % 7 gives 0 for Monday, 1 for Tuesday...
        const startOffset = (firstDayOfMonth(year, month) + 6) % 7;

        const days = [];

        // Previous month padding
        const prevMonthDays = daysInMonth(year, month - 1);
        for (let i = startOffset - 1; i >= 0; i--) {
            days.push({ day: prevMonthDays - i, currentMonth: false, date: '' });
        }

        // Current month days
        for (let i = 1; i <= totalDays; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({ day: i, currentMonth: true, date: dateStr });
        }

        // Next month padding
        const remaining = 42 - days.length; // 6 rows of 7 days
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

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Calendar Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-xl">
                        <CalendarIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 capitalize">{monthName} {year}</h3>
                        <p className="text-sm text-slate-500 font-medium">Cronograma de Paradas de Máquinas</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
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

                    <div className="h-10 w-px bg-slate-200 mx-1" />

                    <div className="relative group">
                        <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                        <select
                            value={filterMachine}
                            onChange={(e) => setFilterMachine(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none min-w-[140px]"
                        >
                            {machineList.map(m => (
                                <option key={m} value={m}>{m === 'All' ? 'Todas as Máquinas' : m}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[600px]">
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
                                                    <span className="text-[9px] font-bold text-red-600">{shutdown.duration}h</span>
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
        </div>
    );
};

export default ShutdownCalendar;
