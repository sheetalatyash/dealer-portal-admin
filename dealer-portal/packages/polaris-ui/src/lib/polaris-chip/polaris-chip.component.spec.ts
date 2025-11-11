import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisChip } from './polaris-chip.component';

describe('PolarisChipComponent', () => {
  let component: PolarisChip;
  let fixture: ComponentFixture<PolarisChip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisChip],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisChip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
