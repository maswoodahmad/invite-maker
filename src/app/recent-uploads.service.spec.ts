import { TestBed } from '@angular/core/testing';

import { RecentUploadsService } from './recent-uploads.service';

describe('RecentUploadsService', () => {
  let service: RecentUploadsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentUploadsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
