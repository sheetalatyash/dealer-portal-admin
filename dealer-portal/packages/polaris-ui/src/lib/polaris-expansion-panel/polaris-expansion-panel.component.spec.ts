import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisExpansionPanel } from './polaris-expansion-panel.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PolarisExpansionPanel', () => {
  let component: PolarisExpansionPanel;
  let fixture: ComponentFixture<PolarisExpansionPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisExpansionPanel, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisExpansionPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
