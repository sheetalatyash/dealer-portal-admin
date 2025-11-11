import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PolarisFilePickerFile,
  PolarisFilePickerStatus,
  PolarisFilePickerFileExtension,
  PolarisFilePickerError
} from './polaris-file-picker.type';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PolarisUiFormBase } from '../polaris-ui-form-base';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';
import { FileSizePipe } from '@dealer-portal/polaris-core';
import { PolarisIconButton } from '../polaris-icon-button';

@Component({
    selector: 'polaris-file-picker',
    imports: [CommonModule, MatProgressBarModule, PolarisIcon, FileSizePipe, PolarisIconButton],
    templateUrl: './polaris-file-picker.component.html',
    styleUrl: './polaris-file-picker.component.scss'
})
export class PolarisFilePicker<T> extends PolarisUiFormBase<T> {
  /**
   * Allow multiple file selection
   */
  @Input() allowMultiple: boolean = false;

  /**
   * Allows consecutive uploads without resetting the files (only relevant if allowMultiple is false).
   */
  @Input() allowConsecutive: boolean = false;

  /**
   * Allowed file types for selection. An empty list indicates any file type is allowed.
   */
  @Input() allowedFileTypes: PolarisFilePickerFileExtension[] = [];

  /**
   * Maximum file size in bytes. A value of 0 indicates no limit.
   */
  @Input() maximumFileSize: number = 5 * 1024 * 1024; // 5MB default

  /**
   * List of files to be displayed with an upload status.
   */
  @Input() uploadFiles: PolarisFilePickerFile[] = [];

  /**
   * Event emitted when files are added.
   */
  @Output() onAddFiles = new EventEmitter<File[]>();

  /**
   * Event emitted when a file upload is canceled.
   */
  @Output() onCancelFile = new EventEmitter<PolarisFilePickerFile>();

  /**
   * Event emitted when a file is deleted.
   */
  @Output() onDeleteFile = new EventEmitter<PolarisFilePickerFile>();


  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly fileStatus = PolarisFilePickerStatus;

  /**
   * Validates a file based on allowed file types and maximum file size.
   * @param file The file to validate.
   * @returns An object containing the validation result and any errors.
   */
  private _validateFile(file: File): {
    isValid: boolean;
    errors: { invalidFileType: boolean; fileSizeExceeded: boolean };
  } {
    let isValid = true;
    const errors = {
      invalidFileType: false,
      fileSizeExceeded: false,
    };

    // Validate file type
    if (this.allowedFileTypes.length > 0) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (!this.allowedFileTypes.includes(fileType as PolarisFilePickerFileExtension)) {
        errors.invalidFileType = true;
        isValid = false;
      }
    }

    // Validate file size
    if (this.maximumFileSize > 0 && file.size > this.maximumFileSize) {
      errors.fileSizeExceeded = true;
      isValid = false;
    }

    return { isValid, errors };
  }

  /**
   * Handles the addition of files, validates them, emits the valid files, and creates errors for invalid files.
   * @param files The files to add.
   */
  private _onAddFiles(files: File[]): void {
    // Clear previous errors
    this.formControl.setErrors(null);

    // Keep track of invalid file names
    const invalidFileTypes: string[] = [];
    const fileSizeExceeded: string[] = [];

    if (!this.allowMultiple && files.length > 0) {
      // Don't allow more than one file to be displayed if multiple files are not allowed
      if (!this.allowConsecutive && this.uploadFiles.length > 0) {
        files = [];
      } else {
        files = [files[0]];
      }
    }

    const outputFiles = files
      .map((file) => {
        const { isValid, errors } = this._validateFile(file);
        if (!isValid) {
          if (errors.invalidFileType) {
            invalidFileTypes.push(file.name);
          }
          if (errors.fileSizeExceeded) {
            fileSizeExceeded.push(file.name);
          }
          return null;
        }
        return file;
      })
      .filter((file) => file !== null) as File[];

    if (invalidFileTypes.length > 0 || fileSizeExceeded.length > 0) {
      // Override the errors whenever new files are uploaded
      this.formControl.setErrors({
        [PolarisFilePickerError.InvalidFileType]: invalidFileTypes, [PolarisFilePickerError.FileSizeExceeded]: fileSizeExceeded
      });
    }

    this.onAddFiles.emit(outputFiles);
  }

  /**
   * Handles the file input change event.
   * @param event The input event.
   */
  public onInputFile(event: Event): void {
    const inputElement = event.currentTarget as HTMLInputElement;
    const selectedFiles = Array.from(inputElement.files ?? []) as File[];
    this._onAddFiles(selectedFiles);
    inputElement.value = '';
  }

  /**
   * Handles the click event on the file picker.
   * @param event The mouse event.
   */
  public onClickFilePicker(event?: MouseEvent): void {
    this.fileInput.nativeElement.click();
    if (event) {
      this.onClick.emit(event);
    }
  }

  /**
   * Handles the keydown event for accessibility.
   * @param event The keyboard event.
   */
  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onClickFilePicker();
    }
  }

  /**
   * Handles drag events for the file picker.
   * @param event The drag event.
   */
  public onDrag(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const dropArea = event.currentTarget as HTMLElement;
    if (event.type === 'dragover') {
      dropArea.classList.add('drag-over');
    } else if (event.type === 'dragleave' || event.type === 'drop') {
      dropArea.classList.remove('drag-over');
    }
  }

  /**
   * Handles the drop event for the file picker.
   * @param event The drag event.
   */
  public onDrop(event: DragEvent): void {
    this.onDrag(event);
    this._onAddFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  /**
   * Handles the cancellation of a file.
   * @param file The file to cancel.
   */
  public onCancel(file: PolarisFilePickerFile): void {
    this.onCancelFile.emit(file);
  }

  /**
   * Handles the deletion of a file.
   * @param file The file to delete.
   */
  public onDelete(file: PolarisFilePickerFile): void {
    this.onDeleteFile.emit(file);
  }

  /**
   * Returns the CSS classes for the file picker.
   */
  public get filePickerClass() {
    return {
      vertical: this.orientation === 'vertical',
      [this.customClass]: this.customClass,
    };
  }
}
