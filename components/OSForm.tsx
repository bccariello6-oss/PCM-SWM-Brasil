
import React, { useState, useRef } from 'react';
import { X, Save, Trash2, Settings2, UserPlus, User, History, Info, ChevronRight, Paperclip, FileText, UploadCloud, AlertCircle } from 'lucide-react';
import { MaintenanceOrder, Discipline, OSType, OSStatus, Technician, LogEntry } from '../types';
import { AREAS, DISCIPLINE_COLORS, WEEK_DAYS } from '../constants';


interface OSFormProps {
  os?: Partial<MaintenanceOrder>;
  technicians: Technician[];
  onClose: () => void;
  onSave: (os: MaintenanceOrder, shouldClose?: boolean) => void;
}

const OSForm: React.FC<OSFormProps> = ({ os, technicians, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'attachments'>('details');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<MaintenanceOrder>>({
    status: OSStatus.PLANNED,
    discipline: Discipline.MECHANICS,
    type: OSType.PREVENTIVE,
    priority: 'Média',
    estimatedHours: 1,
    operationalShutdown: false,
    scheduledDay: 'Segunda',
    scheduledDate: '',
    logs: [],
    attachments: [],
    reprogrammingReason: '',
    ...os
  });

  const handleSubmit = (e: React.FormEvent, shouldClose: boolean = true) => {
    e.preventDefault();
    if (!formData.osNumber) return;
    onSave(formData as MaintenanceOrder, shouldClose);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newNames = Array.from(files).map((f: File) => f.name);
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newNames]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${formData.discipline ? DISCIPLINE_COLORS[formData.discipline as Discipline] : 'bg-blue-600'}`}>
              <Settings2 className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {os?.id ? `OS #${os.osNumber}` : 'Nova Ordem de Serviço'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PCM Industrial</span>
                {os?.id && (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                    ID: {os.id}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${activeTab === 'details' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Info className="w-4 h-4" />
            Dados da OS
            {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${activeTab === 'attachments' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Paperclip className="w-4 h-4" />
            Anexos
            {formData.attachments && formData.attachments.length > 0 && (
              <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {formData.attachments.length}
              </span>
            )}
            {activeTab === 'attachments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <History className="w-4 h-4" />
            Histórico
            {formData.logs && formData.logs.length > 0 && (
              <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {formData.logs.length}
              </span>
            )}
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'details' && (
            <form id="os-form" onSubmit={(e) => handleSubmit(e, true)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Número da OS</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: 4500123"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    value={formData.osNumber || ''}
                    onChange={e => setFormData({ ...formData, osNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Manutenção</label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
                    value={formData.type || OSType.PREVENTIVE}
                    onChange={e => setFormData({ ...formData, type: e.target.value as OSType })}
                  >
                    <option value="" disabled>Selecione o tipo...</option>
                    {Object.values(OSType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição da Atividade</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva detalhadamente o que será executado..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Atribuição de Equipe</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all text-sm"
                        value={formData.technicianId || ''}
                        onChange={e => setFormData({ ...formData, technicianId: e.target.value })}
                      >
                        <option value="">Responsável Principal...</option>
                        {technicians.map(t => <option key={t.id} value={t.id}>{t.name} ({t.discipline})</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all text-sm"
                        value={formData.collaboratorId || ''}
                        onChange={e => setFormData({ ...formData, collaboratorId: e.target.value })}
                      >
                        <option value="">Colaborador / Ajudante...</option>
                        {technicians.map(t => (
                          <option
                            key={t.id}
                            value={t.id}
                            disabled={t.id === formData.technicianId}
                          >
                            {t.name} ({t.discipline})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Dia da Semana</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
                      value={formData.scheduledDay}
                      onChange={e => {
                        const newDay = e.target.value;
                        // If we have a scheduledDate, we should update it to match the new day of that week
                        if (formData.scheduledDate) {
                          const date = new Date(formData.scheduledDate + 'T12:00:00');
                          const currentDay = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][date.getDay()];
                          const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
                          const diff = days.indexOf(newDay) - days.indexOf(currentDay);
                          date.setDate(date.getDate() + diff);
                          setFormData({ ...formData, scheduledDay: newDay, scheduledDate: date.toISOString().split('T')[0] });
                        } else {
                          setFormData({ ...formData, scheduledDay: newDay });
                        }
                      }}
                    >
                      {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Data Planejada</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
                      value={formData.scheduledDate || ''}
                      onChange={e => {
                        const newDateStr = e.target.value;
                        const date = new Date(newDateStr + 'T12:00:00');
                        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                        setFormData({ ...formData, scheduledDate: newDateStr, scheduledDay: dayNames[date.getDay()] });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all font-bold"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as OSStatus })}
                    >
                      {Object.values(OSStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {formData.status === OSStatus.REPROGRAMMED && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <label className="text-xs font-bold text-orange-800 uppercase">Motivo da Reprogramação</label>
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Informe por que esta OS está sendo reprogramada..."
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all bg-white text-sm"
                    value={formData.reprogrammingReason || ''}
                    onChange={e => setFormData({ ...formData, reprogrammingReason: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Área Industrial</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                  >
                    <option value="">Selecione a área...</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">TAG / Ativo</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: 10-PM1-MOT-01"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    value={formData.tag || ''}
                    onChange={e => setFormData({ ...formData, tag: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Disciplina</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
                    value={formData.discipline}
                    onChange={e => setFormData({ ...formData, discipline: e.target.value as Discipline })}
                  >
                    {Object.values(Discipline).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Prioridade</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">H. Estimadas</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    value={formData.estimatedHours || ''}
                    onChange={e => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input
                  type="checkbox"
                  id="shutdown"
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.operationalShutdown}
                  onChange={e => setFormData({ ...formData, operationalShutdown: e.target.checked })}
                />
                <label htmlFor="shutdown" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                  Requer Parada Operacional do Ativo
                </label>
              </div>
            </form>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700">Clique para anexar arquivos</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, DOCX (Max 10MB)</p>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileAttach}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase px-2">Arquivos Anexados ({formData.attachments?.length || 0})</h3>
                <div className="grid grid-cols-1 gap-2">
                  {formData.attachments?.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <FileText className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[400px]">{file}</span>
                      </div>
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!formData.attachments || formData.attachments.length === 0) && (
                    <div className="py-12 text-center text-slate-400 flex flex-col items-center">
                      <Paperclip className="w-12 h-12 opacity-10 mb-2" />
                      <p className="text-xs font-medium">Nenhum anexo encontrado.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8">
              {!formData.logs || formData.logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <History className="w-12 h-12 opacity-10 mb-4" />
                  <p className="font-medium">Nenhum histórico registrado.</p>
                </div>
              ) : (
                <div className="relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {formData.logs.slice().reverse().map((log, index) => (
                    <div key={log.id} className="relative pl-10 pb-8 last:pb-0">
                      <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-500 shadow-sm z-10" />
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">{log.action}</span>
                            {log.field && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                                {log.field}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">
                            {formatDate(log.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-2">
                          <User className="w-3 h-3" />
                          Por <span className="font-bold text-slate-700">{log.userName}</span>
                        </div>
                        {(log.oldValue || log.newValue) && (
                          <div className="flex items-center gap-2 text-[10px] font-medium p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-slate-400 line-through truncate max-w-[100px]">{log.oldValue || 'N/A'}</span>
                            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                            <span className="text-blue-600 font-bold">{log.newValue || 'N/A'}</span>
                          </div>
                        )}
                        {log.field === 'status' && log.newValue === OSStatus.REPROGRAMMED && formData.reprogrammingReason && (
                          <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-100 text-[10px]">
                            <p className="text-orange-800 font-bold uppercase mb-1">Motivo:</p>
                            <p className="text-orange-700 italic">{formData.reprogrammingReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between gap-3 items-center">
          {os?.id ? (
            <button type="button" className="px-6 py-3 text-red-600 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Excluir
            </button>
          ) : <div />}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={(e) => handleSubmit(e, false)}
              className="px-6 py-3 bg-white border border-blue-200 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2"
            >
              Salvar e Continuar
            </button>
            <button
              onClick={(e) => handleSubmit(e, true)}
              className="px-8 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar e Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSForm;
