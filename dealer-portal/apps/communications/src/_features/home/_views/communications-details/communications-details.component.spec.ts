import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationsDetailsComponent } from './communications-details.component';
import { RouterModule } from '@angular/router';
import { CommunicationsService } from '@services';

jest.mock('@services/communications/communications.service');

describe('CommunicationsDetailsComponent', () => {
  let component: CommunicationsDetailsComponent;
  let fixture: ComponentFixture<CommunicationsDetailsComponent>;
  let mockCommunicationService: jest.Mocked<CommunicationsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationsDetailsComponent, RouterModule.forRoot([])],
      providers: [CommunicationsService],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationsDetailsComponent);
    mockCommunicationService = TestBed.inject(CommunicationsService) as jest.Mocked<CommunicationsService>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
