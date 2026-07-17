
import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  AlertTriangle,
  Settings,
  Factory
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  expanded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, expanded }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planning', label: 'Programação', icon: CalendarDays },
    { id: 'orders', label: 'Ordens de Serviço', icon: ClipboardList },
    { id: 'teams', label: 'Equipes & Turnos', icon: Users },
    { id: 'shutdowns', label: 'Paradas', icon: AlertTriangle },
    { id: 'assets', label: 'Ativos & Áreas', icon: Factory },
  ];

  return (
    <div
      className={`${expanded ? 'w-64' : 'w-16'} bg-slate-900 text-slate-300 h-screen fixed left-0 top-0 flex flex-col shadow-xl z-20 transition-all duration-300`}
    >
      <div className={`${expanded ? 'p-6' : 'p-4'} flex items-center gap-3 border-b border-slate-800 transition-all duration-300 ${expanded ? 'justify-start' : 'justify-center'}`}>
        <div className="bg-blue-600 p-2 rounded-lg shrink-0">
          <Factory className="text-white w-6 h-6" />
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
          <h1 className="text-white font-bold text-lg tracking-tight whitespace-nowrap">PCM SWM</h1>
        </div>
      </div>

      <nav className="flex-1 mt-6 space-y-2 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center ${expanded ? 'gap-3 px-4' : 'gap-0 justify-center px-0'} ${expanded ? 'py-3' : 'py-3.5'} rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'hover:bg-slate-800 hover:text-white'
                }`}
              title={!expanded ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
              <span className={`font-medium text-sm overflow-hidden transition-all duration-300 ${expanded ? 'w-auto opacity-100 ml-0' : 'w-0 opacity-0 ml-0'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className={`${expanded ? 'p-6' : 'p-4'} border-t border-slate-800 transition-all duration-300 ${expanded ? 'justify-start' : 'justify-center'}`}>
        <button className={`flex items-center ${expanded ? 'gap-3' : 'justify-center'} px-4 py-2 text-sm hover:text-white transition-colors w-full`}>
          <Settings className="w-4 h-4 shrink-0" />
          <span className={`overflow-hidden transition-all duration-300 ${expanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
            Configurações
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
