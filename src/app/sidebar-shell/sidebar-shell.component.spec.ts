import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarShellComponent } from './sidebar-shell.component';

describe('SidebarShellComponent', () => {
  let component: SidebarShellComponent;
  let fixture: ComponentFixture<SidebarShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarShellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
