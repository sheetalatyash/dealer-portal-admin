import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  PermissionsSelectorDialogComponent
} from './permissions-selector-dialog.component';

describe('PermissionsSelectorDialogComponent', () => {
  let component: PermissionsSelectorDialogComponent;
  let fixture: ComponentFixture<PermissionsSelectorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsSelectorDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionsSelectorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
