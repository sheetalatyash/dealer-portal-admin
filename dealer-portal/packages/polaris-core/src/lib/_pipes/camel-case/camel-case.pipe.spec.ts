import { CamelCasePipe } from './camel-case.pipe';

describe('CamelCasePipe', () => {
  let pipe: CamelCasePipe;

  beforeEach(() => {
    pipe = new CamelCasePipe();
  });

  it('create an instance', () => {
    const instance = pipe;
    expect(instance).toBeTruthy();
  });

  it('should transform a string to camelCase', () => {
    // Arrange
    const input = 'hello world';
    const expected = 'helloWorld';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should handle strings with hyphens and underscores', () => {
    // Arrange
    const input = 'hello-world_test';
    const expected = 'helloWorldTest';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should return an empty string if no value is provided', () => {
    // Arrange
    const input = '';
    const expected = '';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should handle strings with mixed case', () => {
    // Arrange
    const input = 'HeLLo WoRLd';
    const expected = 'helloWorld';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });
});
