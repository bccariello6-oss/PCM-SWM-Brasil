
import React, { useState, useEffect } from 'react';
import { OperationalShutdown } from '../types';
import {
    X,
    Save,
    Trash2,
    Clock,
    Calendar,
    Hammer,
    AlertTriangle,
    Factory
} from 'lucide-react';

interface ShutdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (shutdown: OperationalShutdown) => void;
    onDelete?: (id: string) => void;
    shutdown?: Partial<OperationalShutdown>;
}

const ShutdownModal: React.FC<ShutdownModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    shutdown
}) => {
    const [formData, setFormData] = useState<Partial<OperationalShutdown>>({
        machine: 'MP01',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        duration: 4,
        service: '',
        impact: '',
        status: 'Agendada'
    });

    const [isNewMachine, setIsNewMachine] = useState(false);
    const [customMachine, setCustomMachine] = useState('');

    const machines = ['MP01', 'MP03', 'MP06', 'Utilidades', 'Outros'];

    useEffect(() => {
        if (shutdown) {
            setFormData({
                ...formData,
                ...shutdown
            });
            if (!machines.includes(shutdown.machine || '')) {
                setIsNewMachine(true);
                setCustomMachine(shutdown.machine || '');
            } else {
                setIsNewMachine(false);
            }
        }
    }, [shutdown, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalMachine = isNewMachine ? customMachine : formData.machine;
        onSave({
            ...formData,
            machine: finalMachine || 'Indefinida',
            id: formData.id || Math.random().toString(36).substr(2, 9)
        } as OperationalShutdown);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-100 rounded-xl text-red-600">
                            <Hammer className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">
                                {shutdown?.id ? 'Editar Parada' : 'Nova Parada Programada'}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">Configure os detalhes da interrupção</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1">
                                <Factory className="w-3 h-3" /> Máquina / Área
                            </label>
                            {!isNewMachine ? (
                                <select
                                    value={formData.machine}
                                    onChange={(e) => {
                                        if (e.target.value === 'Outros') setIsNewMachine(true);
                                        else setFormData({ ...formData, machine: e.target.value });
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                >
                                    {machines.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customMachine}
                                        onChange={(e) => setCustomMachine(e.target.value)}
                                        placeholder="Nome da máquina..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsNewMachine(false)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        Selecionar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1">
                                <Calendar className="w-3 h-3" /> Data
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1">
                                <Clock className="w-3 h-3" /> Início
                            </label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1">
                                <Clock className="w-3 h-3" /> Duração (horas)
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1">
                                <Hammer className="w-3 h-3" /> Serviço a ser Executado
                            </label>
                            <textarea
                                value={formData.service}
                                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all min-h-[80px]"
                                placeholder="Ex: Troca de rolamentos do motor principal"
                                required
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1">
                                <AlertTriangle className="w-3 h-3" /> Impacto no Processo
                            </label>
                            <input
                                type="text"
                                value={formData.impact}
                                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                placeholder="Ex: Parada total da linha de produção"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        {shutdown?.id && onDelete && (
                            <button
                                type="button"
                                onClick={() => onDelete(shutdown.id!)}
                                className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Excluir
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" /> {shutdown?.id ? 'Salvar Alterações' : 'Agendar Parada'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShutdownModal;
