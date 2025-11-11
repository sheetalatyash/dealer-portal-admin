import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Communication, DurationPipe, ResourceService } from '@dealer-portal/polaris-core';
import { PolarisBadge, PolarisBadgeColor, PolarisHeading, PolarisIcon } from '@dealer-portal/polaris-ui';
import { CommunicationsService } from '@services';
import { fromEvent, take } from 'rxjs';

@Component({
  selector: 'comm-video-thumbnail',
  imports: [
    CommonModule,
    PolarisBadge,
    PolarisHeading,
    PolarisIcon,
  ],
  templateUrl: './video-thumbnail.component.html',
  styleUrl: './video-thumbnail.component.scss',
})
export class VideoThumbnailComponent implements AfterViewInit {
  @ViewChild('thumbnailElement') thumbnailElement!: ElementRef<HTMLDivElement>;
  @ViewChild('probe') videoProbe!: ElementRef<HTMLVideoElement>;

  @Input() videoCommunication!: Communication;
  @Input() thumbnailWidth: string = '160px';
  @Input() thumbnailHeight: string = '90px';
  @Input() backgroundImageName: string = 'thumbnail.png';
  @Input() duration: string = '00:00';
  @Input() active: boolean = false;

  @Output() thumbnailClicked: EventEmitter<void> = new EventEmitter<void>();

  public readonly polarisBadgeColor: typeof PolarisBadgeColor = PolarisBadgeColor;
  public durationPipe: DurationPipe = new DurationPipe();

  private _hasFired: boolean = false;

  constructor(
    private _resourceService: ResourceService,
    private _communicationService: CommunicationsService,
  ) {}

  public ngAfterViewInit (): void {
    this._configureThumbnail();
  }

  private _configureThumbnail(): void {
    const videoElement: HTMLVideoElement = this.videoProbe.nativeElement;

    const thumbnail: HTMLDivElement = this.thumbnailElement.nativeElement;
    const cdnLocation: string | undefined  = this._resourceService.getCDNPath();
    const backgroundImageLocation: string = `images/${this.backgroundImageName}`;
    const backgroundImagePath: string = cdnLocation ? `${cdnLocation}/${backgroundImageLocation}` : `${backgroundImageLocation}`;

    thumbnail.style.backgroundImage = `url('${backgroundImagePath}')`;
    thumbnail.style.backgroundSize = 'contain';
    thumbnail.style.backgroundPosition = 'center';
    thumbnail.style.backgroundRepeat = 'no-repeat';
    thumbnail.style.minWidth = this.thumbnailWidth;
    thumbnail.style.maxWidth = this.thumbnailWidth;
    thumbnail.style.minHeight = this.thumbnailHeight;
    thumbnail.style.maxHeight = this.thumbnailHeight;
    thumbnail.style.backgroundColor = 'var(--polaris-primary)';
    thumbnail.style.color = 'var(--polaris-white)';

    videoElement.style.minWidth = this.thumbnailWidth;
    videoElement.style.maxWidth = this.thumbnailWidth;
    videoElement.style.minHeight = this.thumbnailHeight;
    videoElement.style.maxHeight = this.thumbnailHeight;

    // Listen for loadedmetadata once
    fromEvent(videoElement, 'loadedmetadata')
      .pipe(take(1))
      .subscribe(() => {
        this._hasFired = true;
        this.duration = this.durationPipe.transform(videoElement.duration);
      });

    // Handle load errors
    fromEvent<ErrorEvent>(videoElement, 'error').pipe(take(1)).subscribe(err => {
      console.error('Metadata load error', err);
      this.duration = this.durationPipe.transform(videoElement.duration);
    });
  }

  public isNewCommunication(startDate: string | undefined): boolean {
    return this._communicationService.isNewCommunication(startDate);
  }

  public getVideoSrc(communication: Communication): string {
    return communication.videoLinks?.[0] ?? '';
  }

  public emitThumbnailClicked(): void {
    this.thumbnailClicked.emit();
  }
}
