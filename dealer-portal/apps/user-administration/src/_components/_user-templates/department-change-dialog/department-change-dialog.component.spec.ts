import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DepartmentChangeDialogComponent
} from './department-change-dialog.component';

describe('DepartmentChangeDialogComponent', () => {
  let component: DepartmentChangeDialogComponent;
  let fixture: ComponentFixture<DepartmentChangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentChangeDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
