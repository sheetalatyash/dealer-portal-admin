import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisDatePicker } from './polaris-date-picker.component';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('PolarisDatePicker', () => {
  let component: PolarisDatePicker<unknown>;
  let fixture: ComponentFixture<PolarisDatePicker<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolarisDatePicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the input field', () => {
    const inputElement = fixture.debugElement.query(By.css('input[matInput]'));
    expect(inputElement).toBeTruthy();
  });

  it('should show the provided placeholder text', () => {
    const expected = 'Test Placeholder';

    // Input the  label to the component
    fixture.componentInstance.placeholder = expected;
    fixture.detectChanges();

    // Check that the placeholder text is displayed
    const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input[matInput]')).nativeElement;
    expect(inputElement.placeholder).toBe(expected);
  });

  it('should show the provided field label', () => {
    const expected = 'Test Label';

    // Input the label to the component
    fixture.componentInstance.label = expected;
    fixture.detectChanges();

    // Check that the label displayed
    const labelElement = fixture.debugElement.query(By.css('mat-label')).nativeElement;
    expect(labelElement.textContent.trim()).toBe(expected);
  });

  it('should show the provided tooltip', () => {
    const expected = 'Test Tooltip';

    // Check that the popup is not displayed initially
    let datePickerPopup: HTMLDivElement | null = document.querySelector('.tooltip-container');
    expect(datePickerPopup).toBeNull();

    // Input the tooltip and label to the component
    fixture.componentInstance.label = 'Label';
    fixture.componentInstance.tooltip = expected;
    fixture.detectChanges();

    // Query the tooltip icon and mouse over it
    const iconElement: Element = fixture.debugElement.query(By.css('polaris-icon')).nativeElement.querySelector('i');
    iconElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    // Check that the tooltip is now displayed
    datePickerPopup = document.querySelector('.tooltip-container');
    expect(datePickerPopup).toBeDefined();
    expect(datePickerPopup?.textContent?.trim()).toBe(expected);
  });

  it('should apply minDate and maxDate', () => {
    const minDate = new Date(2020, 0, 1);
    const maxDate = new Date(2020, 11, 31);

    const expectedMinDate = minDate.toISOString().split('T')[0];
    const expectedMaxDate = maxDate.toISOString().split('T')[0];

    // Input the minDate and maxDate to the component
    component.minDate = minDate;
    component.maxDate = maxDate;
    fixture.detectChanges();

    // Verify that the input has the minDate and maxDate applied
    const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input[matInput]')).nativeElement;
    expect(inputElement.min).toBe(expectedMinDate);
    expect(inputElement.max).toBe(expectedMaxDate);
  });

  it('should call dateFilter function', () => {
    const dateFilterSpy = jest.fn().mockReturnValue(true);

    // Input the dateFilter to the component
    component.dateFilter = dateFilterSpy;
    fixture.detectChanges();

    // Add text to the input
    const inputElement = fixture.debugElement.query(By.css('input[matInput]')).nativeElement;
    inputElement.value = '2020-01-01';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Verify that the dateFilter was called
    expect(dateFilterSpy).toHaveBeenCalled();
  });

  it('should open date picker on button click', () => {
    // Check that the popup is not displayed initially
    let datePickerPopup = document.querySelector('.mat-datepicker-popup');
    expect(datePickerPopup).toBeNull();

    // Query the toggle button and click it
    const datePickerToggle = fixture.debugElement.query(By.css('.polaris-date-picker-toggle'));
    datePickerToggle.nativeElement.click();

    // Check that the popup is now displayed
    datePickerPopup = document.querySelector('.mat-datepicker-popup');
    expect(datePickerPopup).toBeDefined();
  });
});
