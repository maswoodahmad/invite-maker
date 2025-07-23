import { TestBed } from '@angular/core/testing';

import { ObjectFactoryService } from './object-factory.service';

describe('ObjectFactoryService', () => {
  let service: ObjectFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
