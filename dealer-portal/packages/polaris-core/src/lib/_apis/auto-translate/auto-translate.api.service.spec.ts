import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { AutoTranslateApiService } from './auto-translate.api.service';
import { ENVIRONMENT_CONFIG, Environment } from '../../_types';
import { TextTranslationRequest } from './_classes/text-translation-request.class';
import { TranslationContentType } from './_enums/translation-content-type.enum';
import { of, lastValueFrom } from 'rxjs';
import { StandardResponse } from '..';
import { TextTranslation } from './_types/text-translation.type';

describe('AutoTranslateApiService', () => {
  let service: AutoTranslateApiService;
  let postSpy: jest.SpyInstance;
  const mockEnvironment: Environment = {
    endpoints: {
      translationApiUrl: 'https://api-translation-dev.polarisportal.com/'
    }
  } as unknown as Environment;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AutoTranslateApiService,
        { provide: ENVIRONMENT_CONFIG, useValue: mockEnvironment },
        { provide: HttpClient, useValue: {} }
      ]
    });
    service = TestBed.inject(AutoTranslateApiService);

    postSpy = jest.spyOn(service, 'post');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTranslation$', () => {
    it('should call fileTranslationApiUrl for File content type', async () => {
      const request = new TextTranslationRequest('hello', TranslationContentType.File, 'en', 'fr');
      const expectedResponse: StandardResponse<TextTranslation> = { data: {} as TextTranslation } as StandardResponse<TextTranslation>;
      postSpy.mockReturnValue(of(expectedResponse));

      const result = await lastValueFrom(service.getTranslation$(request));
      expect(postSpy).toHaveBeenCalledWith(
        'https://api-translation-dev.polarisportal.com/TranslateFile/upload',
        request
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should call textTranslationApiUrl for non-File content types', async () => {
      const requestHtml = new TextTranslationRequest('hello', TranslationContentType.HTML, 'en', 'fr');
      const requestJson = new TextTranslationRequest('hello', TranslationContentType.JSON, 'en', 'fr');
      const requestText = new TextTranslationRequest('hello', TranslationContentType.Text, 'en', 'fr');
      const expectedResponse: StandardResponse<TextTranslation> = { data: {} as TextTranslation } as StandardResponse<TextTranslation>;
      postSpy.mockReturnValue(of(expectedResponse));

      await lastValueFrom(service.getTranslation$(requestHtml));
      expect(postSpy).toHaveBeenCalledWith(
        'https://api-translation-dev.polarisportal.com/TranslateText/',
        requestHtml
      );

      await lastValueFrom(service.getTranslation$(requestJson));
      expect(postSpy).toHaveBeenCalledWith(
        'https://api-translation-dev.polarisportal.com/TranslateText/',
        requestJson
      );

      await lastValueFrom(service.getTranslation$(requestText));
      expect(postSpy).toHaveBeenCalledWith(
        'https://api-translation-dev.polarisportal.com/TranslateText/',
        requestText
      );
    });
  });
});
