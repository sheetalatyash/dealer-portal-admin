import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisUiBase } from './polaris-ui-base.component';

describe('PolarisUiBaseComponent', () => {
  let component: PolarisUiBase;
  let fixture: ComponentFixture<PolarisUiBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisUiBase],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisUiBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
