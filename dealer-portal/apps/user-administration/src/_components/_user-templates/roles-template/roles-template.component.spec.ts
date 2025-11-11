import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RolesTemplateComponent } from './roles-template.component';

describe('RolesTemplateComponent', () => {
  let component: RolesTemplateComponent;
  let fixture: ComponentFixture<RolesTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RolesTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
