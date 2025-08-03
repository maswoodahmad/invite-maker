import { Pipe, PipeTransform } from '@angular/core';



@Pipe({ name: 'numberArray' })
export class NumberArrayPipe implements PipeTransform {
  transform(length: number, step: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < length; i += step) {
      result.push(i);
    }
    return result;
  }
}
