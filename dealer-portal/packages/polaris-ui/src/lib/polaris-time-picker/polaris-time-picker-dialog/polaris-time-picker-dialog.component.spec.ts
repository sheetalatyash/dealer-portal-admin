import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisTimePickerDialog } from './polaris-time-picker-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PolarisButton } from '../../polaris-button';
import { PolarisTime, ValidationService } from '@dealer-portal/polaris-core';
import { DecimalPipe } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('$PolarisTimePickerDialog', () => {
  let component: PolarisTimePickerDialog;
  let fixture: ComponentFixture<PolarisTimePickerDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, PolarisButton, PolarisTimePickerDialog],
      providers: [DecimalPipe, ValidationService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolarisTimePickerDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default time values', () => {
    const expected: PolarisTime = {
      hours: 12,
      minutes: 0,
      period: 'AM',
    };

    jest.spyOn(component.onSelectEmitter, 'emit');

    // Validate that the form variables are equal to the expected time
    expect(component.timeForm.value).toEqual({
      hours: String(expected.hours).padStart(2, '0'),
      minutes: String(expected.minutes).padStart(2, '0'),
    });
    expect(component.period).toBe(expected.period);

    // Click the okay button without modifying any inputs
    const okButtonElement = fixture.debugElement.query(By.css('[data-test-id="time-picker-dialog-ok"]')).nativeElement;
    okButtonElement.click();

    // Validate the default time is emitted
    expect(component.onSelectEmitter.emit).toHaveBeenCalledWith(expected);
  });

  it('should emit onSelect event with correct time', () => {
    const expected: PolarisTime = {
      hours: 5,
      minutes: 30,
      period: 'PM',
    };
    jest.spyOn(component.onSelectEmitter, 'emit');

    // Input a new value for the hours input
    const hoursInputElement: HTMLInputElement = fixture.debugElement.query(
      By.css('[data-test-id="time-picker-dialog-hours-input"]')
    ).nativeElement;
    hoursInputElement.value = expected.hours.toString();
    hoursInputElement.dispatchEvent(new Event('input'));

    // Input a new value for the minutes input
    const minutesInputElement: HTMLInputElement = fixture.debugElement.query(
      By.css('[data-test-id="time-picker-dialog-minutes-input"]')
    ).nativeElement;
    minutesInputElement.value = expected.minutes.toString();
    minutesInputElement.dispatchEvent(new Event('input'));

    // Toggle the PM toggle button
    const pmToggleElement: HTMLButtonElement = fixture.debugElement.query(
      By.css('[data-test-id="time-picker-dialog-pm-toggle"]')
    ).nativeElement;
    pmToggleElement.click();

    // Validate that the entered time is outputted when updating the inputs
    const okButtonElement = fixture.debugElement.query(By.css('[data-test-id="time-picker-dialog-ok"]')).nativeElement;
    okButtonElement.click();
    expect(component.onSelectEmitter.emit).toHaveBeenCalledWith(expected);
  });

  it('should emit onCancel event', () => {
    jest.spyOn(component.onCancelEmitter, 'emit');

    // Click the cancel button
    const cancelButtonElement = fixture.debugElement.query(
      By.css('[data-test-id="time-picker-dialog-cancel"]')
    ).nativeElement;
    cancelButtonElement.click();

    expect(component.onCancelEmitter.emit).toHaveBeenCalled();
  });

  it('should validate hours input', () => {
    const hoursControl = component.timeForm.get('hours');

    // Validate the exclusive max of hours
    hoursControl?.setValue('13');
    expect(hoursControl?.valid).toBeFalsy();

    // Validate the inclusive max of hours
    hoursControl?.setValue('12');
    expect(hoursControl?.valid).toBeTruthy();

    // Validate the exclusive min of hours
    hoursControl?.setValue('0');
    expect(hoursControl?.valid).toBeFalsy();

    // Validate the inclusive min of hours
    hoursControl?.setValue('1');
    expect(hoursControl?.valid).toBeTruthy();

    // Validate non-numeric input
    hoursControl?.setValue('ab');
    expect(hoursControl?.valid).toBeFalsy();
  });

  it('should validate minutes input', () => {
    const minutesControl = component.timeForm.get('minutes');

    // Validate the exclusive max of minutes
    minutesControl?.setValue('60');
    expect(minutesControl?.valid).toBeFalsy();

    // Validate the inclusive max of minutes
    minutesControl?.setValue('59');
    expect(minutesControl?.valid).toBeTruthy();

    // Validate the exclusive min of minutes
    minutesControl?.setValue('-1');
    expect(minutesControl?.valid).toBeFalsy();

    // Validate the inclusive min of minutes
    minutesControl?.setValue('0');
    expect(minutesControl?.valid).toBeTruthy();

    // Validate non-numeric input
    minutesControl?.setValue('ab');
    expect(minutesControl?.valid).toBeFalsy();
  });

  it('should focus on hours input after view init', () => {
    // Spy on the hours input's focus
    const hoursInput = fixture.nativeElement.querySelector('input[formControlName="hours"]');
    jest.spyOn(hoursInput, 'focus');

    // Validate that the hoursInput gets focuses after initialize the view
    component.ngAfterViewInit();
    expect(hoursInput.focus).toHaveBeenCalled();
  });
});
