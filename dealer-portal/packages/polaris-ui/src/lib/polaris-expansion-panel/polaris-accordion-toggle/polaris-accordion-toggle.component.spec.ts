import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisAccordionToggle } from './polaris-accordion-toggle.component';

describe('PolarisAccordionToggle', () => {
  let component: PolarisAccordionToggle;
  let fixture: ComponentFixture<PolarisAccordionToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisAccordionToggle],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisAccordionToggle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
