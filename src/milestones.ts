import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
} from "date-fns";

export type Unit = "seconds" | "minutes" | "hours" | "days" | "weeks" | "months";

export type Milestone = {
  value: number;
  unit: Unit;
  date: Date;
};

type UnitConfig = {
  add: (date: Date, amount: number) => Date;
  /** Longest repeating-digit number to consider, e.g. 4 → up to 9999. */
  maxRepeatingDigits: number;
  /** How long a passed milestone stays in the results. */
  lookbackHours: number;
};

const UNITS: Record<Unit, UnitConfig> = {
  seconds: { add: addSeconds, maxRepeatingDigits: 9, lookbackHours: 24 },
  minutes: { add: addMinutes, maxRepeatingDigits: 9, lookbackHours: 24 },
  hours: { add: addHours, maxRepeatingDigits: 6, lookbackHours: 24 },
  days: { add: addDays, maxRepeatingDigits: 5, lookbackHours: 7 * 24 },
  weeks: { add: addWeeks, maxRepeatingDigits: 4, lookbackHours: 7 * 24 },
  months: { add: addMonths, maxRepeatingDigits: 4, lookbackHours: 7 * 24 },
};

const MAX_RESULTS = 50;

/**
 * One significant digit or a half step, followed by up to ten zeros:
 * 7, 15, 40, 250, 1000, 300000, 9500000000, …
 * Numbers like 280000 or 4700 are left out on purpose: they aren't worth a toast.
 */
const ROUND_NUMBERS: number[] = [];
for (let zeros = 0; zeros <= 10; zeros++) {
  for (let d = 1; d <= 9; d++) {
    ROUND_NUMBERS.push(d * 10 ** zeros, (d * 10 + 5) * 10 ** zeros);
  }
}

/** 11, 22, …, 999, 1111, … up to `maxDigits` digits. */
function repeatingDigitNumbers(maxDigits: number): number[] {
  const numbers: number[] = [];
  for (let digits = 2; digits <= maxDigits; digits++) {
    for (let d = 1; d <= 9; d++) {
      numbers.push(Number(String(d).repeat(digits)));
    }
  }
  return numbers;
}

export function calculateMilestones(birthDate: Date, now = new Date()): Milestone[] {
  const milestones: Milestone[] = [];

  for (const [unit, config] of Object.entries(UNITS) as [Unit, UnitConfig][]) {
    const cutoff = addHours(now, -config.lookbackHours);
    const values = new Set([
      ...ROUND_NUMBERS,
      ...repeatingDigitNumbers(config.maxRepeatingDigits),
    ]);
    for (const value of values) {
      // Huge month counts overflow to an Invalid Date, which never passes this check.
      const date = config.add(birthDate, value);
      if (date >= cutoff) milestones.push({ value, unit, date });
    }
  }

  return milestones
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    // Keep only the first milestone for any exact same moment.
    .filter((m, i, all) => i === 0 || m.date.getTime() !== all[i - 1].date.getTime())
    .slice(0, MAX_RESULTS);
}
