import { TestBed } from '@angular/core/testing';

import { TemplateLoaderService } from './template-loader.service';

describe('TemplateLoaderService', () => {
  let service: TemplateLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
