
import React from 'react';
import { MaintenanceOrder, Technician, OSStatus } from '../types';
import { DISCIPLINE_COLORS, STATUS_COLORS } from '../constants';
import { 
  MoreVertical, 
  Edit2, 
  Clock, 
  Tag, 
  MapPin, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
  Paperclip,
  Loader2,
  User,
  Users
} from 'lucide-react';

interface WorkOrderListProps {
  orders: MaintenanceOrder[];
  technicians: Technician[];
  onEdit: (os: MaintenanceOrder) => void;
  isLoading?: boolean;
}

const WorkOrderList: React.FC<WorkOrderListProps> = ({ orders, technicians, onEdit, isLoading }) => {
  const getTechName = (id?: string) => technicians.find(t => t.id === id)?.name || 'Não atribuído';

  const getStatusIcon = (status: OSStatus) => {
    switch (status) {
      case OSStatus.PLANNED: return <Calendar className="w-3.5 h-3.5" />;
      case OSStatus.EXECUTING: return <PlayCircle className="w-3.5 h-3.5" />;
      case OSStatus.COMPLETED: return <CheckCircle2 className="w-3.5 h-3.5" />;
      case OSStatus.REPROGRAMMED: return <RotateCcw className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">OS / Tag</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição / Área</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Disciplina</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Técnico</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Colaborador</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">H. Est.</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4"><div className="h-8 bg-slate-100 rounded-lg w-24"></div></td>
                  <td className="p-4"><div className="h-8 bg-slate-100 rounded-lg w-full"></div></td>
                  <td className="p-4"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                  <td className="p-4"><div className="h-8 bg-slate-100 rounded-lg w-32"></div></td>
                  <td className="p-4"><div className="h-8 bg-slate-100 rounded-lg w-32"></div></td>
                  <td className="p-4"><div className="h-6 bg-slate-100 rounded-lg w-12 mx-auto"></div></td>
                  <td className="p-4"><div className="h-8 bg-slate-100 rounded-lg w-20"></div></td>
                  <td className="p-4 text-right"><div className="h-8 bg-slate-100 rounded-lg w-8 ml-auto"></div></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-400">
                   <div className="flex flex-col items-center gap-2">
                     <AlertTriangle className="w-8 h-8 opacity-20" />
                     <p className="font-medium">Nenhuma ordem de serviço encontrada.</p>
                   </div>
                </td>
              </tr>
            ) : (
              orders.map((os) => (
                <tr key={os.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-blue-600">#{os.osNumber}</span>
                        {os.attachments && os.attachments.length > 0 && (
                          <Paperclip className="w-3 h-3 text-blue-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase mt-1">
                        <Tag className="w-3 h-3" />
                        {os.tag}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 max-w-[250px]">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-800 line-clamp-1" title={os.description}>
                        {os.description}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {os.area}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full text-white font-bold inline-flex items-center gap-1.5 ${DISCIPLINE_COLORS[os.discipline]}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      {os.discipline}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                        {getTechName(os.technicianId).charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{getTechName(os.technicianId)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {os.collaboratorId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-100">
                          {getTechName(os.collaboratorId).charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-slate-600 italic whitespace-nowrap">{getTechName(os.collaboratorId)}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-medium italic">Nenhum</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                      <Clock className="w-3 h-3" />
                      {os.estimatedHours}h
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-2 w-fit ${STATUS_COLORS[os.status]}`}>
                      {getStatusIcon(os.status)}
                      {os.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(os)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Visualizar/Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs font-medium text-slate-500">
        <span>Mostrando {orders.length} ordens de serviço</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50">Anterior</button>
          <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">Próximo</button>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderList;
