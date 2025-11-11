import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisBadge } from './polaris-badge.component';

describe('PolarisBadgeComponent', () => {
  let component: PolarisBadge;
  let fixture: ComponentFixture<PolarisBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisBadge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
