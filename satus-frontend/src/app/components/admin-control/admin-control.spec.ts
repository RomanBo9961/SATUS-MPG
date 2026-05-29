import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminControl } from './admin-control';

describe('AdminControl', () => {
  let component: AdminControl;
  let fixture: ComponentFixture<AdminControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminControl],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminControl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
