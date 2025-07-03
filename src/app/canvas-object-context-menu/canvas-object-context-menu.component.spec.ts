import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasObjectContextMenuComponent } from './canvas-object-context-menu.component';

describe('CanvasObjectContextMenuComponent', () => {
  let component: CanvasObjectContextMenuComponent;
  let fixture: ComponentFixture<CanvasObjectContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasObjectContextMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasObjectContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
