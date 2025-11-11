import { Injectable } from '@angular/core';
import { PolarisTime } from './datetime-service.type';
import { ValidationService } from '../validation/validation.service';

@Injectable({
  providedIn: 'root',
})
export class DatetimeService {
  constructor(private _validationService: ValidationService) {}

  /**
   * Converts a Date object to a 12-hour time format.
   * @param date - The date to convert.
   * @returns The corresponding 12-hour time object.
   */
  public get12HourTimeFromDate(date: Date): PolarisTime {
    return {
      hours: date.getHours() % 12 || 12,
      minutes: date.getMinutes(),
      period: date.getHours() < 12 ? 'AM' : 'PM',
    };
  }

  /**
   * Converts a time object to a Date object.
   * @param time - The time to convert.
   * @returns The corresponding Date object.
   */
  public convertTimeToDateTime(time: PolarisTime): Date {
    let hours: number = time.hours;
    if (time.period === 'PM' && hours < 12) {
      hours += 12;
    } else if (time.period === 'AM' && hours === 12) {
      hours = 0;
    }

    const now: Date = new Date();
    now.setHours(hours, time.minutes, 0, 0);

    return now;
  }

  /**
   * Generates a UTC offset timestamp from a date, time, and timezone offset.
   * @param date - The date part of the timestamp.
   * @param time - The time part of the timestamp.
   * @param timezoneOffset - The timezone offset in minutes.
   * @returns The formatted UTC offset timestamp string.
   */
  public getUtcOffsetTimestamp(date: Date, time: PolarisTime, timezoneOffset: number): string {
    const outputDate: Date = new Date();
    // Set the date
    outputDate.setUTCFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

    // Perform 12 to 24-hour conversion and set the time
    let hours: number = time.hours;
    if (time.period === 'AM' && hours === 12) {
      hours = 0;
    } else if (time.period === 'PM' && hours < 12) {
      hours += 12;
    }
    outputDate.setUTCHours(hours, time.minutes, 0, 0);

    // Set the timezone offset
    const absOffset: number = Math.abs(timezoneOffset);
    const offsetHours: number = Math.floor(absOffset / 60);
    const offsetMinutes: number = absOffset % 60;
    const timezoneOffsetStr: string =
      (timezoneOffset > 0 ? '-' : '+') +
      String(offsetHours).padStart(2, '0') +
      ':' +
      String(offsetMinutes).padStart(2, '0');

    return outputDate.toISOString().replace('Z', timezoneOffsetStr);
  }

  /**
   * Extracts date, time, and timezone offset components from a timestamp.
   * @param timestamp - The timestamp to parse.
   * @returns A tuple containing the date, time, and timezone offset.
   */
  public getDatetimeComponents(timestamp: string): [Date, PolarisTime, number] {
    const utcOffsetRegex: RegExp = this._validationService.utcOffsetRegex;
    let timezoneOffset: number = 0;

    const match: RegExpExecArray | null = utcOffsetRegex.exec(timestamp);
    if (match) {
      const sign: 1 | -1 = match[1] === '+' ? -1 : 1;
      const hours: number = parseInt(match[2], 10);
      const minutes: number = parseInt(match[3], 10);
      timezoneOffset = sign * (hours * 60 + minutes);
    }

    const timestampWithoutOffset: string = timestamp.replace(utcOffsetRegex, '');
    const time: PolarisTime = this.get12HourTimeFromDate(new Date(timestampWithoutOffset));

    // Explicitly parse the year, month, and day to avoid timezone issues and get a date in local time with the correct day
    const timestampWithoutTime: string = timestampWithoutOffset.split('T')[0];
    const [year, month, day] = timestampWithoutTime.split('-').map((part: string) => parseInt(part, 10));
    const date: Date = new Date(year, month - 1, day);

    return [date, time, timezoneOffset];
  }
}
