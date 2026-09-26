import assert from "node:assert/strict";
import test from "node:test";
import { calculateScopeTotals, calculateSprintSummary, countWeekdays, type Issue, type ScopeChange } from "./domain.ts";

const issue = (overrides: Partial<Issue> = {}): Issue => ({
  key: "DEMO-1",
  title: "Sample",
  assignee: null,
  status: "To Do",
  statusCategory: "To Do",
  points: 10,
  flagged: false,
  inCurrentScope: true,
  ...overrides,
});

test("sprint totals exclude subtasks, removed issues, and unknown estimates", () => {
  const summary = calculateSprintSummary([
    issue({ points: 8, statusCategory: "Done" }),
    issue({ key: "DEMO-2", points: null }),
    issue({ key: "DEMO-3", points: 5, subtask: true }),
    issue({ key: "DEMO-4", points: 13, inCurrentScope: false }),
  ], "2026-06-08", "2026-06-12", "2026-06-10");

  assert.equal(summary.totalPoints, 8);
  assert.equal(summary.completedPoints, 8);
  assert.equal(summary.remainingPoints, 0);
  assert.equal(summary.unestimatedCount, 1);
});

test("the at-risk threshold is inclusive at ten percentage points behind", () => {
  const summary = calculateSprintSummary([
    issue({ points: 10, statusCategory: "Done" }),
    issue({ key: "DEMO-2", points: 10 }),
  ], "2026-06-08", "2026-06-12", "2026-06-10");

  assert.equal(summary.idealProgress, 60);
  assert.equal(summary.actualProgress, 50);
  assert.equal(summary.atRisk, true);
  assert.equal(summary.health, "At risk");
});

test("a gap smaller than ten percentage points remains on track", () => {
  const summary = calculateSprintSummary([
    issue({ points: 51, statusCategory: "Done" }),
    issue({ key: "DEMO-2", points: 49 }),
  ], "2026-06-08", "2026-06-12", "2026-06-10");
  assert.equal(summary.actualProgress, 51);
  assert.equal(summary.atRisk, false);
  assert.equal(summary.health, "On track");
});

test("added work contributes to current sprint scope", () => {
  const summary = calculateSprintSummary([
    issue({ points: 24, statusCategory: "Done" }),
    issue({ key: "DEMO-2", points: 10 }),
    issue({ key: "DEMO-3", points: 5 }),
  ], "2026-06-08", "2026-06-12", "2026-06-10");

  assert.equal(summary.totalPoints, 39);
  assert.equal(summary.remainingPoints, 15);
});

test("zero estimated scope has no actual percentage or health judgment", () => {
  const summary = calculateSprintSummary([issue({ points: null })], "2026-06-08", "2026-06-12", "2026-06-10");
  assert.equal(summary.actualProgress, null);
  assert.equal(summary.health, "Insufficient estimate data");
  assert.equal(summary.unestimatedCount, 1);
});

test("weekday counts include weekdays and exclude weekend boundaries", () => {
  const summary = calculateSprintSummary([], "2026-06-05", "2026-06-08", "2026-06-08");
  assert.equal(summary.elapsedDays, 2);
  assert.equal(summary.remainingDays, 0);
});

test("a weekend current date does not subtract a weekday from remaining days", () => {
  const summary = calculateSprintSummary([], "2026-09-21", "2026-10-02", "2026-09-26");
  assert.equal(summary.elapsedDays, 5);
  assert.equal(summary.remainingDays, 5);
});

test("invalid dates are reported and reversed ranges have no weekdays", () => {
  assert.throws(() => countWeekdays("not-a-date", "2026-06-12"), RangeError);
  assert.equal(countWeekdays("2026-06-12", "2026-06-08"), 0);
});

test("scope totals preserve unknown impact instead of treating it as zero", () => {
  const changes: ScopeChange[] = [
    { key: "DEMO-1", title: "Added work", direction: "Added", changedAt: "2026-06-08T10:00:00", points: 5 },
    { key: "DEMO-2", title: "Unknown work", direction: "Added", changedAt: "2026-06-08T11:00:00", points: null },
    { key: "DEMO-3", title: "Removed work", direction: "Removed", changedAt: "2026-06-09T11:00:00", points: 3 },
  ];
  assert.deepEqual(calculateScopeTotals(changes), {
    Added: { points: 5, unknown: 1 },
    Removed: { points: 3, unknown: 0 },
  });
});
