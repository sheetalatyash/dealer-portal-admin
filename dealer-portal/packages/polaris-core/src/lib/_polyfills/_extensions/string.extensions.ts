/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line
interface String {
  parseToObject(): any;
  isNumber(): boolean;
  toNumber(): number | null;
  isValidUrl(): boolean;
  repeat(count: number): string;
  padStart(targetLength: number, padString: string): string;
  addTrailingSlash(): string;
  removeTrailingSlash(): string;
  stripHtml(): string;
  toBoolean(): boolean;
  toCamelCase(): string;
  capitalizeFirstLetter(): string;
}

// Parse "#a=1&b=2" or "a=1&b=2" to {"a":"1","b":"2"}
if (!String.prototype.parseToObject) {
  String.prototype.parseToObject = function () {
    let s = String(this);

    s = s.indexOf('#') === 0 ? s.substring(1) : s;

    // eslint-disable-next-line
    return JSON.parse(`{"${decodeURI(s).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')}"}`);
  };
}

if (!String.prototype.isNumber) {
  String.prototype.isNumber = function (): boolean {
    return Number.isNaN(this);
  };
}

if (!String.prototype.toNumber) {
  String.prototype.toNumber = function (): number | null {
    return this.isNumber() ? Number(this) : null;
  };
}

if (!String.prototype.isValidUrl) {
  String.prototype.isValidUrl = function (this: string): boolean {
    try {
      new URL(this);

      return true;
    } catch {
      return false;
    }
  };
}

// This is IE polyfill.
if (!String.prototype.repeat) {
  String.prototype.repeat = function (count: number): string {
    if (this === null || this === undefined) {
      throw new TypeError(`can't convert ${String(this)} to object`);
    }

    let str: string = `${String(this)}`;
    count = +count;
    if (count !== count) {
      count = 0;
    }

    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }

    if (count === Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }

    count = Math.floor(count);
    if (str.length === 0 || count === 0) {
      return '';
    }

    if (str.length * count >= Math.pow(2, 28)) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }

    const maxCount = str.length * count;
    count = Math.floor(Math.log(count) / Math.log(2));
    while (count) {
      str += str;
      count -= 1;
    }
    str += str.substring(0, maxCount - str.length);

    return str;
  };
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function (targetLength: number, padString: string | undefined): string {
    // eslint-disable-next-line no-bitwise
    targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
      }

      return padString.slice(0, targetLength) + String(this);
    }
  };
}

const fixUrl = (url: string, addTrailingSlash: boolean): string => {
  const match: RegExpMatchArray | null = url.match(/#|\?|$/);
  const pathEndIdx: number = (match && match.index) || url.length;
  const droppedSlashIdx: number = pathEndIdx - (url[pathEndIdx - 1] === '/' ? 1 : 0);
  const first: string = url.slice(0, droppedSlashIdx);
  const last: string = url.slice(pathEndIdx);

  if (addTrailingSlash) {
    return `${first}/${last}`;
  }

  return `${first}${last}`;
};

if (!String.prototype.addTrailingSlash) {
  String.prototype.addTrailingSlash = function (this: string): string {
    return fixUrl(this, true);
  };
}

if (!String.prototype.removeTrailingSlash) {
  String.prototype.removeTrailingSlash = function (this: string): string {
    return fixUrl(this, false);
  };
}

// <sup>Test</sup> becomes Test
// &reg;Test becomes Test
// &trade;Test becomes Test
// &#174;Test becomes Test
if (!String.prototype.stripHtml) {
  String.prototype.stripHtml = function (): string {
    return this ? this.replace(/&[^;]*;|<[^>]*>/gm, '') : '';
  };
}

// converts value of any type to correct boolean representation.
/*
 null is false
 undefined is false
 NaN is false
 true is true
 false is false
 'yes' is true
 'no' is false
 'true' is true
 'True' is true
 'False' is false
 'false' is false
 'json' is false
 '1' is true
 '0' is false
 '' is false
 -2 is false
 -1 is false
 0 is false
 1 is true
 2 is false
 'Thu Feb 18 2021 15:18:19 GMT-0600 (Central Standard Time)' is false"
 {} is false
 () => {} is false
*/
if (!String.prototype.toBoolean) {
  String.prototype.toBoolean = function (): boolean {
    const givenString: string = String(this);

    // Look in string.constructors.ts file for implementation
    return String.toBoolean(givenString);
  };
}

if (!String.prototype.toCamelCase) {
  String.prototype.toCamelCase = function (): string {
    if (!this) {
      return '';
    }

    const value: string = String(this);
    let result: string = value
      .split(' ')
      .map((splitResult: string) => splitResult.substring(0, 1).toUpperCase() + splitResult.substring(1))
      .map((joinedResult: string) => joinedResult.replace(/\//g, '').replace(/-/g, ''))
      .join('');

    result = result.substring(0, 1).toLowerCase() + result.substr(1);

    return result;
  };
}

if (!String.prototype.capitalizeFirstLetter) {
  String.prototype.capitalizeFirstLetter = function (): string {
    if (!this) {
      return this;
    }

    return this.charAt(0).toUpperCase() + this.slice(1);
  };
}
