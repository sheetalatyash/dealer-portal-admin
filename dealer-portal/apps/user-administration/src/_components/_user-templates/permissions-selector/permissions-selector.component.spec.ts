import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionsSelectorComponent } from '@components/_user-templates';

describe('PermissionsSelectorComponent', () => {
  let component: PermissionsSelectorComponent;
  let fixture: ComponentFixture<PermissionsSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
