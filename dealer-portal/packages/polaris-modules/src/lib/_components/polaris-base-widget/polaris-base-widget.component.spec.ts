import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisBaseWidgetComponent } from './polaris-base-widget.component';

describe('PolarisBaseWidgetComponent', () => {
  let component: PolarisBaseWidgetComponent;
  let fixture: ComponentFixture<PolarisBaseWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisBaseWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisBaseWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
