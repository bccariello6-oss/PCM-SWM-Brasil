import React from 'react';
import { X, FileSpreadsheet, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';

interface ImportTechModalProps {
  onClose: () => void;
  onProceed: () => void;
}

const ImportTechModal: React.FC<ImportTechModalProps> = ({ onClose, onProceed }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100">
              <FileSpreadsheet className="text-indigo-600 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Importar Técnicos (De/Para)</h2>
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
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <h3>Colunas Obrigatórias (Cabeçalho)</h3>
            </div>
            <p className="text-sm text-slate-500">O arquivo deve conter as colunas exatamente com estes nomes na primeira linha:</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {['Nome', 'Disciplina', 'Turno'].map(col => (
                <div key={col} className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700 text-center">
                  {col} <span className="text-[10px] font-normal">(obrigatório)</span>
                </div>
              ))}
              {['Líder', 'E-mail', 'WhatsApp'].map(col => (
                <div key={col} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 text-center">
                  {col} <span className="text-[10px] font-normal">(opcional)</span>
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
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Turnos</p>
                <p className="text-xs text-slate-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                  1º Turno, 2º Turno, 3º Turno, Administrativo
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Líder</p>
                <p className="text-xs text-slate-600">Preencher com "Sim" ou deixar em branco para Não</p>
              </div>
            </div>
          </section>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-900">Atenção ao De/Para!</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                Os nomes das colunas na planilha devem corresponder exatamente aos indicados acima.
                Técnicos com o mesmo <strong>Nome</strong> serão ignorados (evita duplicatas).
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
            className="px-8 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
          >
            Prosseguir com arquivo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportTechModal;
