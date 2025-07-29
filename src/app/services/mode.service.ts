import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModeService {
  constructor() {}

  private modeSubject = new BehaviorSubject<'editing' | 'viewing'>('editing');

  mode$ = this.modeSubject.asObservable();

  setMode(mode: 'editing' | 'viewing') {
    this.modeSubject.next(mode);
  }
}
