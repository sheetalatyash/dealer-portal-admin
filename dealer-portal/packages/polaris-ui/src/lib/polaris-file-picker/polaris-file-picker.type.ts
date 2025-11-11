/**
 * Interface representing a file in the Polaris File Picker.
 */
export interface PolarisFilePickerFile {
  id?: string;
  name: string;
  status: PolarisFilePickerStatus;
  progress?: number | 'indeterminate';
  testId?: string;
}

/**
 * Enum representing the status of a file in the Polaris File Picker.
 */
export enum PolarisFilePickerStatus {
  Uploading = 'Uploading',
  Error = 'Error',
  Success = 'Success',
}

/**
 * Enum representing the types of files that can be uploaded.
 */
// When modifying also update the FileTypes array
export enum PolarisFilePickerFileExtension {
  CSV = 'csv',
  TXT = 'txt',
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
  PNG = 'png',
  JPG = 'jpg',
  JPEG = 'jpeg',
  GIF = 'gif',
  MP3 = 'mp3',
  MP4 = 'mp4',
}

/**
 * Enum representing the types of errors that can occur during file selection.
 */
export enum PolarisFilePickerError {
  FileSizeExceeded = 'fileSizeExceeded',
  InvalidFileType = 'invalidFileTypes',
}

/**
 * Interface representing a file type and its MIME type.
 */
export interface PolarisFilePickerFileType {
  extension: PolarisFilePickerFileExtension;
  mimeType: string;
}

/**
 * Array of supported file types and their corresponding MIME types.
 */
// MIME Types sourced from https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
export const FileTypes: PolarisFilePickerFileType[] = [
  {
    extension: PolarisFilePickerFileExtension.CSV,
    mimeType: 'text/csv',
  },
  {
    extension: PolarisFilePickerFileExtension.TXT,
    mimeType: 'text/plain',
  },
  {
    extension: PolarisFilePickerFileExtension.PDF,
    mimeType: 'application/pdf',
  },
  {
    extension: PolarisFilePickerFileExtension.DOC,
    mimeType: 'application/msword',
  },
  {
    extension: PolarisFilePickerFileExtension.DOCX,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  {
    extension: PolarisFilePickerFileExtension.XLS,
    mimeType: 'application/vnd.ms-excel',
  },
  {
    extension: PolarisFilePickerFileExtension.XLSX,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    extension: PolarisFilePickerFileExtension.PNG,
    mimeType: 'image/png',
  },
  {
    extension: PolarisFilePickerFileExtension.JPG,
    mimeType: 'image/jpeg',
  },
  {
    extension: PolarisFilePickerFileExtension.JPEG,
    mimeType: 'image/jpeg',
  },
  {
    extension: PolarisFilePickerFileExtension.GIF,
    mimeType: 'image/gif',
  },
  {
    extension: PolarisFilePickerFileExtension.MP3,
    mimeType: 'audio/mpeg',
  },
  {
    extension: PolarisFilePickerFileExtension.MP4,
    mimeType: 'video/mp4',
  },
];
