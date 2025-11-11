import { Component, ElementRef, EventEmitter, Input, Output, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'comm-wysiwyg-viewer',
    imports: [CommonModule],
    templateUrl: './wysiwyg-viewer.component.html',
    styleUrl: './wysiwyg-viewer.component.scss'
})
export class WysiwygViewerComponent implements AfterViewInit {
  @Input() content: string = '';
  @Input() preventDefaultLinkBehavior: boolean = false;
  @Input() maxLines: number = 0;

  @Output() linkClicked = new EventEmitter<HTMLAnchorElement>();

  truncateContent = true;

  constructor(private _elRef: ElementRef) {}

  public ngAfterViewInit(): void {
    this._addLinkClickListener();
  }

  public toggleContentTruncation(event: MouseEvent): void {
    event.preventDefault();
    this.truncateContent = !this.truncateContent;
  }

  public isContentTruncated(contentSpan: HTMLElement): boolean {
    return contentSpan.scrollHeight > contentSpan.clientHeight;
  }

  private _addLinkClickListener(): void {
    const element = this._elRef.nativeElement.querySelector('.wysiwyg-content');
    if (element) {
      element.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLElement;
        if (target instanceof HTMLAnchorElement) {
          if (this.preventDefaultLinkBehavior) {
            event.preventDefault();
          }
          this.linkClicked.emit(target);
        }
      });
    }
  }
}
