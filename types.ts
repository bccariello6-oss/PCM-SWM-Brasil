
export enum Discipline {
  MECHANICS = 'Mecânica',
  ELECTRICAL = 'Elétrica',
  INSTRUMENTATION = 'Instrumentação',
  LUBRICATION = 'Lubrificação',
  UTILITIES = 'Utilidades',
  EEP = 'EEP'
}

export enum OSType {
  PREVENTIVE = 'Preventiva',
  CORRECTIVE = 'Corretiva',
  INSPECTION = 'Inspeção',
  IMPROVEMENT = 'Melhoria'
}

export enum OSStatus {
  PLANNED = 'Planejada',
  EXECUTING = 'Em Execução',
  COMPLETED = 'Concluída',
  REPROGRAMMED = 'Reprogramada'
}

export enum Shift {
  FIRST = '1º Turno',
  SECOND = '2º Turno',
  THIRD = '3º Turno',
  ADM = 'Administrativo'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export interface MaintenanceOrder {
  id: string;
  osNumber: string;
  type: OSType;
  area: string;
  tag: string;
  description: string;
  discipline: Discipline;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  estimatedHours: number;
  operationalShutdown: boolean;
  status: OSStatus;
  technicianId?: string;
  collaboratorId?: string;
  scheduledDay?: string;
  scheduledDate?: string;
  logs?: LogEntry[];
  attachments?: string[];
  reprogrammingReason?: string;
}

export interface Technician {
  id: string;
  name: string;
  discipline: Discipline;
  shift: Shift;
  isLeader: boolean;
}

export interface OperationalShutdown {
  id: string;
  machine: string;
  date: string;
  startTime: string;
  duration: number;
  service: string;
  impact: string;
  status: 'Agendada' | 'Em Curso' | 'Concluída';
}

export interface Asset {
  id: string;
  tag: string;
  description: string;
  area: string;
  status: 'Operacional' | 'Em Manutenção' | 'Parado';
  criticality: 'A' | 'B' | 'C';
}

export interface WeeklyStats {
  totalOS: number;
  totalHours: number;
  completedOS: number;
  shutdownCount: number;
}

export interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface OrderFilters {
  discipline: string;
  technicianId: string;
  priority: string;
  status: string;
  searchTerm: string;
  operationalShutdown: boolean | 'All';
  area: string;
}

