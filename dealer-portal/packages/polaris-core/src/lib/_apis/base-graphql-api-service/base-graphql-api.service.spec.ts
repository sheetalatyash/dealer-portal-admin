import { GraphQLFileOperation } from './base-graphql-api.service.types';

describe('GraphQLFileOperation.toFormData deduplication', () => {
  function getFormDataEntries(formData: FormData) {
    // Helper to extract FormData entries for testing
    const entries: Record<string, any> = {};
    // @ts-ignore: for testing in jsdom
    for (const [key, value] of formData.entries()) {
      entries[key] = value;
    }
    return entries;
  }

  it('uploads the same File only once and maps all variable paths', () => {
    const file = new File(['abc'], 'dup.txt', { type: 'text/plain' });
    const op = new TestFileOperation({
      file1: file,
      nested: { file2: file },
      arr: [file, { file3: file }],
    });
    const formData = op.toFormData();
    const entries = getFormDataEntries(formData);
    // There should be three fields: operations, map, and one file field (index '0')
    expect(Object.keys(entries)).toContain('operations');
    expect(Object.keys(entries)).toContain('map');
    // Only one file field
    const fileFieldKeys = Object.keys(entries).filter((k) => k !== 'operations' && k !== 'map');
    expect(fileFieldKeys.length).toBe(1);
    // The file field should be the same file object
    expect(entries[fileFieldKeys[0]]).toBe(file);
    // The map should map all variable paths to the same file field
    const map = JSON.parse(entries['map']);
    const allPaths = ['variables.file1', 'variables.nested.file2', 'variables.arr.0', 'variables.arr.1.file3'];
    expect(map['0'].sort()).toEqual(allPaths.sort());
  });

  it('uploads different files separately', () => {
    const fileA = new File(['a'], 'a.txt', { type: 'text/plain' });
    const fileB = new File(['b'], 'b.txt', { type: 'text/plain' });
    const op = new TestFileOperation({
      a: fileA,
      b: fileB,
      arr: [fileA, fileB],
    });
    const formData = op.toFormData();
    const entries = getFormDataEntries(formData);
    const fileFieldKeys = Object.keys(entries).filter((k) => k !== 'operations' && k !== 'map');
    expect(fileFieldKeys.length).toBe(2);
    // Each file should be present only once
    expect(Object.values(entries)).toContain(fileA);
    expect(Object.values(entries)).toContain(fileB);
    // The map should map all correct variable paths
    const map = JSON.parse(entries['map']);
    const allA = ['variables.a', 'variables.arr.0'];
    const allB = ['variables.b', 'variables.arr.1'];
    const mapA = Object.values(map).find((paths) => Array.isArray(paths) && paths.includes('variables.a')) as
      | string[]
      | undefined;
    const mapB = Object.values(map).find((paths) => Array.isArray(paths) && paths.includes('variables.b')) as
      | string[]
      | undefined;
    expect(mapA?.sort()).toEqual(allA.sort());
    expect(mapB?.sort()).toEqual(allB.sort());
  });
});

class TestFileOperation extends GraphQLFileOperation<any, any> {
  query = 'query Test {}';
  constructor(variables: any) {
    super();
    this.variables = variables;
  }
}

function mockFile(name = 'file.txt') {
  return new File(['content'], name, { type: 'text/plain' });
}

describe('GraphQLFileOperation.processVariables', () => {
  it('handles top-level file', () => {
    const file = mockFile();
    const op = new TestFileOperation({ file });
    const { nullified, fileToPaths } = op.extractFilePathsAndNullifyVariables();
    expect(nullified).toEqual({ file: null });
    expect(fileToPaths.get(file)).toEqual(['variables.file']);
  });

  it('handles nested file', () => {
    const file = mockFile();
    const op = new TestFileOperation({ data: { file } });
    const { nullified, fileToPaths } = op.extractFilePathsAndNullifyVariables();
    expect(nullified).toEqual({ data: { file: null } });
    expect(fileToPaths.get(file)).toEqual(['variables.data.file']);
  });

  it('handles top-level array of files', () => {
    const files = [mockFile('a.txt'), mockFile('b.txt')];
    const op = new TestFileOperation({ files });
    const { nullified, fileToPaths } = op.extractFilePathsAndNullifyVariables();
    expect(nullified).toEqual({ files: [null, null] });
    expect(fileToPaths.get(files[0])).toEqual(['variables.files.0']);
    expect(fileToPaths.get(files[1])).toEqual(['variables.files.1']);
  });

  it('handles nested array of files', () => {
    const files = [mockFile('a.txt'), mockFile('b.txt')];
    const op = new TestFileOperation({ data: { files } });
    const { nullified, fileToPaths } = op.extractFilePathsAndNullifyVariables();
    expect(nullified).toEqual({ data: { files: [null, null] } });
    expect(fileToPaths.get(files[0])).toEqual(['variables.data.files.0']);
    expect(fileToPaths.get(files[1])).toEqual(['variables.data.files.1']);
  });

  it('handles mixed types', () => {
    const file = mockFile();
    const op = new TestFileOperation({ file, name: 'test', arr: [1, file] });
    const { nullified, fileToPaths } = op.extractFilePathsAndNullifyVariables();
    expect(nullified).toEqual({ file: null, name: 'test', arr: [1, null] });
    expect(fileToPaths.get(file)).toEqual(['variables.file', 'variables.arr.1']);
  });

  it('handles no files', () => {
    const op = new TestFileOperation({ foo: 1, bar: 'baz' });
    const { nullified, fileToPaths } = op.extractFilePathsAndNullifyVariables();
    expect(nullified).toEqual({ foo: 1, bar: 'baz' });
    expect(Array.from(fileToPaths.entries()).length).toBe(0);
  });

  it('handles undefined variables', () => {
    const op = new TestFileOperation(undefined);
    const { nullified, fileToPaths } = op.extractFilePathsAndNullifyVariables();
    expect(nullified).toBeUndefined();
    expect(Array.from(fileToPaths.entries()).length).toBe(0);
  });

  it('handles null variables', () => {
    const op = new TestFileOperation(null);
    const { nullified, fileToPaths } = op.extractFilePathsAndNullifyVariables();
    expect(nullified).toBeNull();
    expect(Array.from(fileToPaths.entries()).length).toBe(0);
  });
});
