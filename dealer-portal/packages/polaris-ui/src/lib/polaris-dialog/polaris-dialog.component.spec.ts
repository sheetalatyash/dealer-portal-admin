import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisDialog } from './polaris-dialog.component';

describe('PolarisDialog', () => {
  let component: PolarisDialog;
  let fixture: ComponentFixture<PolarisDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
