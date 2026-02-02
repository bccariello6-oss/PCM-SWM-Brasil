
import React, { useMemo } from 'react';
import { History, User, Clock, ChevronRight, ClipboardList, AlertCircle } from 'lucide-react';
import { LogEntry, MaintenanceOrder } from '../types';

interface WeeklyHistoryProps {
    logs: LogEntry[];
    orders: MaintenanceOrder[];
    weekRange: { start: Date; end: Date };
}

const WeeklyHistory: React.FC<WeeklyHistoryProps> = ({ logs, orders, weekRange }) => {
    const weeklyLogs = useMemo(() => {
        return logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= weekRange.start && logDate <= weekRange.end;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, weekRange]);

    const groupLogsByDay = (logs: LogEntry[]) => {
        const groups: { [key: string]: LogEntry[] } = {};
        logs.forEach(log => {
            const date = new Date(log.timestamp).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
            if (!groups[date]) groups[date] = [];
            groups[date].push(log);
        });
        return groups;
    };

    const groupedLogs = groupLogsByDay(weeklyLogs);

    if (weeklyLogs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <History className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Nenhuma atividade nesta semana</h3>
                <p className="text-slate-500 text-sm max-w-xs text-center mt-1">
                    Não foram registrados logs de criação ou alteração de OS no período selecionado.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {Object.entries(groupedLogs).map(([day, dayLogs]) => (
                <div key={day} className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-px bg-slate-200 flex-1" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                            {day}
                        </span>
                        <div className="h-px bg-slate-200 flex-1" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dayLogs.map(log => {
                            const order = orders.find(o => o.id === (log as any).order_id || (log as any).orderId);
                            return (
                                <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span className="text-xs font-bold text-slate-800">{log.action}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {order && (
                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <ClipboardList className="w-3 h-3 text-blue-600" />
                                                <span className="text-[10px] font-black text-blue-700 uppercase">OS #{order.osNumber}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-600 font-medium line-clamp-2">{order.description}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">
                                                {log.userName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 truncate max-w-[80px]">{log.userName}</span>
                                        </div>

                                        {log.field && (
                                            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                <span>{log.field}</span>
                                            </div>
                                        )}
                                    </div>

                                    {(log.oldValue || log.newValue) && (
                                        <div className="mt-1 flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg text-[9px]">
                                            <span className="text-slate-400 line-through truncate max-w-[70px]">{log.oldValue || 'N/A'}</span>
                                            <ChevronRight className="w-3 h-3 text-slate-300" />
                                            <span className="text-blue-600 font-bold truncate max-w-[70px]">{log.newValue || 'N/A'}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WeeklyHistory;
