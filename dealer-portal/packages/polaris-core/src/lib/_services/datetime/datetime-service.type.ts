import { Meridiem } from './meridiem.type';

export interface PolarisTime {
  hours: number;
  minutes: number;
  period: Meridiem;
}

/**
 * Type check function for PolarisTime.
 * @param obj - The object to check.
 * @returns True if the object is a valid PolarisTime, false otherwise.
 */
export function isPolarisTime(obj: { hours: unknown; minutes: unknown; period: Meridiem } | null): obj is PolarisTime {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.hours === 'number' &&
    obj.hours >= 1 &&
    obj.hours <= 12 &&
    typeof obj.minutes === 'number' &&
    obj.minutes >= 0 &&
    obj.minutes < 60 &&
    (obj.period === 'AM' || obj.period === 'PM')
  );
}
