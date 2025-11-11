import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule, MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { PolarisNotification } from './polaris-notification.component';
import { of } from 'rxjs';
import { NotificationType } from './polaris-notification.enum';

describe('PolarisNotification', () => {
  let component: PolarisNotification;
  let fixture: ComponentFixture<PolarisNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisNotification, MatSnackBarModule],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: { message: '', type: NotificationType.Success } },
        {
          provide: MatSnackBarRef,
          useValue: {
            afterOpened: () => of({}),
            afterDismissed: () => of({}),
            close: () => {},
            dismiss: () => {},
            instance: {
              data: {},
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
