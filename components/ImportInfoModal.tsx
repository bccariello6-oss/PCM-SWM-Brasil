
import React from 'react';
import { X, FileSpreadsheet, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';

interface ImportInfoModalProps {
  onClose: () => void;
  onProceed: () => void;
}

const ImportInfoModal: React.FC<ImportInfoModalProps> = ({ onClose, onProceed }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <FileSpreadsheet className="text-emerald-600 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Guia de Importação XLSX</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Padrão de Colunas e Valores</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h3>Colunas Obrigatórias (Cabeçalho)</h3>
            </div>
            <p className="text-sm text-slate-500">O arquivo deve conter as colunas exatamente com estes nomes na primeira linha:</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {['OS', 'Descrição', 'TAG', 'Área', 'Disciplina', 'Tipo', 'Prioridade', 'Horas', 'Dia', 'Técnico', 'Parada'].map(col => (
                <div key={col} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 text-center">
                  {col}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
              <Info className="w-4 h-4 text-blue-500" />
              <h3>Dicionário de Valores Aceitos</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Disciplinas</p>
                <p className="text-xs text-slate-600 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                  Mecânica, Elétrica, Instrumentação, Lubrificação, Utilidades, EEP
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Tipos</p>
                  <p className="text-xs text-slate-600">Preventiva, Corretiva, Inspeção, Melhoria</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Prioridades</p>
                  <p className="text-xs text-slate-600">Baixa, Média, Alta, Crítica</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Dias da Semana</p>
                <p className="text-xs text-slate-600">Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo</p>
              </div>
            </div>
          </section>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-900">Atenção aos nomes!</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                Nomes de <strong>Técnicos</strong> e <strong>Áreas</strong> devem ser idênticos aos cadastrados no sistema. 
                A coluna <strong>Parada</strong> deve conter "Sim" para ativar o destaque operacional.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
          >
            Agora não
          </button>
          <button
            onClick={onProceed}
            className="px-8 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
          >
            Prosseguir com arquivo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportInfoModal;
