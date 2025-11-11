import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroupDirective } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PolarisTime, ValidationService } from '@dealer-portal/polaris-core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PolarisTimePicker } from '.';

describe('PolarisTimePicker', () => {
  let component: PolarisTimePicker<unknown>;
  let fixture: ComponentFixture<PolarisTimePicker<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [DatePipe, ValidationService, FormGroupDirective],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolarisTimePicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize displayedTimeFormControl with empty string', () => {
    expect(component.displayedTimeFormControl.value).toBe('');
  });

  it('should open time picker dialog on button click', () => {
    // Validate the time picker overlay is not already displayed
    let overlay = document.querySelector('.cdk-overlay-container');
    expect(overlay).toBeNull();

    // Toggle the time picker dialog button
    const toggleButton = fixture.debugElement.query(By.css('.polaris-date-picker-toggle')).nativeElement;
    toggleButton.click();

    // Validate that the time picker is set to open
    fixture.detectChanges();
    expect(component.isTimePickerOpen).toBeDefined();

    // Validate that the time picker overlay is displayed
    overlay = document.querySelector('.cdk-overlay-container');
    expect(overlay).toBeDefined();
  });

  it('should close time picker dialog on outside click', () => {
    // Toggle the time picker dialog button to open the dialog
    const toggleButton = fixture.debugElement.query(By.css('.polaris-date-picker-toggle')).nativeElement;
    toggleButton.click();
    fixture.detectChanges();

    // Validate that the time picker overlay is displayed
    let overlayBackdrop = document.querySelector('.cdk-overlay-backdrop') as HTMLDivElement;
    expect(overlayBackdrop).toBeDefined();

    // Click the backdrop to close the dialog
    overlayBackdrop.click();
    fixture.detectChanges();

    // Validate that the overlay no longer is displayed
    expect(component.isTimePickerOpen).toBeFalsy();
    overlayBackdrop = document.querySelector('.cdk-overlay-backdrop') as HTMLDivElement;
    expect(overlayBackdrop).toBeNull();
  });

  it('should update displayedTimeFormControl on an AM time select', () => {
    const time: PolarisTime = { hours: 12, minutes: 15, period: 'AM' };

    // Select the chosen time
    component.onSelectDate(time);
    fixture.detectChanges();

    // Validate the selected time is displayed
    expect(component.displayedTimeFormControl.value).toBe('12:15 AM');
  });

  it('should update displayedTimeFormControl on a PM time select', () => {
    const time: PolarisTime = { hours: 1, minutes: 30, period: 'PM' };

    // Select the chosen time
    component.onSelectDate(time);
    fixture.detectChanges();

    // Validate the selected time is displayed
    expect(component.displayedTimeFormControl.value).toBe('01:30 PM');
  });

  it('should update formControl on a time select', () => {
    const expected: PolarisTime = { hours: 1, minutes: 30, period: 'PM' };

    // Select the chosen time
    component.onSelectDate(expected);
    fixture.detectChanges();

    // Validate that both the displayed and input formControl is set to proper value
    expect(component.displayedTimeFormControl.value).toBe('01:30 PM');
    expect(component.formControl.value).toStrictEqual(expected);
  });

  it('should update formControl on a valid manual time input', () => {
    const expected: PolarisTime = { hours: 1, minutes: 30, period: 'PM' };

    // Manually input the chosen time
    const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input[matInput]')).nativeElement;
    inputElement.value = `${expected.hours}:${expected.minutes} ${expected.period}`;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Validate that both the displayed and input formControl is set to proper value
    expect(component.displayedTimeFormControl.value).toBe('1:30 PM');
    expect(component.formControl.value).toStrictEqual(expected);
  });

  it('should validate and parse 12-hour time correctly', () => {
    const timeString = '05:30 AM';
    const parsedTime = component.validateAndParseTime(timeString);
    expect(parsedTime).toEqual({ hours: 5, minutes: 30, period: 'AM' });
  });

  it('should validate and parse 24-hour time to AM correctly', () => {
    const timeString = '00:15';
    const parsedTime = component.validateAndParseTime(timeString, true);
    expect(parsedTime).toEqual({ hours: 12, minutes: 15, period: 'AM' });
  });

  it('should validate and parse 24-hour time to PM correctly', () => {
    const timeString = '17:30';
    const parsedTime = component.validateAndParseTime(timeString, true);
    expect(parsedTime).toEqual({ hours: 5, minutes: 30, period: 'PM' });
  });

  it('should return null for invalid time string', () => {
    const timeString = 'invalid';
    const parsedTime = component.validateAndParseTime(timeString);
    expect(parsedTime).toBeNull();
  });

  it('should set a default value from the input form control', () => {
    const time: PolarisTime = { hours: 1, minutes: 30, period: 'PM' };

    // Set a default value for the form control and init the component
    component.formControl.setValue(time);
    component.ngOnInit();

    // Validate the displayed time is correct
    expect(component.displayedTimeFormControl.value).toBe('01:30 PM');
  });
});
