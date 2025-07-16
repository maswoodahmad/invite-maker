import { TestBed } from '@angular/core/testing';

import { CanvasControlService } from './canvas-control.service';

describe('CanvasControlService', () => {
  let service: CanvasControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
