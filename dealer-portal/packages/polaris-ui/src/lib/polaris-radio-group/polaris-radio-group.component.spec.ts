import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisRadioGroup } from './polaris-radio-group.component';

describe('PolarisRadioGroup', () => {
  let component: PolarisRadioGroup<string>;
  let fixture: ComponentFixture<PolarisRadioGroup<string>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisRadioGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisRadioGroup<string>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
