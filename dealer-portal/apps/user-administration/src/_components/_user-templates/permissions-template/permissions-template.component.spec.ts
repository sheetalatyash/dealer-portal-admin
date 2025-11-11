import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionsTemplateComponent } from './permissions-template.component';

describe('PermissionsTemplateComponent', () => {
  let component: PermissionsTemplateComponent;
  let fixture: ComponentFixture<PermissionsTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionsTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
