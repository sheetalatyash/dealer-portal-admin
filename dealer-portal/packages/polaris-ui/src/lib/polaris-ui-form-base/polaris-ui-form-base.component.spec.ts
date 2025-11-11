import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { PolarisUiFormBase } from './polaris-ui-form-base.component';
import { CommonModule } from '@angular/common';

describe('PolarisUiFormBase', () => {
  let component: PolarisUiFormBase<unknown>;
  let fixture: ComponentFixture<PolarisUiFormBase<unknown>>;
  let parentFormGroupDirective: FormGroupDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisUiFormBase, CommonModule, ReactiveFormsModule],
      providers: [
        {
          provide: FormGroupDirective,
          useValue: {
            form: new FormGroup({
              testGroup: new FormGroup({
                testControl: new FormControl(''),
              }),
              testControl: new FormControl(''),
            }),
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolarisUiFormBase<unknown>);
    component = fixture.componentInstance;
    parentFormGroupDirective = TestBed.inject(FormGroupDirective);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use formControlName to retrieve a formControl from an inputted formGroup', () => {
    // Input a formGroup and formControlName
    component.formGroup = new FormGroup({
      testControl: new FormControl(''),
    });
    component.formControlName = 'testControl';
    component.ngOnInit();

    // Verify the component's formControl is the same as the inputted formGroup's formControl
    expect(component.formControl).toBe(component.formGroup.get('testControl'));
  });

  it('should retrieve formControl from parent formGroup using formGroupName', () => {
    // Input a formGroupName and formControlName
    component.formGroupName = 'testGroup';
    component.formControlName = 'testControl';
    component.ngOnInit();

    // Verify the component's formControl is the same as the parent context formGroup's formControl
    expect(component.formControl).toBe(parentFormGroupDirective.form.get('testGroup.testControl'));
  });

  it('should retrieve formControl from parent formGroup', () => {
    // Input a formControlName
    component.formControlName = 'testControl';
    component.ngOnInit();

    // Verify the component's formControl is the same as the parent context's formControl
    expect(component.formControl).toBe(parentFormGroupDirective.form.get('testControl'));
  });

  it('should use input formControl if no formGroup or formControlName is provided', () => {
    // Input a formControl
    const inputFormControl = new FormControl('input control');
    component.formControl = inputFormControl;
    component.ngOnInit();

    // Verify the component's formControl is the same as the inputted formControl
    expect(component.formControl).toBe(inputFormControl);
  });
});
