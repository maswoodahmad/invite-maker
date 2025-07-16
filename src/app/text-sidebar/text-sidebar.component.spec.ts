import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextSidebarComponent } from './text-sidebar.component';

describe('TextSidebarComponent', () => {
  let component: TextSidebarComponent;
  let fixture: ComponentFixture<TextSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
