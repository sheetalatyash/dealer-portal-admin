import { TestBed } from '@angular/core/testing';

import { ResourceService } from './resource.service';

declare global {
  interface Window {
    angularCdnLocation?: string;
  }
}

describe('ResourceService', () => {
  let service: ResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResourceService],
    });
    service = TestBed.inject(ResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCDNPath', () => {
    it('should return an empty string if the CDN location is not set', () => {
      // Arrange
      const expected = '';
      delete window['angularCdnLocation'];

      // Act
      const result = service.getCDNPath();

      // Assert
      expect(result).toBe(expected);
    });

    it('should return the CDN path if the CDN location is set', () => {
      // Arrange
      const expected = 'test CDN path';
      window['angularCdnLocation'] = expected;

      // Act
      const result = service.getCDNPath();

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe('getCultureCode', () => {
    it('should return "en-US" if the culture code is not set', () => {
      // Arrange
      const expected = 'en-US';
      document.documentElement.removeAttribute('data-culture');

      // Act
      const result = service.getCultureCode();

      // Assert
      expect(result).toBe(expected);
    });

    it('should return the culture code if it is set', () => {
      // Arrange
      const expected = 'fr-FR';
      document.documentElement.setAttribute('data-culture', expected);

      // Act
      const result = service.getCultureCode();

      // Assert
      expect(result).toBe(expected);
    });
  });
});
