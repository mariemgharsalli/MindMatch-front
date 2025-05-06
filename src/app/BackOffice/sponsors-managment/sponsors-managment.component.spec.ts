import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorsmanagementComponent } from './sponsors-managment.component';

describe('SponsorsManagmentComponent', () => {
  let component: SponsorsmanagementComponent;
  let fixture: ComponentFixture<SponsorsmanagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SponsorsmanagementComponent]
    });
    fixture = TestBed.createComponent(SponsorsmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
