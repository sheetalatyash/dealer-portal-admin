import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactInfoTemplateComponent } from '@components/_user-templates';

describe('ContactInfoComponentTemplate', () => {
  let component: ContactInfoTemplateComponent;
  let fixture: ComponentFixture<ContactInfoTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactInfoTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactInfoTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
