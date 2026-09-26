export type StatusCategory = "To Do" | "In Progress" | "Done";
export type ScopeDirection = "Added" | "Removed";

export type Issue = {
  key: string;
  title: string;
  assignee: string | null;
  status: string;
  statusCategory: StatusCategory;
  points: number | null;
  flagged: boolean;
  subtask?: boolean;
  inCurrentScope: boolean;
};

export type ScopeChange = {
  key: string;
  title: string;
  direction: ScopeDirection;
  changedAt: string;
  points: number | null;
};

export type ScopeTotals = Record<ScopeDirection, { points: number; unknown: number }>;

function parseDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError(`Invalid date: ${value}`);
  const parsed = new Date(`${value}T12:00:00`);
  const [year, month, day] = value.split("-").map(Number);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new RangeError(`Invalid date: ${value}`);
  }
  return parsed;
}

export function countWeekdays(start: string, end: string): number {
  const cursor = parseDate(start);
  const last = parseDate(end);
  if (cursor > last) return 0;
  let weekdays = 0;

  while (cursor <= last) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) weekdays += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return weekdays;
}

export function calculateSprintSummary(
  issues: Issue[],
  startDate: string,
  endDate: string,
  today: string,
) {
  const currentIssues = issues.filter((issue) => issue.inCurrentScope && !issue.subtask);
  const estimatedIssues = currentIssues.filter((issue) => issue.points !== null);
  const totalPoints = estimatedIssues.reduce((sum, issue) => sum + (issue.points ?? 0), 0);
  const completedPoints = estimatedIssues
    .filter((issue) => issue.statusCategory === "Done")
    .reduce((sum, issue) => sum + (issue.points ?? 0), 0);
  const remainingPoints = totalPoints - completedPoints;
  const actualProgress = totalPoints === 0 ? null : Math.round((completedPoints / totalPoints) * 100);
  const sprintDays = countWeekdays(startDate, endDate);
  const elapsedEnd = today < startDate ? startDate : today > endDate ? endDate : today;
  const remainingStart = today < startDate ? startDate : today > endDate ? endDate : today;
  const todayDate = parseDate(today);
  const todayIsWeekday = todayDate.getDay() !== 0 && todayDate.getDay() !== 6;
  const elapsedDays = today < startDate ? 0 : countWeekdays(startDate, elapsedEnd);
  const remainingDays = today > endDate
    ? 0
    : Math.max(0, countWeekdays(remainingStart, endDate) - (today >= startDate && todayIsWeekday ? 1 : 0));
  const idealProgress = sprintDays === 0 ? 0 : Math.round((elapsedDays / sprintDays) * 100);
  const atRisk = actualProgress !== null && idealProgress - actualProgress >= 10;

  return {
    currentIssues,
    estimatedIssues,
    unestimatedCount: currentIssues.length - estimatedIssues.length,
    totalPoints,
    completedPoints,
    remainingPoints,
    actualProgress,
    elapsedDays,
    remainingDays,
    idealProgress,
    atRisk,
    health: actualProgress === null ? "Insufficient estimate data" : atRisk ? "At risk" : "On track",
  } as const;
}

export function calculateScopeTotals(changes: ScopeChange[]): ScopeTotals {
  return changes.reduce<ScopeTotals>(
    (totals, change) => {
      if (change.points === null) totals[change.direction].unknown += 1;
      else totals[change.direction].points += change.points;
      return totals;
    },
    {
      Added: { points: 0, unknown: 0 },
      Removed: { points: 0, unknown: 0 },
    },
  );
}
