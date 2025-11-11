import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  afterEach(() => {
    // Any necessary cleanup
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('emailValidator', () => {
    it('should validate email correctly', () => {
      // Arrange
      const control = new FormControl('test@example.com', [service.emailValidator()]);

      // Act & Assert
      expect(control.valid).toBeTruthy();

      // Act
      control.setValue('invalid-email');

      // Assert
      expect(control.invalid).toBeTruthy();
      expect(control.errors).toEqual({ invalidEmail: true });
    });
  });

  describe('phoneValidator', () => {
    it('should validate phone number correctly', () => {
      // Arrange
      const control = new FormControl('(123) 456-7890', [service.phoneValidator()]);

      // Act & Assert
      expect(control.valid).toBeTruthy();

      // Act
      control.setValue('123-456-7890');

      // Assert
      expect(control.invalid).toBeTruthy();
      expect(control.errors).toEqual({ invalidPhone: true });
    });
  });

  describe('time12HourValidator', () => {
    it('should validate 12-hour time correctly', () => {
      // Arrange
      const control = new FormControl('10:30 AM', [service.time12HourValidator()]);

      // Act & Assert
      expect(control.valid).toBeTruthy();

      // Act
      control.setValue('25:00 PM');

      // Assert
      expect(control.invalid).toBeTruthy();
      expect(control.errors).toEqual({ invalid12HourTime: true });
    });
  });

  describe('time24HourValidator', () => {
    it('should validate 24-hour time correctly', () => {
      // Arrange
      const control = new FormControl('23:59', [service.time24HourValidator()]);

      // Act & Assert
      expect(control.valid).toBeTruthy();

      // Act
      control.setValue('24:00');

      // Assert
      expect(control.invalid).toBeTruthy();
      expect(control.errors).toEqual({ invalid24HourTime: true });
    });
  });

  describe('numericValidator', () => {
    it('should validate numeric values correctly', () => {
      // Arrange
      const control = new FormControl('25', [service.numericValidator({ min: 10, max: 30 })]);

      // Act & Assert
      expect(control.valid).toBeTruthy();

      // Act
      control.setValue('5');

      // Assert
      expect(control.invalid).toBeTruthy();
      expect(control.errors).toEqual({ belowMin: true });

      // Act
      control.setValue('35');

      // Assert
      expect(control.invalid).toBeTruthy();
      expect(control.errors).toEqual({ aboveMax: true });

      // Act
      control.setValue('abc');

      // Assert
      expect(control.invalid).toBeTruthy();
      expect(control.errors).toEqual({ isNotNumeric: true });
    });

    it('should validate numeric values when null, undefined, or empty string', () => {
      // Arrange
      const controlNull = new FormControl(null, [service.numericValidator({ min: 10, max: 30 })]);
      const controlUndefined = new FormControl(undefined, [service.numericValidator({ min: 10, max: 30 })]);
      const controlEmpty = new FormControl('', [service.numericValidator({ min: 10, max: 30 })]);

      // Act & Assert
      expect(controlNull.valid).toBeTruthy();
      expect(controlUndefined.valid).toBeTruthy();
      expect(controlEmpty.valid).toBeTruthy();
    });
  });

  describe('atLeastOneSelectedValidator', () => {
    it('should validate at least one selected correctly', () => {
      // Arrange
      const formGroup = new FormGroup(
        {
          option1: new FormControl(false),
          option2: new FormControl(false),
          option3: new FormControl(false),
        },
        { validators: [service.atLeastOneSelectedValidator()] }
      );

      // Act & Assert
      expect(formGroup.invalid).toBeTruthy();
      expect(formGroup.errors).toEqual({ atLeastOneSelected: true });

      // Act
      formGroup.get('option1')?.setValue(true);

      // Assert
      expect(formGroup.valid).toBeTruthy();
    });
  });

  describe('confirmInputMatchValidator', () => {
    it('should validate input match correctly', () => {
      // Arrange
      const formGroup = new FormGroup(
        {
          password: new FormControl('password123'),
          confirmPassword: new FormControl('password123'),
        },
        { validators: [service.confirmInputMatchValidator('password', 'confirmPassword')] }
      );

      // Act & Assert
      expect(formGroup.valid).toBeTruthy();

      // Act
      formGroup.get('confirmPassword')?.setValue('differentPassword');

      // Assert
      expect(formGroup.invalid).toBeTruthy();
      expect(formGroup.get('confirmPassword')?.errors).toEqual({ mismatch: true });
    });
  });

  describe('orValidator', () => {
    it('should validate using orValidator correctly', () => {
      // Arrange
      const control = new FormControl<string>('a', [
        service.orValidator([service.emailValidator(), service.numericValidator()]),
      ]);

      // Act & Assert
      expect(control.invalid).toBeTruthy();
      expect(control.errors).toEqual({ or: true });

      // Act
      control.setValue('test@example.com');

      // Assert
      expect(control.valid).toBeTruthy();
    });
  });
});
