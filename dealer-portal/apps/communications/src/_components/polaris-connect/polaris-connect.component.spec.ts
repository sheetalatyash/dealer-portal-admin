import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisConnectComponent } from './polaris-connect.component';

describe('PolarisConnectComponent', () => {
  let component: PolarisConnectComponent;
  let fixture: ComponentFixture<PolarisConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisConnectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
