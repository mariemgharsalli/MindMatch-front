import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionStatisticsComponent } from './session-statistics.component';

describe('SessionStatisticsComponent', () => {
  let component: SessionStatisticsComponent;
  let fixture: ComponentFixture<SessionStatisticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SessionStatisticsComponent]
    });
    fixture = TestBed.createComponent(SessionStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
