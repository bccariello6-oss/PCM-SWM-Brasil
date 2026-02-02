import {
  MaintenanceOrder,
  Technician,
  OperationalShutdown,
  Asset
} from './types';

export const mockShutdowns: OperationalShutdown[] = [
  // MP06 - Monthly Recurrence (Example: 2nd Tuesday of every month)
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `mp06-jan-${i}`,
    machine: 'MP06',
    date: `2026-${String(i + 1).padStart(2, '0')}-13`, // Simplificado para dia 13
    startTime: '08:00',
    duration: 12,
    service: 'Manutenção Mensal Preventiva MP06',
    impact: 'Parada total da linha 06',
    status: 'Agendada' as const
  })),
  // MP01 - Pre-fixed dates
  {
    id: 'mp01-q1',
    machine: 'MP01',
    date: '2026-02-15',
    startTime: '07:00',
    duration: 24,
    service: 'Revisão Geral do Cilindro Secador',
    impact: 'Parada total MP01',
    status: 'Agendada' as const
  },
  {
    id: 'mp01-q2',
    machine: 'MP01',
    date: '2026-05-10',
    startTime: '07:00',
    duration: 12,
    service: 'Troca de Vestimentas',
    impact: 'Parada Setor de Formação',
    status: 'Agendada' as const
  },
  // MP03 - Pre-fixed dates
  {
    id: 'mp03-q1',
    machine: 'MP03',
    date: '2026-03-20',
    startTime: '08:00',
    duration: 8,
    service: 'Inspeção Detalhada de Rolamentos',
    impact: 'Parada MP03',
    status: 'Agendada' as const
  }
];

export const mockAssets: Asset[] = [];
export const mockTechnicians: Technician[] = [];
export const mockOS: MaintenanceOrder[] = [];
