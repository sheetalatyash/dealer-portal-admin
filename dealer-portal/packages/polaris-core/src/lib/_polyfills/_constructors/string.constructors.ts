/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface StringConstructor {
  areEqual(a: any, b: any): boolean;
  toBoolean(value: any): boolean;
}

// Compare null/empty/undefined string to another null/empty/undefined string
// null === 'something',
// 'something' === null,
// null === undefined,
// undefined === null,
// null === null,
// 'something' === 'notSomething',

if (!String.areEqual) {
  String.areEqual = function (a: any, b: any): boolean {
    a = a || '';
    b = b || '';

    return a === b;
  };
}

// converts value of any type to correct boolean representation.
/*
 null is false,
 undefined is false,
 NaN is false,
 true is true,
 false is false,
 'yes' is true,
 'no' is false,
 'true' is true,
 'True' is true,
 'False' is false,
 'false' is false,
 'json' is false,
 '1' is true,
 '0' is false,
 '' is false,
 -2 is false,
 -1 is false,
 0 is false,
 1 is true,
 2 is false,
 'Thu Feb 18 2021 15:18:19 GMT-0600 (Central Standard Time)' is false",
 {} is false,
 () => {} is false,
*/
String.toBoolean = function (value: string | boolean | number): boolean {
  const typeOf = typeof value;
  if (typeOf === 'boolean') {
    return !!value;
  }
  if (typeOf === 'string') {
    return !!(value as string).toLowerCase().match(/true|yes|1/i);
  }
  if (typeOf === 'number') {
    return value === 1;
  }

  return false;
};
