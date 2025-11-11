/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Array<T> {
  unique(): any[];
  flatten(): [];
  sum(): number;
  closest(goal: number): number;
  groupBy(key: string): any;
  last(): any;
}

// Remove duplicates
if (!Array.prototype.unique) {
  Array.prototype.unique = function () {
    return this.filter((value, index, self) => self.indexOf(value) === index);
  };
}

if (!Array.prototype.flatten) {
  Array.prototype.flatten = function () {
    return this.reduce((a, b) => a.concat(b), []);
  };
}

if (!Array.prototype.sum) {
  Array.prototype.sum = function () {
    return this.reduce((a, b) => a + b, 0);
  };
}

// Returns: [{key: key, value: [{}]}]
if (!Array.prototype.groupBy) {
  Array.prototype.groupBy = function (groupByKey) {
    if (!groupByKey) {
      return this;
    }

    return this.reduce(
      (returnValue, item) => {
        const key = item[groupByKey].toString();

        if (key == null) {
          return returnValue;
        }

        const existingItem = returnValue.filter((x: any) => x.key === key);
        if (existingItem && existingItem.length === 1 && existingItem[0].key === key) {
          existingItem[0].value.push(item);
        } else {
          returnValue.push({
            key,
            value: [item],
          });
        }

        return returnValue.filter((x: any) => x.key);
      },
      [{}]
    );
  };
}

if (!Array.prototype.closest) {
  Array.prototype.closest = function (goal) {
    if (!this || this.length === 0) {
      return null;
    }

    return this.reduce((prev, curr) => (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev));
  };
}

if (!Array.prototype.last) {
  Array.prototype.last = function () {
    return this[this.length - 1];
  };
}
