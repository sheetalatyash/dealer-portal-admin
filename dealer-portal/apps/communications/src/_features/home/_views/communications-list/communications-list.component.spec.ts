import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationsListComponent } from './communications-list.component';
import { CommunicationsService } from '@services';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Import this

describe('CommunicationsListComponent', () => {
  let component: CommunicationsListComponent;
  let fixture: ComponentFixture<CommunicationsListComponent>;
  let mockCommunicationService: jest.Mocked<CommunicationsService>;

  beforeEach(async () => {
    mockCommunicationService = {
      getCommunications$: jest.fn().mockReturnValue(of([])),
    } as unknown as jest.Mocked<CommunicationsService>;

    await TestBed.configureTestingModule({
      imports: [CommunicationsListComponent, BrowserAnimationsModule],
      providers: [{ provide: CommunicationsService, useValue: mockCommunicationService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
