import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferenceStatsComponent } from './conference-stats.component';

describe('ConferenceStatsComponent', () => {
  let component: ConferenceStatsComponent;
  let fixture: ComponentFixture<ConferenceStatsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConferenceStatsComponent]
    });
    fixture = TestBed.createComponent(ConferenceStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
