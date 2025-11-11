import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true,
})
export class FileSizePipe implements PipeTransform {
  private readonly units = ['B', 'KB', 'MB', 'GB'];

  transform(value: number, unit: 'B' | 'KB' | 'MB' | 'GB' | 'auto' = 'auto', digits = 2): string {
    if (isNaN(value) || value < 0) {
      return '';
    }

    let index = 0;
    let convertedValue = value;

    // Convert to the specified unit
    if (unit !== 'auto') {
      index = this.units.indexOf(unit.toUpperCase());
      if (index === -1) {
        throw new Error(`Invalid unit: ${unit}`);
      }
      convertedValue = value / Math.pow(1024, index);
    } else {
      // Convert to the most appropriate unit
      while (convertedValue >= 1024 && index < this.units.length - 1) {
        convertedValue /= 1024;
        index++;
      }
    }

    return `${convertedValue.toFixed(digits)} ${this.units[index]}`;
  }
}
