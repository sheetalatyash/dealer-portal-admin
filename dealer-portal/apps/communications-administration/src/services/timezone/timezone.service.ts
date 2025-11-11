import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface Timezone {
  offset: number; // Offset in minutes from UTC
  label: string;
}

@Injectable()
export class TimezoneService {
  // TODO: This is a crude implementation meant to unify the timezone service across the application based on current logic
  // More work will be needed to create a robust timezone service that handles more edge cases.

  public timezoneRawOptions: Timezone[] = [
    { offset: 480, label: this._translate.instant('timezone-option.alaska') },
    { offset: 420, label: this._translate.instant('timezone-option.pacific') },
    { offset: 360, label: this._translate.instant('timezone-option.mountain') },
    { offset: 300, label: this._translate.instant('timezone-option.central-standard') },
    { offset: 240, label: this._translate.instant('timezone-option.eastern') },
    { offset: 180, label: this._translate.instant('timezone-option.atlantic') },
    { offset: 150, label: this._translate.instant('timezone-option.newfoundland') },
  ];

  constructor(private _translate: TranslateService) {}

  public getTimezoneOptions(): Timezone[] {
    return this.timezoneRawOptions.map((option) => ({
      offset: option.offset,
      label: this._translate.instant(option.label),
    }));
  }

  public getTimezoneByOffset(offset: number): Timezone | undefined {
    return this.timezoneRawOptions.find((option) => option.offset === offset);
  }
}
