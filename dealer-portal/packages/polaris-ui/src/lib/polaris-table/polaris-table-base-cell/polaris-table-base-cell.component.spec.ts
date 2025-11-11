import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisTableBaseCell } from './polaris-table-base-cell.component';

describe('PolarisTableDateCellComponent', () => {
  let component: PolarisTableBaseCell;
  let fixture: ComponentFixture<PolarisTableBaseCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisTableBaseCell],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisTableBaseCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
