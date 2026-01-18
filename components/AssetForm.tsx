
import React, { useState } from 'react';
import { X, Save, Factory, Tag, Info, ShieldAlert, Activity } from 'lucide-react';
import { Asset } from '../types';
import { AREAS } from '../constants';

interface AssetFormProps {
  asset?: Partial<Asset>;
  onClose: () => void;
  onSave: (asset: Asset) => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ asset, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Asset>>(asset || {
    tag: '',
    description: '',
    area: AREAS[0],
    status: 'Operacional',
    criticality: 'C'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tag || !formData.description) return;
    onSave(formData as Asset);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600">
              <Factory className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {asset?.id ? 'Editar Ativo' : 'Novo Ativo Industrial'}
              </h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Gestão de Equipamentos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Tag className="w-3 h-3" /> TAG / Identificação
              </label>
              <input
                required
                type="text"
                placeholder="Ex: 10-PM1-MOT-01"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={formData.tag || ''}
                onChange={e => setFormData({ ...formData, tag: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <ShieldAlert className="w-3 h-3" /> Criticidade
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
                value={formData.criticality}
                onChange={e => setFormData({ ...formData, criticality: e.target.value as any })}
              >
                <option value="A">Classe A (Alta)</option>
                <option value="B">Classe B (Média)</option>
                <option value="C">Classe C (Baixa)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Info className="w-3 h-3" /> Descrição do Equipamento
            </label>
            <input
              required
              type="text"
              placeholder="Ex: Motor de Acionamento Principal MP1"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Factory className="w-3 h-3" /> Área Industrial
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
                value={formData.area}
                onChange={e => setFormData({ ...formData, area: e.target.value })}
              >
                {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Activity className="w-3 h-3" /> Status Inicial
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="Operacional">Operacional</option>
                <option value="Em Manutenção">Em Manutenção</option>
                <option value="Parado">Parado</option>
              </select>
            </div>
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
            Salvar Ativo
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetForm;
