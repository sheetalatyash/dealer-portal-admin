import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisTextarea } from './polaris-textarea.component';

describe('PolarisTextarea', () => {
  let component: PolarisTextarea<unknown>;
  let fixture: ComponentFixture<PolarisTextarea<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisTextarea],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisTextarea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
