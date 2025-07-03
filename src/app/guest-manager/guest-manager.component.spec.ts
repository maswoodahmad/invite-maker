import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestManagerComponent } from './guest-manager.component';

describe('GuestManagerComponent', () => {
  let component: GuestManagerComponent;
  let fixture: ComponentFixture<GuestManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
