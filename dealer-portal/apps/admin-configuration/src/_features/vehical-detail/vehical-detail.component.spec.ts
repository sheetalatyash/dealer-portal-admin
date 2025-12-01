import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicalDetailComponent } from './vehical-detail.component';

describe('VehicalDetailComponent', () => {
  let component: VehicalDetailComponent;
  let fixture: ComponentFixture<VehicalDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicalDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
