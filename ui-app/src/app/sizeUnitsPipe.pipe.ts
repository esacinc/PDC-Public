import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sizeUnits' })
export class SizeUnitsPipe implements PipeTransform {

  transform(bytes: number): string {
    const kB = 1024;
    const p = 1;

    if (bytes >= Math.pow(kB, 4)) { return (bytes / Math.pow(kB, 4)).toFixed(p) + ' TB'; }
    if (bytes >= 100 * Math.pow(kB, 3)) { return (bytes / Math.pow(kB, 3)).toFixed(0) + ' GB'; }
    if (bytes >= 10 * Math.pow(kB, 3)) { return (bytes / Math.pow(kB, 3)).toFixed(1) + ' GB'; }
    if (bytes >= Math.pow(kB, 3)) { return (bytes / Math.pow(kB, 3)).toFixed(2) + ' GB'; }
    if (bytes >= 100 * Math.pow(kB, 2)) { return (bytes / Math.pow(kB, 2)).toFixed(0) + ' MB'; }
    if (bytes >= 10 * Math.pow(kB, 2)) { return (bytes / Math.pow(kB, 2)).toFixed(1) + ' MB'; }
    if (bytes >= Math.pow(kB, 2)) { return (bytes / Math.pow(kB, 2)).toFixed(2) + ' MB'; }
    if (bytes >= 100 * kB) { return (bytes / kB).toFixed(0) + ' kB'; }
    if (bytes >= 10 * kB) { return (bytes / kB).toFixed(1) + ' kB'; }
    if (bytes >= kB) { return (bytes / kB).toFixed(2) + ' kB'; }

    return bytes + ' B';
  }

}
