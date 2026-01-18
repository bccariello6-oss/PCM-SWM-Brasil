
import React from 'react';
import { MaintenanceOrder, Technician, Discipline } from '../types';
import { WEEK_DAYS, DISCIPLINE_COLORS, STATUS_COLORS } from '../constants';
import { Clock, Tag, MapPin, HardHat, Users, Plus, AlertCircle, Paperclip } from 'lucide-react';

interface WeeklyGridProps {
  orders: MaintenanceOrder[];
  technicians: Technician[];
  onOrderClick: (os: MaintenanceOrder) => void;
  onAddOrder: (techId: string, day: string) => void;
}

const WeeklyGrid: React.FC<WeeklyGridProps> = ({ orders, technicians, onOrderClick, onAddOrder }) => {
  const getTechName = (id?: string) => technicians.find(t => t.id === id)?.name || '';

  const getTechWeeklyLoad = (techId: string) => {
    return orders
      .filter(o => o.technicianId === techId || o.collaboratorId === techId)
      .reduce((acc, o) => acc + o.estimatedHours, 0);
  };

  const getTechDailyLoad = (techId: string, day: string) => {
    return orders
      .filter(o => (o.technicianId === techId || o.collaboratorId === techId) && o.scheduledDay === day)
      .reduce((acc, o) => acc + o.estimatedHours, 0);
  };

  const DAILY_CAPACITY = 8.5; // Standard 8.5h shift
  const WEEKLY_CAPACITY = 44;

  const getLoadColor = (hours: number, capacity: number) => {
    const ratio = hours / capacity;
    if (ratio > 1) return 'bg-red-500';
    if (ratio > 0.8) return 'bg-amber-500';
    if (ratio > 0) return 'bg-blue-500';
    return 'bg-slate-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      {/* Grid Header */}
      <div className="grid grid-cols-[220px_repeat(7,1fr)] bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
        <div className="p-4 font-bold text-slate-600 border-r border-slate-200">Recurso / Carga Semanal</div>
        {WEEK_DAYS.map(day => (
          <div key={day} className="p-4 text-center font-bold text-slate-600 border-r border-slate-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="overflow-y-auto flex-1">
        {technicians.map(tech => {
          const weeklyHours = getTechWeeklyLoad(tech.id);
          const loadPercentage = Math.min((weeklyHours / WEEKLY_CAPACITY) * 100, 100);
          const isOverloaded = weeklyHours > WEEKLY_CAPACITY;

          return (
            <div key={tech.id} className="grid grid-cols-[220px_repeat(7,1fr)] border-b border-slate-100 group">
              {/* Tech Info */}
              <div className="p-4 border-r border-slate-200 bg-slate-50/50 group-hover:bg-slate-100 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <HardHat className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-sm text-slate-800 truncate" title={tech.name}>{tech.name}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white w-fit ${DISCIPLINE_COLORS[tech.discipline]}`}>
                      {tech.discipline}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{tech.shift}</span>
                  </div>
                </div>

                {/* Daily Distribution Mini-Indicator */}
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center px-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Carga Diária</span>
                    <div className="flex gap-0.5">
                      {WEEK_DAYS.map(day => {
                        const h = getTechDailyLoad(tech.id, day);
                        return (
                          <div 
                            key={day} 
                            className={`w-1.5 h-3 rounded-[1px] ${getLoadColor(h, DAILY_CAPACITY)} opacity-60`}
                            title={`${day}: ${h}h`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Weekly Load Indicator */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${isOverloaded ? 'text-red-600' : 'text-slate-400'}`}>
                        Total: {weeklyHours}h / {WEEKLY_CAPACITY}h
                      </span>
                      {isOverloaded && <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />}
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${isOverloaded ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${loadPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Cells */}
              {WEEK_DAYS.map(day => {
                const dayOrders = orders.filter(o => o.technicianId === tech.id && o.scheduledDay === day);
                const dayHours = getTechDailyLoad(tech.id, day);
                const dailyLoadPercent = Math.min((dayHours / DAILY_CAPACITY) * 100, 100);
                const isDayOverloaded = dayHours > DAILY_CAPACITY;

                return (
                  <div key={day} className="p-2 border-r border-slate-100 min-h-[160px] bg-white group-hover:bg-slate-50/30 transition-colors relative flex flex-col">
                    {/* Daily Load Header Indicator */}
                    {dayHours > 0 && (
                      <div className="mb-2 flex flex-col gap-1">
                        <div className="flex justify-between items-center px-1">
                          <span className={`text-[8px] font-black uppercase ${isDayOverloaded ? 'text-red-600' : 'text-slate-400'}`}>
                            {dayHours}h / {DAILY_CAPACITY}h
                          </span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${isDayOverloaded ? 'bg-red-500' : 'bg-blue-400'}`}
                            style={{ width: `${dailyLoadPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 mb-2">
                      {dayOrders.map(os => (
                        <button
                          key={os.id}
                          onClick={() => onOrderClick(os)}
                          className={`p-2 rounded-lg border-l-4 shadow-sm text-left transition-all hover:scale-[1.02] hover:shadow-md ${STATUS_COLORS[os.status]}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold">OS {os.osNumber}</span>
                              {os.attachments && os.attachments.length > 0 && (
                                <Paperclip 
                                  className="w-2.5 h-2.5 text-blue-600" 
                                  title={`${os.attachments.length} anexo(s)`} 
                                />
                              )}
                            </div>
                            <span className="text-[10px] font-medium opacity-70 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {os.estimatedHours}h
                            </span>
                          </div>
                          <p className="text-[11px] font-medium line-clamp-2 mb-2">{os.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-auto">
                             <div className="flex items-center gap-1 opacity-60">
                               <Tag className="w-2.5 h-2.5" />
                               <span className="text-[9px] font-bold">{os.tag}</span>
                             </div>
                             <div className="flex items-center gap-1 opacity-60">
                               <MapPin className="w-2.5 h-2.5" />
                               <span className="text-[9px] font-bold">{os.area}</span>
                             </div>
                             {os.collaboratorId && (
                               <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1 rounded">
                                 <Users className="w-2.5 h-2.5" />
                                 <span className="text-[9px] font-black truncate max-w-[60px]" title={getTechName(os.collaboratorId)}>
                                   {getTechName(os.collaboratorId)}
                                 </span>
                               </div>
                             )}
                          </div>

                          {os.operationalShutdown && (
                            <div className="mt-2 py-0.5 px-1 bg-red-100 text-red-700 text-[8px] font-black rounded uppercase text-center border border-red-200">
                              Parada Requerida
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {/* Add Order Button - visible on hover or when empty */}
                    <button 
                      onClick={() => onAddOrder(tech.id, day)}
                      className={`mt-auto w-full py-2 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all ${dayOrders.length === 0 ? 'flex-1' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">Planejar</span>
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyGrid;
