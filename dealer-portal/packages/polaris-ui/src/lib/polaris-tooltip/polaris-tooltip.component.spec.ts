import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisTooltip } from './polaris-tooltip.component';

describe('PolarisTooltip', () => {
  let component: PolarisTooltip;
  let fixture: ComponentFixture<PolarisTooltip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisTooltip],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisTooltip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
