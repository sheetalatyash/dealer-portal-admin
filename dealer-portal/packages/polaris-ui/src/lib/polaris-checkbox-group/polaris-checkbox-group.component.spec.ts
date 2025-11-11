import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisCheckboxGroup } from './polaris-checkbox-group.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

describe('PolarisCheckboxGroup', () => {
  let component: PolarisCheckboxGroup<string>;
  let fixture: ComponentFixture<PolarisCheckboxGroup<string>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisCheckboxGroup, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisCheckboxGroup<string>);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
