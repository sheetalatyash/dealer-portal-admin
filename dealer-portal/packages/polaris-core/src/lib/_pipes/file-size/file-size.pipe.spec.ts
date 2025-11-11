import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  let pipe: FileSizePipe;

  beforeEach(() => {
    pipe = new FileSizePipe();
  });

  it('create an instance', () => {
    const instance = pipe;
    expect(instance).toBeTruthy();
  });

  it('should return empty string for NaN or negative values', () => {
    expect(pipe.transform(NaN)).toBe('');
    expect(pipe.transform(-1)).toBe('');
  });

  it('should convert bytes to appropriate units', () => {
    expect(pipe.transform(1023, 'B')).toBe('1023.00 B');
    expect(pipe.transform(1024)).toBe('1.00 KB');
    expect(pipe.transform(1048576)).toBe('1.00 MB');
    expect(pipe.transform(1073741824)).toBe('1.00 GB');
  });

  it('should convert to specified unit', () => {
    expect(pipe.transform(1024, 'B')).toBe('1024.00 B');
    expect(pipe.transform(1024, 'KB')).toBe('1.00 KB');
    expect(pipe.transform(1048576, 'MB')).toBe('1.00 MB');
    expect(pipe.transform(1073741824, 'GB')).toBe('1.00 GB');
  });

  it('should throw error for invalid unit', () => {
    expect(() => pipe.transform(1024, 'invalid' as any)).toThrowError('Invalid unit: invalid');
  });

  it('should format with specified digits', () => {
    expect(pipe.transform(1024, 'auto', 0)).toBe('1 KB');
    expect(pipe.transform(1048576, 'auto', 3)).toBe('1.000 MB');
  });
});
