import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'ca-rich-text-viewer',
    imports: [CommonModule],
    templateUrl: './rich-text-viewer.component.html',
    styleUrl: './rich-text-viewer.component.scss'
})
export class RichTextViewerComponent {
  @Input({ required: true }) content: string = '';

  constructor(public sanitizer: DomSanitizer) {}
}
