
import React, { useState } from 'react';
import { Asset } from '../types';
import { AREAS } from '../constants';
import { 
  Factory, 
  Tag, 
  MapPin, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Activity, 
  ShieldAlert,
  ChevronRight,
  Database
} from 'lucide-react';

interface AssetManagementProps {
  assets: Asset[];
  onAdd: () => void;
}

const AssetManagement: React.FC<AssetManagementProps> = ({ assets, onAdd }) => {
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [assetSearch, setAssetSearch] = useState('');

  const filteredAssets = assets.filter(a => {
    const matchesArea = selectedArea === 'All' || a.area === selectedArea;
    const matchesSearch = a.tag.toLowerCase().includes(assetSearch.toLowerCase()) || 
                          a.description.toLowerCase().includes(assetSearch.toLowerCase());
    return matchesArea && matchesSearch;
  });

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'Operacional': return 'bg-emerald-500';
      case 'Em Manutenção': return 'bg-amber-500';
      case 'Parado': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const getCriticalityColor = (crit: Asset['criticality']) => {
    switch (crit) {
      case 'A': return 'text-red-600 bg-red-50 border-red-100';
      case 'B': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'C': return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="flex gap-8 h-full min-h-0">
      {/* Sidebar - Area Navigation */}
      <div className="w-72 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Áreas Industriais</h3>
          <nav className="space-y-1">
            <button 
              onClick={() => setSelectedArea('All')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                selectedArea === 'All' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4" />
                Todos os Ativos
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedArea === 'All' ? 'bg-white/20' : 'bg-slate-100'}`}>
                {assets.length}
              </span>
            </button>
            {AREAS.map(area => (
              <button 
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  selectedArea === area ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Factory className="w-4 h-4 opacity-70" />
                  <span className="truncate max-w-[120px]">{area}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedArea === area ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {assets.filter(a => a.area === area).length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-blue-900 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Integridade Geral</p>
          <p className="text-2xl font-black text-white">98.4%</p>
          <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-[98%]" />
          </div>
          <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors border border-white/10">
            Relatório de Ativos
          </button>
        </div>
      </div>

      {/* Main Content - Asset List */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por TAG ou Descrição..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={assetSearch}
              onChange={e => setAssetSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
              <Filter className="w-4 h-4" /> Filtros
            </button>
            <button 
              onClick={onAdd}
              className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all"
            >
              <Plus className="w-4 h-4" /> Novo Ativo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-6">
          {filteredAssets.map(asset => (
            <div key={asset.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-blue-300 transition-colors group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(asset.status)}`} />
                  <span className="text-sm font-black text-slate-800 tracking-tight">{asset.tag}</span>
                </div>
                <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-sm font-bold text-slate-700 mb-4 line-clamp-1">{asset.description}</h4>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${getCriticalityColor(asset.criticality)}`}>
                    CRIT. {asset.criticality}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                    <MapPin className="w-3 h-3" />
                    {asset.area}
                  </div>
                </div>
                <button className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                  Histórico OS <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {filteredAssets.length === 0 && (
            <div className="col-span-full p-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center">
              <ShieldAlert className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium italic">Nenhum ativo corresponde à busca na área {selectedArea === 'All' ? 'selecionada' : selectedArea}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetManagement;
