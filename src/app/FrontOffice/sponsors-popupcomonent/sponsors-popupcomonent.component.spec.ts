import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorPopupComponent } from './sponsors-popupcomonent.component';

describe('SponsorsPopupcomonentComponent', () => {
  let component: SponsorPopupComponent;
  let fixture: ComponentFixture<SponsorPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SponsorPopupComponent]
    });
    fixture = TestBed.createComponent(SponsorPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
