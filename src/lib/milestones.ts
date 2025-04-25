import {
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  addWeeks,
  addMonths,
  isFuture,
} from 'date-fns';

export type Milestone = {
  value: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  date: Date;
  type: 'round' | 'repeating';
};

const generateRoundNumbers = (): number[] => {
  const numbers: number[] = [];
  for (let base = 1; base <= 99; base++) {
    for (let zeros = 0; zeros <= 10; zeros++) {
      numbers.push(base * 10 ** zeros);
    }
  }
  return numbers.sort((a,b) => a - b);
};

const roundNumbers = generateRoundNumbers();

const repeatingDigitNumbers = (maxDigits: number): number[] => {
  const numbers: number[] = [];
  for (let digits = 2; digits <= maxDigits; digits++) {
    for (let d = 1; d <= 9; d++) {
        numbers.push(parseInt(String(d).repeat(digits), 10));
    }
  }
  return numbers;
};

// Generate repeating numbers up to a reasonable limit (e.g., 7 digits for seconds/minutes)
const repeatingNumbersSecondsMinutes = repeatingDigitNumbers(9);
const repeatingNumbersHours = repeatingDigitNumbers(6);
const repeatingNumbersDays = repeatingDigitNumbers(5);
const repeatingNumbersWeeks = repeatingDigitNumbers(4);
const repeatingNumbersMonths = repeatingDigitNumbers(4);


const getRepeatingNumbersForUnit = (unit: Milestone['unit']): number[] => {
     switch (unit) {
        case 'seconds':
        case 'minutes':
            return repeatingNumbersSecondsMinutes;
        case 'hours':
            return repeatingNumbersHours;
        case 'days':
             return repeatingNumbersDays;
        case 'weeks':
            return repeatingNumbersWeeks;
        case 'months':
            return repeatingNumbersMonths;
        default:
            return [];
    }
}

const addDuration = (date: Date, value: number, unit: Milestone['unit']): Date => {
  switch (unit) {
    case 'seconds':
      return addSeconds(date, value);
    case 'minutes':
      return addMinutes(date, value);
    case 'hours':
      return addHours(date, value);
    case 'days':
      return addDays(date, value);
    case 'weeks':
      return addWeeks(date, value);
    case 'months':
      return addMonths(date, value);
    default:
      throw new Error(`Unknown unit: ${unit}`);
  }
};

export const calculateUpcomingMilestones = (birthDate: Date): Milestone[] => {
  const milestones: Milestone[] = [];
  const now = new Date();
  const units: Milestone['unit'][] = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months'];

  units.forEach((unit) => {
    // Calculate round number milestones
    roundNumbers.forEach((value) => {
      try {
        const date = addDuration(birthDate, value, unit);
         // Add if it's in the future OR if it passed within the last ~day for seconds/minutes/hours or ~week for days/weeks/months
         const lookbackHours = unit === 'seconds' || unit === 'minutes' || unit === 'hours' ? 24 : 7 * 24;
        if (date >= addHours(now, -lookbackHours)) {
            milestones.push({ value, unit, date, type: 'round' });
        }
      } catch (e) {
        // Likely overflow for very large numbers + months, ignore
        // console.warn(`Could not calculate ${value} ${unit}: ${e}`);
      }
    });

    // Calculate repeating digit milestones
    const repeatingNumbers = getRepeatingNumbersForUnit(unit);
    repeatingNumbers.forEach((value) => {
      try {
        const date = addDuration(birthDate, value, unit);
        const lookbackHours = unit === 'seconds' || unit === 'minutes' || unit === 'hours' ? 24 : 7 * 24;
        if (date >= addHours(now, -lookbackHours)) {
             milestones.push({ value, unit, date, type: 'repeating' });
        }
       } catch(e) {
           // console.warn(`Could not calculate repeating ${value} ${unit}: ${e}`);
       }
    });
  });

  // Sort milestones by date and return upcoming ones
   return milestones
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .filter((m, index, self) =>
            // Remove potential duplicates (e.g., 1000 days might be close to a week milestone)
            // Keep the first occurrence based on sorted date. Check against previous item.
            index === 0 || m.date.getTime() !== self[index-1].date.getTime()
        )
        .slice(0, 50); // Limit to a reasonable number of results
};
