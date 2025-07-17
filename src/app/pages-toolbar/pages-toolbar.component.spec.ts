import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesToolbarComponent } from './pages-toolbar.component';

describe('PagesToolbarComponent', () => {
  let component: PagesToolbarComponent;
  let fixture: ComponentFixture<PagesToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagesToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagesToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
