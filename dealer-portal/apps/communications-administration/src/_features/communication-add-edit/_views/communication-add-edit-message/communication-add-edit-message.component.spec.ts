import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationAddEditMessageComponent } from './communication-add-edit-message.component';

describe('CommunicationAddEditMessageComponent', () => {
  let component: CommunicationAddEditMessageComponent;
  let fixture: ComponentFixture<CommunicationAddEditMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationAddEditMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationAddEditMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
