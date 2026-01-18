
import React from 'react';
import { OperationalShutdown } from '../types';
import { AlertTriangle, Calendar, Clock, MapPin, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { WEEK_DAYS } from '../constants';

interface ShutdownManagementProps {
  shutdowns: OperationalShutdown[];
  onAdd: () => void;
}

const ShutdownManagement: React.FC<ShutdownManagementProps> = ({ shutdowns, onAdd }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Paradas Operacionais</h3>
          <p className="text-sm text-slate-500">Planejamento de janelas de manutenção com impacto produtivo</p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Agendar Parada
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {shutdowns.map((shutdown) => (
          <div key={shutdown.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">{shutdown.reason}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                      <MapPin className="w-3 h-3" />
                      {shutdown.area}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                  shutdown.status === 'Em Curso' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                  shutdown.status === 'Concluída' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  'bg-blue-50 text-blue-600 border-blue-200'
                }`}>
                  {shutdown.status}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Impacto Operacional</p>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{shutdown.impact}</p>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Cronograma</span>
                  </div>
                  <div className="flex gap-1">
                    {WEEK_DAYS.map(day => (
                      <div 
                        key={day} 
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-colors ${
                          shutdown.days.includes(day) 
                            ? 'bg-red-600 border-red-600 text-white' 
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                        title={day}
                      >
                        {day.charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <div className="flex gap-4">
                <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
                <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Cancelar
                </button>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-white border border-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> Marcar como Finalizada
              </button>
            </div>
          </div>
        ))}

        {shutdowns.length === 0 && (
          <div className="col-span-full p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhuma parada agendada para esta semana.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShutdownManagement;
