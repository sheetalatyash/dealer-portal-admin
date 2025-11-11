import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StaffRolesTemplateComponent } from '@components/_user-templates';

describe('StaffRolesTemplateComponent', () => {
  let component: StaffRolesTemplateComponent;
  let fixture: ComponentFixture<StaffRolesTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffRolesTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffRolesTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
