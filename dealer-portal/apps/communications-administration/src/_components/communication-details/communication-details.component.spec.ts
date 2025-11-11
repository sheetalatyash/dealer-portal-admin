import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationDetailsComponent } from './communication-details.component';

describe('CommunicationDetailsComponent', () => {
  let component: CommunicationDetailsComponent;
  let fixture: ComponentFixture<CommunicationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
