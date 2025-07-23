import { TestBed } from '@angular/core/testing';

import { CanvasClipboardService } from './canvas-clipboard.service';

describe('CanvasClipboardService', () => {
  let service: CanvasClipboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasClipboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
