import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  let pipe: DurationPipe;

  beforeEach(() => {
    pipe = new DurationPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform a number to duration string', () => {
    // Arrange
    const input = 1;
    const expected = '00:01';

    // Act
    const result = pipe.transform(input);

    // Assert
    expect(result).toBe(expected);
  });
});
