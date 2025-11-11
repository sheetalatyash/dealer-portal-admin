// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Date {
  getWeek(): Date[];
}

/*
 * Get array of dates for the entire week based on a date.
 * Not culture specific, but can be enhanced when needed.
 * For example Fri 2021-10-01T05:00:00.000Z will return
 * [
 * "2021-09-26T05:00:00.000Z", Sun
 * "2021-09-27T05:00:00.000Z", Mon
 * "2021-09-28T05:00:00.000Z", Tue
 * "2021-09-29T05:00:00.000Z", Wed
 * "2021-09-30T05:00:00.000Z", Thu
 * "2021-10-01T05:00:00.000Z", Fri
 * "2021-10-02T05:00:00.000Z"  Sat
 * ]
 */
if (!Date.prototype.getWeek) {
  Date.prototype.getWeek = function () {
    const sunday = new Date(this.setDate(this.getDate() - this.getDay()));
    const result = [new Date(sunday)];
    while (sunday.setDate(sunday.getDate() + 1) && sunday.getDay() !== 0) {
      result.push(new Date(sunday));
    }

    return result;
  };
}
