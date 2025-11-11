import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisDivider } from './polaris-divider.component';

describe('PolarisDividerComponent', () => {
  let component: PolarisDivider;
  let fixture: ComponentFixture<PolarisDivider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisDivider],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisDivider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
