import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayFieldComponent } from '@components';

describe('DisplayFieldComponent', () => {
  let component: DisplayFieldComponent;
  let fixture: ComponentFixture<DisplayFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
