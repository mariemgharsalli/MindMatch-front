import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferencemanagmentComponent} from './conference-managment.component';

describe('ConferenceManagmentComponent', () => {
  let component: ConferencemanagmentComponent;
  let fixture: ComponentFixture<ConferencemanagmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConferencemanagmentComponent]
    });
    fixture = TestBed.createComponent(ConferencemanagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
