import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisButton } from './polaris-button.component';

describe('PolarisButton', () => {
  let component: PolarisButton;
  let fixture: ComponentFixture<PolarisButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisButton],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
