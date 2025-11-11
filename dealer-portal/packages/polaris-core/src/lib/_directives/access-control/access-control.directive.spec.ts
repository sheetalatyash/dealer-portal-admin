import { TemplateRef, ViewContainerRef } from '@angular/core';
import { AccessControlLevel } from '../../_enums';
import { of } from 'rxjs';
import { AccessControlService } from '../../_services';
import { AccessControlDirective } from './access-control.directive';

describe('AccessControlDirective', () => {
  let directive: AccessControlDirective;
  let accessService: jest.Mocked<AccessControlService>;
  let templateRef: TemplateRef<unknown>;
  let viewContainer: jest.Mocked<ViewContainerRef>;

  beforeEach(() => {
    // Create Jest mocks
    accessService = {
      hasAccess: jest.fn(),
      setUserAccessLevel: jest.fn(),
    } as Partial<AccessControlService> as jest.Mocked<AccessControlService>;

    templateRef = {} as TemplateRef<unknown>;

    viewContainer = {
      createEmbeddedView: jest.fn(),
      clear: jest.fn(),
    } as Partial<ViewContainerRef> as jest.Mocked<ViewContainerRef>;


    directive = new AccessControlDirective(templateRef, viewContainer, accessService);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should show the element if the user has access', () => {
    accessService.hasAccess.mockReturnValue(of(true));

    directive.accessControl = AccessControlLevel.ReadWrite; // This should trigger the logic internally

    expect(viewContainer.createEmbeddedView).toHaveBeenCalledWith(templateRef);
    expect(viewContainer.clear).not.toHaveBeenCalled();
  });

  it('should hide the element if the user lacks access', () => {
    accessService.hasAccess.mockReturnValue(of(false));

    directive.accessControl = AccessControlLevel.ReadWrite; // This should trigger the logic internally

    expect(viewContainer.clear).toHaveBeenCalled();
    expect(viewContainer.createEmbeddedView).not.toHaveBeenCalled();
  });
});
