import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisCard } from './polaris-card.component';

describe('PolarisCard', () => {
  let component: PolarisCard;
  let fixture: ComponentFixture<PolarisCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
