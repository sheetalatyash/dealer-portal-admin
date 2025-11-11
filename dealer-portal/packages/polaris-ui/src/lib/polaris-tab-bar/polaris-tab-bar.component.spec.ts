import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisTabBar } from './polaris-tab-bar.component';

describe('PolarisTabBar', () => {
  let component: PolarisTabBar;
  let fixture: ComponentFixture<PolarisTabBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisTabBar],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisTabBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
