import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslationSavedDialogComponent } from './translation-saved-dialog.component';

describe('TranslationSavedDialogComponent', () => {
  let component: TranslationSavedDialogComponent;
  let fixture: ComponentFixture<TranslationSavedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslationSavedDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslationSavedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
