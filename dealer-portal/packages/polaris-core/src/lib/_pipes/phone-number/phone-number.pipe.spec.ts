import { PhoneNumberPipe } from './phone-number.pipe';

describe('PhoneNumberPipe', () => {
  let pipe: PhoneNumberPipe;

  beforeEach(() => {
    pipe = new PhoneNumberPipe();
  });

  it('create an instance', () => {
    const instance = pipe;
    expect(instance).toBeTruthy();
  });

  it('should format a 10-digit phone number correctly', () => {
    // Arrange
    const phoneNumber = '1234567890';
    const expected = '(123) 456-7890';

    // Act
    const result = pipe.transform(phoneNumber);

    // Assert
    expect(result).toBe(expected);
  });

  it('should return the original input if it contains less than 10 digits', () => {
    // Arrange
    const phoneNumber = '12345';
    const expected = '12345';

    // Act
    const result = pipe.transform(phoneNumber);

    // Assert
    expect(result).toBe(expected);
  });

  it('should return the original input if it contains more than 10 digits', () => {
    // Arrange
    const phoneNumber = '1234567890123';
    const expected = '1234567890123';

    // Act
    const result = pipe.transform(phoneNumber);

    // Assert
    expect(result).toBe(expected);
  });

  it('should remove non-numeric characters and format correctly', () => {
    // Arrange
    const phoneNumber = '[123] 456_7890';
    const expected = '(123) 456-7890';

    // Act
    const result = pipe.transform(phoneNumber);

    // Assert
    expect(result).toBe(expected);
  });

  it('should handle numeric input correctly', () => {
    // Arrange
    const phoneNumber = 1234567890;
    const expected = '(123) 456-7890';

    // Act
    const result = pipe.transform(phoneNumber);

    // Assert
    expect(result).toBe(expected);
  });

  it('should return an empty string if no value is provided', () => {
    // Arrange
    const phoneNumber = '';
    const expected = '';

    // Act
    const result = pipe.transform(phoneNumber);

    // Assert
    expect(result).toBe(expected);
  });
});
