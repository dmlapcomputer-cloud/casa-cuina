/**
 * Suma horas hábiles a una fecha/hora de inicio.
 * Si el resultado cae fuera del horario del restaurante,
 * se mueve al primer slot hábil disponible.
 */

export function addBusinessHours(
  startDate: Date,
  hoursToAdd: number,
  schedule: { start: string; end: string },
  getScheduleForDate: (d: Date) => { start: string; end: string } | null,
  closedDates: string[] = []
): Date {
  let remaining = hoursToAdd;
  let current = new Date(startDate);

  // Convertimos horas string a números para comparar fácil
  const openH = parseInt(schedule.start.split(':')[0]|| '');
  const closeH = parseInt(schedule.end.split(':')[0] || '');

  while (remaining > 0) {
    const dateStr = current.toISOString().split('T')[0];
    const daySchedule = getScheduleForDate(current);
    const isClosed = closedDates.includes(dateStr|| '') || !daySchedule;

    if (isClosed) {
      // Si el día está cerrado, saltamos al inicio del día siguiente
      current.setDate(current.getDate() + 1);
      current.setHours(openH, 0, 0, 0);
      continue;
    }

    const currentHour = current.getHours() + current.getMinutes() / 60;

    if (currentHour < openH) {
      current.setHours(openH, 0, 0, 0);
      continue;
    }

    if (currentHour >= closeH) {
      current.setDate(current.getDate() + 1);
      current.setHours(openH, 0, 0, 0);
      continue;
    }

    // Horas disponibles en el bloque de hoy
    const hoursLeftToday = closeH - currentHour;

    if (remaining <= hoursLeftToday) {
      current = new Date(current.getTime() + remaining * 3600000);
      remaining = 0;
    } else {
      remaining -= hoursLeftToday;
      current.setDate(current.getDate() + 1);
      current.setHours(openH, 0, 0, 0);
    }
  }
  return current;
}