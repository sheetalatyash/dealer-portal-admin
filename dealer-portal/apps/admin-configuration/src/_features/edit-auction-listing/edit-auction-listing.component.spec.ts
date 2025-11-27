import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditAuctionListingComponent } from './edit-auction-listing.component';

describe('EditAuctionListingComponent', () => {
  let component: EditAuctionListingComponent;
  let fixture: ComponentFixture<EditAuctionListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAuctionListingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAuctionListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
