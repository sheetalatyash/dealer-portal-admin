import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisIconButton } from './polaris-icon-button.component';

describe('PolarisIconButton', () => {
  let component: PolarisIconButton;
  let fixture: ComponentFixture<PolarisIconButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisIconButton],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisIconButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
