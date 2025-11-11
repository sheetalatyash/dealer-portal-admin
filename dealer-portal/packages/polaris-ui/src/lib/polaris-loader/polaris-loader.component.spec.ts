import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisLoader } from './polaris-loader.component';

describe('PolarisLoader', () => {
  let component: PolarisLoader;
  let fixture: ComponentFixture<PolarisLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisLoader],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisLoader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
