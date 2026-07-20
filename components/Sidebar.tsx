
import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  AlertTriangle,
  Factory
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  expanded: boolean;
  onHover: (hovering: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, expanded, onHover }) => {
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
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`${expanded ? 'w-64' : 'w-16'} bg-slate-900 text-slate-300 h-screen fixed left-0 top-0 flex flex-col shadow-xl z-20 transition-all duration-200 ease-out will-change-transform`}
    >
      <div className={`${expanded ? 'p-5' : 'p-3.5'} flex items-center gap-3 border-b border-slate-800 transition-all duration-200 ${expanded ? 'justify-start' : 'justify-center'}`}>
        <div className="bg-blue-swm p-2 rounded-lg shrink-0">
          <Factory className="text-white w-6 h-6" />
        </div>
        <div className={`overflow-hidden transition-all duration-200 ${expanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
          <h1 className="text-white font-bold text-lg tracking-tight whitespace-nowrap">PCM SWM</h1>
        </div>
      </div>

      <nav className="flex-1 mt-4 px-3.5 flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center rounded-2xl transition-all duration-150 group ${
                expanded ? 'gap-3.5 px-5 py-3.5' : 'justify-center h-[56px]'
              } ${isActive
                ? 'bg-blue-swm text-white relative before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:bg-blue-swm-2 before:rounded-r-full'
                : 'hover:bg-blue-swm/20 hover:text-white'
              }`}
              title={!expanded ? item.label : undefined}
            >
              <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-swm-2'}`} />
              <span className={`font-medium text-base overflow-hidden transition-all duration-200 ${
                expanded ? 'w-auto opacity-100 ml-0' : 'w-0 opacity-0 ml-0'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
