import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditWidgetsComponent } from './edit-widgets.component';

describe('EditWidgetsComponent', () => {
  let component: EditWidgetsComponent;
  let fixture: ComponentFixture<EditWidgetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditWidgetsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
