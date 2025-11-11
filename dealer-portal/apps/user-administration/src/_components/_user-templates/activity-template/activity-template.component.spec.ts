import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityTemplateComponent } from '@components/_user-templates';

describe('ActivityTemplateComponent', () => {
  let component: ActivityTemplateComponent;
  let fixture: ComponentFixture<ActivityTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
