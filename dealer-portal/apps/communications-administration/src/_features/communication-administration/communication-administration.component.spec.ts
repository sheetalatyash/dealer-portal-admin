import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationAdministrationComponent } from './communication-administration.component';

describe('CommunicationAdministrationComponent', () => {
  let component: CommunicationAdministrationComponent;
  let fixture: ComponentFixture<CommunicationAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationAdministrationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
