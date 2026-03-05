import { format, parseISO, isAfter, differenceInHours } from 'date-fns';

export interface Activity {
  id: string;
  description: string;
  start_date: string;
  end_date: string;
  duration: number;
  responsibility: string;
  critical_path: boolean;
  criticality?: string;
  category: string;
  os?: string;
  resource?: string;
  percent_progress: number;
  weight: number;
  status_calculated?: string;
  delay_calculated?: number;
  last_update?: string;
  is_extra?: boolean;
  is_cancelled?: boolean;
}

export interface ProgressLog {
  id: number;
  activity_id: string;
  percent: number;
  comment: string;
  evidence_url?: string;
  user_id: number;
  timestamp: string;
}

export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'RESPONSIBLE';
}

export const calculateActivityStatus = (activity: Activity) => {
  const now = new Date();
  const start = parseISO(activity.start_date);
  const end = parseISO(activity.end_date);
  
  if (activity.percent_progress >= 100) return 'Concluída';
  if (activity.is_cancelled) return 'Cancelada';
  
  if (isAfter(now, end) && activity.percent_progress < 100) {
    return 'Pendente';
  }
  
  if (isAfter(now, start)) {
    return 'Em Andamento';
  }
  
  return 'Não Iniciada';
};

export const calculateDelay = (activity: Activity) => {
  const now = new Date();
  const end = parseISO(activity.end_date);
  
  if (activity.percent_progress >= 100 || !isAfter(now, end)) return 0;
  
  return differenceInHours(now, end);
};

export const calculateExpectedProgress = (activity: Activity) => {
  const now = new Date();
  const start = parseISO(activity.start_date);
  const end = parseISO(activity.end_date);
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  if (totalDuration <= 0) return 100;
  
  return Math.min(100, Math.round((elapsed / totalDuration) * 100));
};
