import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferenceViewComponent } from './conference-view.component';

describe('ConferenceViewComponent', () => {
  let component: ConferenceViewComponent;
  let fixture: ComponentFixture<ConferenceViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConferenceViewComponent]
    });
    fixture = TestBed.createComponent(ConferenceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
