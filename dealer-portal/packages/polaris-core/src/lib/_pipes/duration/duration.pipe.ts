import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  /**
   * Transforms a number of seconds into duration as '00:00:00'.
   *
   * @param value - The string to be transformed. If no value is provided, an empty string is returned.
   * @returns The transformed value as a duration.
   */
  public transform(value: number): string {
    // If a nonsense value is provided, return an empty string to avoid errors in template bindings or Angular expressions
    if (!isFinite(value) || value < 0) {
      return '00:00';
    }

    const totalSeconds: number = Math.floor(value);
    const hours: number = Math.floor(totalSeconds / 3600);
    const minutes: number = Math.floor((totalSeconds % 3600) / 60);
    const seconds: number = totalSeconds % 60;

    const hh: string = String(hours).padStart(2, '0');
    const mm: string = String(minutes).padStart(2, '0');
    const ss: string = String(seconds).padStart(2, '0');

    // If there are hours, include them; otherwise just MM:SS
    return hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
  }
}
