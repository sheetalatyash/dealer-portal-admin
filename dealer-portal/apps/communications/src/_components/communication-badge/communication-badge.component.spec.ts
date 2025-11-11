import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationBadgeComponent } from './communication-badge.component';

describe('CommunicationBadgeComponent', () => {
  let component: CommunicationBadgeComponent;
  let fixture: ComponentFixture<CommunicationBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
