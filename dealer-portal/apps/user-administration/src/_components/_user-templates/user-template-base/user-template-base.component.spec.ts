import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserTemplateBaseComponent } from './user-template-base.component';

describe('UserTemplateBaseComponent', () => {
  let component: UserTemplateBaseComponent;
  let fixture: ComponentFixture<UserTemplateBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTemplateBaseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserTemplateBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
