import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisHeading } from './polaris-heading.component';

describe('PolarisHeadingComponent', () => {
  let component: PolarisHeading;
  let fixture: ComponentFixture<PolarisHeading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisHeading],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisHeading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
