import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationAddEditAccountTargetsComponent } from './communication-add-edit-account-targets.component';

describe('CommunicationAddEditAccountTargetsComponent', () => {
  let component: CommunicationAddEditAccountTargetsComponent;
  let fixture: ComponentFixture<CommunicationAddEditAccountTargetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationAddEditAccountTargetsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationAddEditAccountTargetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
