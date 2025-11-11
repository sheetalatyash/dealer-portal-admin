import { TestBed } from '@angular/core/testing';
import { DatetimeService } from './datetime.service';
import { ValidationService } from '../validation/validation.service';
import { PolarisTime } from './datetime-service.type';

describe('DatetimeService', () => {
  let service: DatetimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidationService],
    });
    service = TestBed.inject(DatetimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get12HourTimeFromDate', () => {
    it('should convert Date to 12-hour time format', () => {
      const date = new Date('2023-10-10T15:30:00');
      const expectedTime: PolarisTime = { hours: 3, minutes: 30, period: 'PM' };
      expect(service.get12HourTimeFromDate(date)).toEqual(expectedTime);
    });
  });

  describe('convertTimeToDateTime', () => {
    it('should convert 12-hour PM time format to Date', () => {
      const time: PolarisTime = { hours: 3, minutes: 30, period: 'PM' };
      const date = service.convertTimeToDateTime(time);
      expect(date.getHours()).toBe(15);
      expect(date.getMinutes()).toBe(30);
    });

    it('should convert 12-hour AM time format to Date', () => {
      const time: PolarisTime = { hours: 12, minutes: 30, period: 'AM' };
      const date = service.convertTimeToDateTime(time);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(30);
    });
  });

  describe('getUtcOffsetTimestamp', () => {
    it('should generate UTC offset timestamp', () => {
      const date = new Date('2024-12-05');
      const time: PolarisTime = { hours: 3, minutes: 30, period: 'PM' };
      const timezoneOffset = 300; // UTC-05:00
      const expectedTimestamp = '2024-12-05T15:30:00.000-05:00';
      expect(service.getUtcOffsetTimestamp(date, time, timezoneOffset)).toBe(expectedTimestamp);
    });
  });

  describe('getDatetimeComponents', () => {
    it('should extract datetime components from timestamp', () => {
      const timestamp = '2024-12-05T15:30:00-05:00';
      const expectedDate = new Date(2024, 11, 5);
      const expectedTime: PolarisTime = { hours: 3, minutes: 30, period: 'PM' };
      const expectedOffset = 300;
      expect(service.getDatetimeComponents(timestamp)).toEqual([expectedDate, expectedTime, expectedOffset]);
    });
  });
});
