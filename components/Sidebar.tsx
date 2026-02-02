
import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  AlertTriangle,
  Settings,
  Factory,
  History as HistoryIcon
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planning', label: 'Programação', icon: CalendarDays },
    { id: 'orders', label: 'Ordens de Serviço', icon: ClipboardList },
    { id: 'teams', label: 'Equipes & Turnos', icon: Users },
    { id: 'shutdowns', label: 'Paradas', icon: AlertTriangle },
    { id: 'assets', label: 'Ativos & Áreas', icon: Factory },
    { id: 'history', label: 'Histórico Semanal', icon: HistoryIcon },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 h-screen fixed left-0 top-0 flex flex-col shadow-xl z-20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Factory className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight">PCM SWM</h1>
          <p className="text-xs text-slate-500 font-medium truncate">Brasil - Bilingues</p>
        </div>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-2 text-sm hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
          Configurações
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
