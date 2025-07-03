import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasObjectToolbarComponent } from './canvas-object-toolbar.component';

describe('CanvasObjectToolbarComponent', () => {
  let component: CanvasObjectToolbarComponent;
  let fixture: ComponentFixture<CanvasObjectToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasObjectToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasObjectToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
