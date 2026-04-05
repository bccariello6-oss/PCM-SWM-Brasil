import { Activity, ProgressLog } from './types';
import { parseISO, format, differenceInMinutes, addMinutes } from 'date-fns';

export const generateSCurveData = (activities: Activity[], logs: ProgressLog[]) => {
  // Filter out summary activities and cancelled ones
  const realActivities = activities.filter(a =>
    a.description?.toUpperCase() !== a.category?.toUpperCase() &&
    !a.is_cancelled
  );

  if (realActivities.length === 0) return [];

  // 1. Prepare activity data
  const activityData = realActivities.map(a => {
    const start = parseISO(a.start_date).getTime();
    const end = parseISO(a.end_date).getTime();
    const duration = Math.max(1, end - start);
    return { ...a, start, end, duration };
  });

  const activitiesWithWeights = activityData;

  // 2. Determine Time Range - STRICTLY following imported activities
  const minTime = Math.min(...activitiesWithWeights.map(a => a.start));
  const maxTime = Math.max(...activitiesWithWeights.map(a => a.end));

  const startTime = new Date(minTime);
  const endTime = new Date(maxTime);
  const totalMinutes = differenceInMinutes(endTime, startTime);

  // Discretization: ~60 points for a smooth curve
  const stepMinutes = Math.max(15, Math.floor(totalMinutes / 60));

  const points: Date[] = [];
  let current = startTime;
  while (current <= endTime) {
    points.push(current);
    current = addMinutes(current, stepMinutes);
  }
  if (points.length > 0 && points[points.length - 1].getTime() < endTime.getTime()) {
    points.push(endTime);
  }

  const now = new Date().getTime();

  // 4. Generate Dataset
  return points.map(currentTime => {
    const t = currentTime.getTime();

    // P(t) = Σ (wi * planned_progress_i(t))
    const plannedProgress = activitiesWithWeights.reduce((sum, a) => {
      let contrib = 0;
      if (t <= a.start) contrib = 0;
      else if (t >= a.end) contrib = 1;
      else contrib = (t - a.start) / a.duration;
      return sum + (a.weight * contrib);
    }, 0);

    // R(t) = Σ (wi * ri(t))
    const activityProgressAtT: Record<string, number> = {};
    activitiesWithWeights.forEach(a => {
      // If we have logs for this activity, we'll use them.
      // If not, we distribute the current percent_progress linearly from start to last_update
      const activityLogs = logs.filter(l => l.activity_id === a.id);
      if (activityLogs.length > 0) {
        // Use logs logic
        const latestLogBeforeT = activityLogs
          .filter(l => parseISO(l.timestamp).getTime() <= t)
          .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime())[0];
        activityProgressAtT[a.id] = latestLogBeforeT ? latestLogBeforeT.percent / 100 : 0;
      } else {
        // No logs: distribute current progress linearly from start to last_update
        const progress = a.percent_progress / 100;
        if (progress <= 0) {
          activityProgressAtT[a.id] = 0;
        } else {
          const updateTime = a.last_update ? parseISO(a.last_update).getTime() : a.end;
          if (t <= a.start) {
            activityProgressAtT[a.id] = 0;
          } else if (t >= updateTime) {
            activityProgressAtT[a.id] = progress;
          } else {
            // Linear interpolation between start and updateTime
            const duration = updateTime - a.start;
            if (duration <= 0) activityProgressAtT[a.id] = progress;
            else activityProgressAtT[a.id] = progress * ((t - a.start) / duration);
          }
        }
      }
    });

    const realProgress = activitiesWithWeights.reduce((sum, a) => {
      return sum + (a.weight * (activityProgressAtT[a.id] || 0));
    }, 0);

    const planned = plannedProgress * 100;
    const real = realProgress * 100;

    // Planned activity count: how many activities should be finished by now?
    const plannedCount = activitiesWithWeights.reduce((sum, a) => {
      // If a.end <= t, it should be finished
      return sum + (t >= a.end ? 1 : 0);
    }, 0);

    // Real activity count: how many are ACTUALLY 100%?
    const realCount = activitiesWithWeights.reduce((sum, a) => {
      return sum + (a.percent_progress >= 100 ? 1 : 0);
    }, 0);

    const isMultiDay = totalMinutes > 1440;
    const dateFormat = isMultiDay ? 'dd/MM HH:mm' : 'HH:mm';

    return {
      date: format(currentTime, dateFormat),
      timestamp: t,
      planned: parseFloat(planned.toFixed(2)),
      real: parseFloat(real.toFixed(2)),
      plannedActivities: plannedCount,
      realActivities: realCount,
      totalActivities: realActivities.length,
      spi: planned > 0 ? real / planned : 1,
      gap: real - planned
    };
  });
};
