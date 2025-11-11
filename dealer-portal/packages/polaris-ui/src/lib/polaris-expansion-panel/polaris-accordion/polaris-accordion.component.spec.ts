import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisAccordion } from './polaris-accordion.component';

describe('PolarisAccordion', () => {
  let component: PolarisAccordion;
  let fixture: ComponentFixture<PolarisAccordion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisAccordion],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisAccordion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
