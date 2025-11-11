import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAdministrationService } from '@services';
import { UserComponent } from '@components/_views';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let userAdministrationService: jest.Mocked<UserAdministrationService>;

  beforeEach(async () => {
    // Create a mock version of UserAdministrationService
    userAdministrationService = {
      setUserDetails: jest.fn(),
      updateActivePortalAuthenticationId: jest.fn(),
    } as unknown as jest.Mocked<UserAdministrationService>;

    await TestBed.configureTestingModule({
      declarations: [UserComponent],
      imports: [UserComponent],
      providers: [
        { provide: UserAdministrationService, useValue: userAdministrationService }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setUserDetails and updateActivePortalAuthenticationId with null on ngOnDestroy', (): void => {
    // Act: Trigger ngOnDestroy
    component.ngOnDestroy();

    // Assert: Check that the service methods were called
    expect(userAdministrationService.setUserDetails).toHaveBeenCalledWith(null);
    expect(userAdministrationService.updateActivePortalAuthenticationId).toHaveBeenCalledWith(null);
  });


});
