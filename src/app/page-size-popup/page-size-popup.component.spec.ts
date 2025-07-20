import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSizePopupComponent } from './page-size-popup.component';

describe('PageSizePopupComponent', () => {
  let component: PageSizePopupComponent;
  let fixture: ComponentFixture<PageSizePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageSizePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageSizePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
