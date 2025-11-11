import { Component, Inject, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PolarisDialog, PolarisLoader } from '@dealer-portal/polaris-ui';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Dialog component that displays a training video (Vimeo) inside a responsive iframe.
 */
@Component({
  selector: 'training-video-dialog',
  standalone: true,
  imports: [CommonModule, PolarisDialog, PolarisLoader],
  templateUrl: './training-video-dialog.component.html',
  styleUrls: ['./training-video-dialog.component.scss'],
})
export class TrainingVideoDialogComponent implements AfterViewInit, OnDestroy {
  /** The sanitized iframe source URL */
  public safeVideoUrl: SafeResourceUrl;
  /** Flag when the Vimeo player reports it is ready */
  public isVideoReady = false;
  /** Flag indicating if an error occurred while loading/playing the video */
  public hasError = false;
  /** Error message to display if video fails to load/play */
  public errorMessage = '';

  /** Reference to the iframe element */
  @ViewChild('vimeoIframe', { static: false }) private _iframeRef?: ElementRef<HTMLIFrameElement>;

  private _iframeMessageHandler = (event: MessageEvent) => this._onWindowMessage(event);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      videoUrl?: string;
      title?: string;
    },
    public dialogRef: MatDialogRef<TrainingVideoDialogComponent>,
    private _sanitizer: DomSanitizer,
  ) {
    const videoUrl = data?.videoUrl ?? '';
    this.safeVideoUrl = this._sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  public ngAfterViewInit(): void {
    // Listen for postMessage events from the Vimeo iframe
    window.addEventListener('message', this._iframeMessageHandler, false);
  }

  public ngOnDestroy(): void {
    // Remove listener for postMessage events from the Vimeo iframe
    window.removeEventListener('message', this._iframeMessageHandler, false);
  }

  /** Handle postMessage events from Vimeo iframe */
  private _onWindowMessage(event: MessageEvent): void {
    // Ensure message originates from a Vimeo domain
    if (!event.origin.includes('vimeo.com')) {
      return;
    }

    // Parse the Vimeo MessageEvent data
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      // When player is ready it emits { event: 'ready' }
      if (data?.event === 'ready') {
        this.isVideoReady = true;
      }

      if (data?.event === 'error') {
        this.hasError = true;
        this.errorMessage = data?.data?.message;
      }
    } catch {
      // Ignore parsing errors
    }
  }
}
