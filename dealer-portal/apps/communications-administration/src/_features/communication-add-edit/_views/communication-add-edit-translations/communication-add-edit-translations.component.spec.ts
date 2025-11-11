import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationAddEditTranslationsComponent } from './communication-add-edit-translations.component';

describe('CommunicationAddEditTranslationsComponent', () => {
  let component: CommunicationAddEditTranslationsComponent;
  let fixture: ComponentFixture<CommunicationAddEditTranslationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationAddEditTranslationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationAddEditTranslationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
