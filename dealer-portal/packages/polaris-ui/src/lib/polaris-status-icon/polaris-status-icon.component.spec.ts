import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisStatusIcon } from './polaris-status-icon.component';

describe('PolarisStatusIcon', () => {
  let component: PolarisStatusIcon;
  let fixture: ComponentFixture<PolarisStatusIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisStatusIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisStatusIcon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
