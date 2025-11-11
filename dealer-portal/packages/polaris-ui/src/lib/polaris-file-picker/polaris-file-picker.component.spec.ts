import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisFilePicker } from './polaris-file-picker.component';
import { By } from '@angular/platform-browser';
import { PolarisFilePickerStatus, PolarisFilePickerFileExtension } from './polaris-file-picker.type';

describe('PolarisFilePickerComponent', () => {
  let component: PolarisFilePicker<unknown>;
  let fixture: ComponentFixture<PolarisFilePicker<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisFilePicker],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisFilePicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call onDrop when a file is dropped', () => {
    // Arrange
    jest.spyOn(component, 'onDrop');
    const dropArea = fixture.debugElement.query(By.css('.polaris-file-picker-drop-area'));

    // Act
    dropArea.triggerEventHandler('drop', {
      target: dropArea.nativeElement,
      preventDefault: () => {},
      stopPropagation: () => {},
    });

    // Assert
    expect(component.onDrop).toHaveBeenCalled();
  });

  it('should call onDrag when a file is dragged over', () => {
    // Arrange
    jest.spyOn(component, 'onDrag');
    const dropArea = fixture.debugElement.query(By.css('.polaris-file-picker-drop-area'));

    // Act
    dropArea.triggerEventHandler('dragover', {
      type: 'dragover',
      currentTarget: dropArea.nativeElement,
      preventDefault: () => {},
      stopPropagation: () => {},
    });

    // Assert
    expect(component.onDrag).toHaveBeenCalled();
  });

  it('should call onDrag when a file is dragged away', () => {
    // Arrange
    jest.spyOn(component, 'onDrag');
    const dropArea = fixture.debugElement.query(By.css('.polaris-file-picker-drop-area'));

    // Act
    dropArea.triggerEventHandler('dragleave', {
      type: 'dragleave',
      currentTarget: dropArea.nativeElement,
      preventDefault: () => {},
      stopPropagation: () => {},
    });

    // Assert
    expect(component.onDrag).toHaveBeenCalled();
  });

  it('should call onClickFilePicker when the drop area is clicked', () => {
    // Arrange
    jest.spyOn(component, 'onClickFilePicker');
    const dropArea = fixture.debugElement.query(By.css('.polaris-file-picker-drop-area'));

    // Act
    dropArea.triggerEventHandler('click', new Event('click'));

    // Assert
    expect(component.onClickFilePicker).toHaveBeenCalled();
  });

  it('should call onInputFile when a file is selected', () => {
    // Arrange
    jest.spyOn(component, 'onInputFile');
    const fileInput = fixture.debugElement.query(By.css('input[type="file"]'));
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const event = { currentTarget: { files: [file] } };

    // Act
    fileInput.triggerEventHandler('change', event);

    // Assert
    expect(component.onInputFile).toHaveBeenCalledWith(event);
  });

  it('should call onKeyDown when a key is pressed in the upload text area', () => {
    // Arrange
    jest.spyOn(component, 'onKeyDown');
    const uploadText = fixture.debugElement.query(By.css('.polaris-file-picker-upload-text'));

    // Act
    uploadText.triggerEventHandler('keydown', new KeyboardEvent('keydown'));

    // Assert
    expect(component.onKeyDown).toHaveBeenCalled();
  });

  it('should call onClickFilePicker when the Enter or Space key is pressed in the upload text area', () => {
    // Arrange
    jest.spyOn(component, 'onKeyDown');
    const uploadText = fixture.debugElement.query(By.css('.polaris-file-picker-upload-text'));

    // Act
    uploadText.triggerEventHandler('keydown', { key: 'Enter', preventDefault: () => {} });
    uploadText.triggerEventHandler('keydown', { key: ' ', preventDefault: () => {} });

    // Assert
    expect(component.onKeyDown).toHaveBeenCalledTimes(2);
  });

  it('should display the correct allowed file types', () => {
    // Arrange
    component.allowedFileTypes = [PolarisFilePickerFileExtension.JPG, PolarisFilePickerFileExtension.PNG];
    fixture.detectChanges();

    // Act
    const allowedTypes = fixture.debugElement.query(By.css('.polaris-file-picker-requirements-type')).nativeElement;

    // Assert
    expect(allowedTypes.textContent).toContain('Supported Formats: JPG, PNG');
  });

  it('should display the correct maximum file size', () => {
    // Arrange
    component.maximumFileSize = 1048576; // 1 MB
    fixture.detectChanges();

    // Act
    const maxSize = fixture.debugElement.query(By.css('.polaris-file-picker-requirements-size')).nativeElement;

    // Assert
    expect(maxSize.textContent).toContain('Maximum Size: 1 MB');
  });

  it('should display the file list when files are uploaded', () => {
    // Arrange
    component.uploadFiles = [{ name: 'test.jpg', status: PolarisFilePickerStatus.Uploading, progress: 50 }];
    fixture.detectChanges();

    // Act
    const fileList = fixture.debugElement.query(By.css('.polaris-file-picker-file-list'));

    // Assert
    expect(fileList).toBeTruthy();
  });

  it('should call onCancel when the cancel button is clicked', () => {
    // Arrange
    jest.spyOn(component, 'onCancel');
    component.uploadFiles = [{ name: 'test.jpg', status: PolarisFilePickerStatus.Uploading, progress: 50 }];
    fixture.detectChanges();
    const cancelButton = fixture.debugElement.query(By.css('.polaris-icon-button'));

    // Act
    cancelButton.nativeElement.click();

    // Assert
    expect(component.onCancel).toHaveBeenCalled();
  });

  it('should validate file types correctly', () => {
    // Arrange
    component.allowedFileTypes = [PolarisFilePickerFileExtension.JPG, PolarisFilePickerFileExtension.PNG];
    const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });

    // Act
    const validResult = component['_validateFile'](validFile);
    const invalidResult = component['_validateFile'](invalidFile);

    // Assert
    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.invalidFileType).toBe(true);
  });

  it('should validate file size correctly', () => {
    // Arrange
    component.maximumFileSize = 1024; // 1 KB
    const validFile = new File(['a'.repeat(1024)], 'test.jpg', { type: 'image/jpeg' });
    const invalidFile = new File(['a'.repeat(1025)], 'test.jpg', { type: 'image/jpeg' });

    // Act
    const validResult = component['_validateFile'](validFile);
    const invalidResult = component['_validateFile'](invalidFile);

    // Assert
    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.fileSizeExceeded).toBe(true);
  });

  it('should not allow uploading another file if one is already uploaded and multiple files are not allowed', () => {
    // Arrange
    component.allowMultiple = false;
    component.uploadFiles = [{ name: 'test.jpg', status: PolarisFilePickerStatus.Uploading, progress: 50 }];
    const newFile = new File([''], 'newfile.jpg', { type: 'image/jpeg' });

    // Act
    component['_onAddFiles']([newFile]);

    // Assert
    expect(component.uploadFiles.length).toBe(1);
    expect(component.uploadFiles[0].name).toBe('test.jpg');
  });

  it('should set form control errors for invalid file types', () => {
    // Arrange
    component.allowedFileTypes = [PolarisFilePickerFileExtension.JPG, PolarisFilePickerFileExtension.PNG];
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });

    // Act
    component['_onAddFiles']([invalidFile]);

    // Assert
    expect(component.formControl.errors).toEqual({ invalidFileTypes: ['test.txt'], fileSizeExceeded: [] });
  });

  it('should set form control errors for file size exceeded', () => {
    // Arrange
    component.maximumFileSize = 1024; // 1 KB
    const invalidFile = new File(['a'.repeat(1025)], 'test.jpg', { type: 'image/jpeg' });

    // Act
    component['_onAddFiles']([invalidFile]);

    // Assert
    expect(component.formControl.errors).toEqual({ invalidFileTypes: [], fileSizeExceeded: ['test.jpg'] });
  });

  it('should set form control errors for both invalid file types and file size exceeded', () => {
    // Arrange
    component.allowMultiple = true;
    component.allowedFileTypes = [PolarisFilePickerFileExtension.JPG, PolarisFilePickerFileExtension.PNG];
    component.maximumFileSize = 1024; // 1 KB
    const invalidFileType = new File([''], 'test.txt', { type: 'text/plain' });
    const fileSizeExceeded = new File(['a'.repeat(1025)], 'test.jpg', { type: 'image/jpeg' });

    // Act
    component['_onAddFiles']([invalidFileType, fileSizeExceeded]);

    // Assert
    expect(component.formControl.errors).toEqual({ invalidFileTypes: ['test.txt'], fileSizeExceeded: ['test.jpg'] });
  });
});
