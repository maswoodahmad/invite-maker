import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasProjectWrapperComponent } from './canvas-project-wrapper.component';

describe('CanvasProjectWrapperComponent', () => {
  let component: CanvasProjectWrapperComponent;
  let fixture: ComponentFixture<CanvasProjectWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasProjectWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasProjectWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
