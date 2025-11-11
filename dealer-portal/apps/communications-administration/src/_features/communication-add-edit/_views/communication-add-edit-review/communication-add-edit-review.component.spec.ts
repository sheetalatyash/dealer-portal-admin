import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationAddEditReviewComponent } from './communication-add-edit-review.component';

describe('CommunicationAddEditReviewComponent', () => {
  let component: CommunicationAddEditReviewComponent;
  let fixture: ComponentFixture<CommunicationAddEditReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationAddEditReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationAddEditReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
