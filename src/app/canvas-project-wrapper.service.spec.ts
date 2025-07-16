import { TestBed } from '@angular/core/testing';

import { CanvasProjectWrapperService } from './canvas-project-wrapper.service';

describe('CanvasProjectWrapperService', () => {
  let service: CanvasProjectWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasProjectWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
