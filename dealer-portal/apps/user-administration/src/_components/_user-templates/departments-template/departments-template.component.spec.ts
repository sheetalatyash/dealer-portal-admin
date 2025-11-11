import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartmentsTemplateComponent } from '@components/_user-templates';

describe('DepartmentsTemplateComponent', () => {
  let component: DepartmentsTemplateComponent;
  let fixture: ComponentFixture<DepartmentsTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentsTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentsTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
