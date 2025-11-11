import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainingVideoDialogComponent } from './training-video-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TrainingVideoDialogComponent', () => {
  let component: TrainingVideoDialogComponent;
  let fixture: ComponentFixture<TrainingVideoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingVideoDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { videoUrl: 'https://player.vimeo.com/video/226053498?h=a1599a8ee9' } },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingVideoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a sanitized video url', () => {
    expect(component.safeVideoUrl).toBeTruthy();
  });
});
