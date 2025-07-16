import { TestBed } from '@angular/core/testing';

import { CanvasViewService } from './canvas-view.service';

describe('CanvasViewService', () => {
  let service: CanvasViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
