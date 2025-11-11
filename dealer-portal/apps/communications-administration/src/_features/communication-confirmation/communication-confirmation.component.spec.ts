import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationConfirmationComponent } from './communication-confirmation.component';

describe('CommunicationConfirmationComponent', () => {
  let component: CommunicationConfirmationComponent;
  let fixture: ComponentFixture<CommunicationConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationConfirmationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
