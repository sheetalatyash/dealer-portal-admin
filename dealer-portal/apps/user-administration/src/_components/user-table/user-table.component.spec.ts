import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserTableComponent } from './user-table.component';
import { UserAdministrationService } from '@services';
import { PolarisNotificationService } from '@dealer-portal/polaris-ui';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of, BehaviorSubject } from 'rxjs';
import { User } from '@classes';

describe('UserTableComponent', () => {
  let component: UserTableComponent;
  let fixture: ComponentFixture<UserTableComponent>;
  let userAdministrationService: jest.Mocked<UserAdministrationService>;
  let polarisNotificationService: jest.Mocked<PolarisNotificationService>;
  let router: jest.Mocked<Router>;
  let translate: jest.Mocked<TranslateService>;

  beforeEach(async () => {
    userAdministrationService = {
      getUsers: jest.fn(),
      isPointsEligible: jest.fn(),
      isSpiffEligible: jest.fn(),
      resendVerificationEmail$: jest.fn(),
      users$: new BehaviorSubject<User[]>([]),
      activeSearchTerm$: new BehaviorSubject<string>(''),
      userAdministrationNavigationTabs$: new BehaviorSubject([]),
    } as unknown as jest.Mocked<UserAdministrationService>;

    polarisNotificationService = {
      success: jest.fn(),
      danger: jest.fn(),
    } as unknown as jest.Mocked<PolarisNotificationService>;

    router = { navigate: jest.fn() } as unknown as jest.Mocked<Router>;
    translate = { instant: jest.fn() } as unknown as jest.Mocked<TranslateService>;

    await TestBed.configureTestingModule({
      declarations: [UserTableComponent],
      providers: [
        { provide: UserAdministrationService, useValue: userAdministrationService },
        { provide: PolarisNotificationService, useValue: polarisNotificationService },
        { provide: Router, useValue: router },
        { provide: TranslateService, useValue: translate },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty users list', () => {
    expect(component.users.length).toBe(0);
  });

  it('should set table configuration on init', () => {
    jest.spyOn(component as never, '_setTableConfig');
    component.ngOnInit();
    expect(component['_setTableConfig']).toHaveBeenCalled();
  });

  it('should call getUsers on initialization', () => {
    expect(userAdministrationService.getUsers).toHaveBeenCalled();
  });

  it('should navigate to user profile page', () => {
    const user: User = { portalAuthenticationId: '123', employeeStatusCode: '1' } as unknown as User;
    component.navigateToUserPage(user, 'active');
    expect(router.navigate).toHaveBeenCalledWith(['/user/active/profile', '123']);
  });

  it('should resend verification email and show success notification', async () => {
    const user: User = { emailAddress: 'test@example.com' } as User;
    userAdministrationService.resendVerificationEmail$.mockReturnValue(of(true));
    await component.resendVerificationEmail(user);
    expect(userAdministrationService.resendVerificationEmail$).toHaveBeenCalledWith('test@example.com');
    expect(polarisNotificationService.success).toHaveBeenCalledWith('Email resent successfully.');
  });

  it('should show error notification when resending email fails', async () => {
    const user: User = { emailAddress: 'test@example.com' } as User;
    userAdministrationService.resendVerificationEmail$.mockReturnValue(of(false));
    await component.resendVerificationEmail(user);
    expect(userAdministrationService.resendVerificationEmail$).toHaveBeenCalledWith('test@example.com');
    expect(polarisNotificationService.danger).toHaveBeenCalledWith('Failed to resend email. Please try again later.');
  });
});
