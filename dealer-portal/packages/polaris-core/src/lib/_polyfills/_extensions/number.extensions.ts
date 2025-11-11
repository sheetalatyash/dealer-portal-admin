// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Number {
  toBytesString(): string;
}

// 1000 = 1000 Bytes
// 10000 = 10 KB
// 100000 = 98 KB
// 1000000 = 977 KB
// 10000000 = 10 MB
if (!Number.prototype.toBytesString) {
  Number.prototype.toBytesString = function (decimals = 0) {
    // Use double equals not triple
    if (this === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const thisValue = this as number;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const index = Math.floor(Math.log(thisValue) / Math.log(k));
    const value = thisValue / Math.pow(k, index);

    return `${Math.ceil(value).toFixed(decimals)} ${sizes[index]}`;
  };
}
