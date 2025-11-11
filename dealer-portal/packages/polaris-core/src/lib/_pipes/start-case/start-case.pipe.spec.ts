import { StartCasePipe } from './start-case.pipe';

describe('StartCasePipe', () => {
  let pipe: StartCasePipe;

  beforeEach(() => {
    pipe = new StartCasePipe();
  });

  it('create an instance', () => {
    const instance = pipe;
    expect(instance).toBeTruthy();
  });

  it('should transform camelCase to Start Case', () => {
    // Arrange
    const input = 'helloWorld';
    const expected = 'Hello World';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should transform snake_case to Start Case', () => {
    // Arrange
    const input = 'hello_world';
    const expected = 'Hello World';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should transform kebab-case to Start Case', () => {
    // Arrange
    const input = 'hello-world';
    const expected = 'Hello World';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should transform mixed case to Start Case', () => {
    // Arrange
    const input = 'helloWorld_test-case';
    const expected = 'Hello World Test Case';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should handle empty string', () => {
    // Arrange
    const input = '';
    const expected = '';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should handle single word', () => {
    // Arrange
    const input = 'hello';
    const expected = 'Hello';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should handle multiple spaces', () => {
    // Arrange
    const input = 'hello   world';
    const expected = 'Hello World';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should handle non-alphanumeric characters', () => {
    // Arrange
    const input = 'hello@world!';
    const expected = 'Hello World';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });
});
