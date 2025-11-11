import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationsTemplateComponent } from './communications-template.component';

describe('CommunicationsTemplateComponent', () => {
  let component: CommunicationsTemplateComponent;
  let fixture: ComponentFixture<CommunicationsTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationsTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationsTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
