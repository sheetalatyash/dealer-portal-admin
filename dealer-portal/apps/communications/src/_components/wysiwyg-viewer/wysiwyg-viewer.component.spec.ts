import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WysiwygViewerComponent } from './wysiwyg-viewer.component';

describe('WysiwygViewerComponent', () => {
  let component: WysiwygViewerComponent;
  let fixture: ComponentFixture<WysiwygViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WysiwygViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WysiwygViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
