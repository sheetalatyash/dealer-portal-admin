import { KebabCasePipe } from './kebab-case.pipe';

describe('KebabCasePipe', () => {
  let pipe: KebabCasePipe;

  beforeEach(() => {
    pipe = new KebabCasePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform a string to KebabCasePipe', () => {
    // Arrange
    const input = 'hello world';
    const expected = 'hello-world';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should handle strings with hyphens and underscores', () => {
    // Arrange
    const input = 'hello-world_test';
    const expected = 'hello-world-test';

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
});
