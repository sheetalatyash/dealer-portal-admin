import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisRichTextEditor } from './polaris-rich-text-editor.component';
import { POLARIS_RICH_TEXT_EDITOR_SRC_URL_TOKEN } from '@dealer-portal/polaris-shared';

describe('RichTextEditorComponent', () => {
  let component: PolarisRichTextEditor<unknown>;
  let fixture: ComponentFixture<PolarisRichTextEditor<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisRichTextEditor],
      providers: [{ provide: POLARIS_RICH_TEXT_EDITOR_SRC_URL_TOKEN, useValue: 'some-url' }],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisRichTextEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
