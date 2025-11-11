import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisIcon } from './polaris-icon.component';

describe('PolarisIcon', () => {
  let component: PolarisIcon;
  let fixture: ComponentFixture<PolarisIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisIcon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
