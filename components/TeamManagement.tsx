
import React from 'react';
import { Technician, MaintenanceOrder, Shift } from '../types';
import { DISCIPLINE_COLORS } from '../constants';
import { 
  Users, 
  HardHat, 
  Clock, 
  Briefcase, 
  AlertCircle, 
  TrendingUp,
  Mail,
  Phone,
  Plus,
  Edit2,
  Trash2,
  Loader2
} from 'lucide-react';

interface TeamManagementProps {
  technicians: Technician[];
  orders: MaintenanceOrder[];
  isLoading?: boolean;
  onAddTechnician: () => void;
  onEditTechnician: (tech: Technician) => void;
  onDeleteTechnician: (techId: string) => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ 
  technicians, 
  orders, 
  isLoading,
  onAddTechnician, 
  onEditTechnician,
  onDeleteTechnician 
}) => {
  const shifts = Object.values(Shift);

  const getTechLoad = (techId: string) => {
    const techOrders = orders.filter(o => o.technicianId === techId || o.collaboratorId === techId);
    return {
      count: techOrders.length,
      hours: techOrders.reduce((acc, o) => acc + o.estimatedHours, 0)
    };
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Recursos e Efetivo</h3>
          <p className="text-sm text-slate-500">Gestão de técnicos, líderes e escalas de trabalho</p>
        </div>
        <button 
          onClick={onAddTechnician}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Técnico
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Efetivo Total</p>
            <p className="text-2xl font-bold text-slate-900">{technicians.length} <span className="text-sm font-medium text-slate-500">Técnicos</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <Clock className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disponibilidade</p>
            <p className="text-2xl font-bold text-slate-900">92% <span className="text-sm font-medium text-emerald-500">Normal</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Carga Média</p>
            <p className="text-2xl font-bold text-slate-900">28h <span className="text-sm font-medium text-slate-500">/ semana</span></p>
          </div>
        </div>
      </div>

      {/* Technicians by Shift */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm h-48 animate-pulse">
                  <div className="p-5 flex gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="px-5 py-4 border-y border-slate-50 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                  </div>
                </div>
             ))}
          </div>
        ) : technicians.length === 0 ? (
          <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
             <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-medium">Nenhum técnico cadastrado.</p>
          </div>
        ) : (
          shifts.map(shift => {
            const shiftTechs = technicians.filter(t => t.shift === shift);
            if (shiftTechs.length === 0) return null;

            return (
              <div key={shift} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-slate-300 rounded-full" />
                  <h3 className="text-lg font-bold text-slate-800">{shift}</h3>
                  <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {shiftTechs.length} profissionais
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shiftTechs.map(tech => {
                    const load = getTechLoad(tech.id);
                    const isOverloaded = load.hours > 40;

                    return (
                      <div key={tech.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white ring-2 ring-slate-50 group-hover:scale-110 transition-transform">
                                <HardHat className="w-6 h-6 text-slate-400" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 leading-tight">{tech.name}</h4>
                                <p className="text-xs font-medium text-slate-500">{tech.isLeader ? 'Líder de Equipe' : 'Técnico Especialista'}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                               <span className={`text-[10px] font-bold px-2 py-1 rounded-full text-white uppercase ${DISCIPLINE_COLORS[tech.discipline]}`}>
                                  {tech.discipline}
                               </span>
                               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => onEditTechnician(tech)}
                                   className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg"
                                 >
                                   <Edit2 className="w-3.5 h-3.5" />
                                 </button>
                                 <button 
                                   onClick={() => onDeleteTechnician(tech.id)}
                                   className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-600 rounded-lg"
                                 >
                                   <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                               </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                            <div>
                              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Tarefas</span>
                              </div>
                              <p className="text-sm font-bold text-slate-800">{load.count} OS Atribuídas</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Carga Horária</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <p className={`text-sm font-bold ${isOverloaded ? 'text-red-600' : 'text-slate-800'}`}>
                                  {load.hours}h Planejadas
                                </p>
                                {isOverloaded && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-1 flex items-center justify-between">
                            <div className="flex gap-1.5">
                               <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                 <Mail className="w-4 h-4" />
                               </button>
                               <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                 <Phone className="w-4 h-4" />
                               </button>
                            </div>
                            <button className="text-xs font-bold text-blue-600 px-3 py-1.5 hover:bg-blue-50 rounded-xl transition-colors">
                              Ver Escala
                            </button>
                          </div>
                        </div>
                        
                        <div className="h-1 bg-slate-100 w-full">
                          <div 
                            className={`h-full transition-all duration-500 ${isOverloaded ? 'bg-red-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min((load.hours / 44) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
