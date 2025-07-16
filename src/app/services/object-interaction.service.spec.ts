import { TestBed } from '@angular/core/testing';

import { ObjectInteractionService } from './object-interaction.service';

describe('ObjectInteractionService', () => {
  let service: ObjectInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
