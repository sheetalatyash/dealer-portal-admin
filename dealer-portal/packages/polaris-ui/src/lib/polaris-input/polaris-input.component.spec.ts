import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisInput } from './polaris-input.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PolarisInput', () => {
  let component: PolarisInput<unknown>;
  let fixture: ComponentFixture<PolarisInput<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisInput, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
