import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisSelect } from './polaris-select.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PolarisSelectComponent', () => {
  let component: PolarisSelect<null>;
  let fixture: ComponentFixture<PolarisSelect<null>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisSelect<null>, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisSelect<null>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
