import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisError } from './polaris-error.component';

describe('PolarisError', () => {
  let component: PolarisError;
  let fixture: ComponentFixture<PolarisError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisError],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisError);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
