import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNumberSettingsComponent } from './page-number-settings.component';

describe('PageNumberSettingsComponent', () => {
  let component: PageNumberSettingsComponent;
  let fixture: ComponentFixture<PageNumberSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageNumberSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageNumberSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
