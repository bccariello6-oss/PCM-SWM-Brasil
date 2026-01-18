
import React, { useState } from 'react';
import { X, Save, HardHat, User, Briefcase, Clock, ShieldCheck } from 'lucide-react';
import { Technician, Discipline, Shift } from '../types';
import { DISCIPLINE_COLORS } from '../constants';

interface TechnicianFormProps {
  technician?: Partial<Technician>;
  onClose: () => void;
  onSave: (tech: Technician) => void;
}

const TechnicianForm: React.FC<TechnicianFormProps> = ({ technician, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Technician>>(technician || {
    name: '',
    discipline: Discipline.MECHANICS,
    shift: Shift.FIRST,
    isLeader: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData as Technician);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${formData.discipline ? DISCIPLINE_COLORS[formData.discipline as Discipline] : 'bg-blue-600'}`}>
              <HardHat className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {technician?.id ? 'Editar Recurso' : 'Novo Técnico'}
              </h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Gestão de Efetivo Industrial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <User className="w-3 h-3" /> Nome Completo
            </label>
            <input
              required
              type="text"
              placeholder="Ex: Roberto Almeida"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Briefcase className="w-3 h-3" /> Disciplina
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
                value={formData.discipline}
                onChange={e => setFormData({ ...formData, discipline: e.target.value as Discipline })}
              >
                {Object.values(Discipline).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Clock className="w-3 h-3" /> Turno
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
                value={formData.shift}
                onChange={e => setFormData({ ...formData, shift: e.target.value as Shift })}
              >
                {Object.values(Shift).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <input
               type="checkbox"
               id="leader"
               className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
               checked={formData.isLeader}
               onChange={e => setFormData({ ...formData, isLeader: e.target.checked })}
             />
             <label htmlFor="leader" className="text-sm font-semibold text-slate-700 cursor-pointer select-none flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-blue-600" />
               Líder de Equipe / Encarregado
             </label>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Recurso
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianForm;
