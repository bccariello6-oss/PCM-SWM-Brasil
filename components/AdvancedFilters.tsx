
import React from 'react';
import { X, Filter, FilterX, Search, Tag, MapPin, AlertCircle, Clock } from 'lucide-react';
import { Discipline, OSStatus, OrderFilters, Technician } from '../types';

interface AdvancedFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    filters: OrderFilters;
    setFilters: (filters: OrderFilters) => void;
    technicians: Technician[];
    onClear: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
    isOpen,
    onClose,
    filters,
    setFilters,
    technicians,
    onClear
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <Filter className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Filtros Avançados</h2>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">Refine sua visualização de ordens</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Status Filter */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Status da Ordem
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setFilters({ ...filters, status: 'All' })}
                                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${filters.status === 'All' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                            >
                                Todos
                            </button>
                            {Object.values(OSStatus).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilters({ ...filters, status })}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${filters.status === status ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Discipline Filter */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Tag className="w-3 h-3" /> Disciplina
                        </label>
                        <select
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={filters.discipline}
                            onChange={e => setFilters({ ...filters, discipline: e.target.value })}
                        >
                            <option value="All">Todas as Disciplinas</option>
                            {Object.values(Discipline).map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {/* Technician Filter */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Tag className="w-3 h-3" /> Responsável
                        </label>
                        <select
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={filters.technicianId}
                            onChange={e => setFilters({ ...filters, technicianId: e.target.value })}
                        >
                            <option value="All">Todos os Técnicos</option>
                            {technicians.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Prioridade
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['All', 'Baixa', 'Média', 'Alta', 'Crítica'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setFilters({ ...filters, priority: p })}
                                    className={`py-2 px-4 rounded-full text-xs font-bold border transition-all ${filters.priority === p ? 'bg-slate-800 border-slate-800 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    {p === 'All' ? 'Todas' : p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Area Filter */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Área / Localização
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Ex: Utilidades, Fornos..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={filters.area}
                                onChange={e => setFilters({ ...filters, area: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Operational Shutdown Filter */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Parada Requerida
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilters({ ...filters, operationalShutdown: 'All' })}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${filters.operationalShutdown === 'All' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                            >
                                Ambos
                            </button>
                            <button
                                onClick={() => setFilters({ ...filters, operationalShutdown: true })}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${filters.operationalShutdown === true ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-red-100'}`}
                            >
                                Sim
                            </button>
                            <button
                                onClick={() => setFilters({ ...filters, operationalShutdown: false })}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${filters.operationalShutdown === false ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-100'}`}
                            >
                                Não
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                    <button
                        onClick={onClear}
                        className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
                    >
                        <FilterX className="w-4 h-4" />
                        Limpar Filtros
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFilters;
