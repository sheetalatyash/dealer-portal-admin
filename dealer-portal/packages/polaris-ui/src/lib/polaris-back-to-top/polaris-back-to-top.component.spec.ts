import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisBackToTop } from './polaris-back-to-top.component';

describe('PolarisBackToTop', () => {
  let component: PolarisBackToTop;
  let fixture: ComponentFixture<PolarisBackToTop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisBackToTop],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisBackToTop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
