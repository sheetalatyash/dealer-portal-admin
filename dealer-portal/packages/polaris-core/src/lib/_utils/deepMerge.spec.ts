import { deepMerge } from './deepMerge';

describe('deepMerge', () => {
    it('should merge two plain objects deeply', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { b: { d: 3 }, e: 4 };
        const result = deepMerge(obj1, obj2);
        expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
    });

    it('should overwrite properties in target with properties from source', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { b: { c: 3 }, e: 4 };
        const result = deepMerge(obj1, obj2);
        expect(result).toEqual({ a: 1, b: { c: 3 }, e: 4 });
    });

    it('should handle non-object properties in source', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { b: 3, e: 4 };
        const result = deepMerge(obj1, obj2);
        expect(result).toEqual({ a: 1, b: 3, e: 4 });
    });

    it('should handle arrays by overwriting them', () => {
        const obj1 = { a: [1, 2], b: { c: 2 } };
        const obj2 = { a: [3, 4], b: { d: 3 } };
        const result = deepMerge(obj1, obj2);
        expect(result).toEqual({ a: [3, 4], b: { c: 2, d: 3 } });
    });

    it('should not mutate the target or source objects', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { b: { d: 3 }, e: 4 };
        const obj1Copy = { ...obj1, b: { ...obj1.b } };
        const obj2Copy = { ...obj2, b: { ...obj2.b } };

        deepMerge(obj1, obj2);

        expect(obj1).toEqual(obj1Copy);
        expect(obj2).toEqual(obj2Copy);
    });

    it('should handle empty target object', () => {
        const obj1 = {};
        const obj2 = { a: 1, b: { c: 2 } };
        const result = deepMerge(obj1, obj2);
        expect(result).toEqual({ a: 1, b: { c: 2 } });
    });

    it('should handle empty source object', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = {};
        const result = deepMerge(obj1, obj2);
        expect(result).toEqual({ a: 1, b: { c: 2 } });
    });

    it('should handle nested objects with multiple levels', () => {
        const obj1 = { a: { b: { c: 1 } } };
        const obj2 = { a: { b: { d: 2 } } };
        const result = deepMerge(obj1, obj2);
        expect(result).toEqual({ a: { b: { c: 1, d: 2 } } });
    });

    it('should handle null values in source', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { b: null };
        const result = deepMerge(obj1, obj2);
        expect(result).toEqual({ a: 1, b: null });
    });

    it('should handle null values in target', () => {
        const obj1 = { a: 1, b: null };
        const obj2 = { b: { c: 2 } };
        const result = deepMerge(obj1, obj2);
        expect(result).toEqual({ a: 1, b: { c: 2 } });
    });
});