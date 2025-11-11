import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationAddEditUserTargetsComponent } from './communication-add-edit-user-targets.component';

describe('CommunicationAddEditUserTargetsComponent', () => {
  let component: CommunicationAddEditUserTargetsComponent;
  let fixture: ComponentFixture<CommunicationAddEditUserTargetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationAddEditUserTargetsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationAddEditUserTargetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
