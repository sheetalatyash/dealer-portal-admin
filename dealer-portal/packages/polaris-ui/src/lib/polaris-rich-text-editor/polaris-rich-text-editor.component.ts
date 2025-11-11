import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RawEditorOptions } from 'tinymce';
import { EditorComponent, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatError, MatLabel } from '@angular/material/form-field';
import { POLARIS_RICH_TEXT_EDITOR_SRC_URL_TOKEN } from '@dealer-portal/polaris-shared';
import { tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PolarisUiFormBase } from '../polaris-ui-form-base';
import { PolarisRichTextEditorOptions } from './polaris-rich-text-editor.type';

@UntilDestroy()
@Component({
    selector: 'polaris-rich-text-editor',
    imports: [CommonModule, EditorComponent, ReactiveFormsModule, MatLabel, MatError],
    providers: [
        {
            provide: TINYMCE_SCRIPT_SRC,
            useFactory: () => inject(POLARIS_RICH_TEXT_EDITOR_SRC_URL_TOKEN),
        },
    ],
    templateUrl: './polaris-rich-text-editor.component.html',
    styleUrl: './polaris-rich-text-editor.component.scss'
})
export class PolarisRichTextEditor<T> extends PolarisUiFormBase<T> implements OnInit {
  @Input() config!: PolarisRichTextEditorOptions;

  defaultEditorConfig: RawEditorOptions = {
    statusbar: false,
    branding: false,
    menubar: false,
    promotion: false,
    toolbar:
      'undo redo  | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image',
    plugins: ['link', 'image', 'lists'],
    xss_sanitization: true,
    skin: 'tinymce-5',
  };

  editorConfig: RawEditorOptions = {};

  public override ngOnInit(): void {
    super.ngOnInit();
    this._subscribeToFormControlEvents();
    this.editorConfig = { ...this.defaultEditorConfig, ...this.config };
  }

  /**
   * Subscribes to form control events and processes errors when the form control becomes invalid.
   *
   * @remarks
   * This method sets up a subscription to the `events` observable of the form control.
   * When the form control becomes invalid, it calls the `_getErrorMessages` method with the form control errors.
   * The subscription is automatically cleaned up when the component is destroyed using the `untilDestroyed` operator.
   *
   */
  private _subscribeToFormControlEvents(): void {
    this.formControl.events
      .pipe(
        tap((): void => {
          if (this.formControl.invalid && this.formControl.errors) {
            this.getErrorMessages(this.formControl.errors as ValidationErrors);
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
