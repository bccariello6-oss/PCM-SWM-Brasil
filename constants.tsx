
import { Discipline, OSStatus } from './types';

export const AREAS = [
  'Preparo de Massa',
  'MP-1',
  'MP-3',
  'MP-6',
  'Caldeiras',
  'Utilidades (ETE/ETA)',
  'Subestação',
  'SLA Bobinadeiras'
];

export const WEEK_DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export const DISCIPLINE_COLORS: Record<Discipline, string> = {
  [Discipline.MECHANICS]: 'bg-blue-600',
  [Discipline.ELECTRICAL]: 'bg-yellow-500',
  [Discipline.INSTRUMENTATION]: 'bg-purple-600',
  [Discipline.LUBRICATION]: 'bg-emerald-500',
  [Discipline.UTILITIES]: 'bg-slate-500',
  [Discipline.EEP]: 'bg-indigo-700'
};

export const STATUS_COLORS: Record<OSStatus, string> = {
  [OSStatus.PLANNED]: 'border-slate-300 text-slate-600',
  [OSStatus.EXECUTING]: 'border-blue-500 text-blue-700 bg-blue-50',
  [OSStatus.COMPLETED]: 'border-green-500 text-green-700 bg-green-50',
  [OSStatus.REPROGRAMMED]: 'border-orange-400 text-orange-700 bg-orange-50'
};
