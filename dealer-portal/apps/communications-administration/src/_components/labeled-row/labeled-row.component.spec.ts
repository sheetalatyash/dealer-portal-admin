import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabeledRowComponent } from './labeled-row.component';
import { PolarisDivider } from '../../../../../packages/polaris-ui/src';
import { TranslatePipe } from '@ngx-translate/core';
import { Component } from '@angular/core';

@Component({
  template: `
    <ca-labeled-row [label]="label" [showDivider]="showDivider">
      <span class="test-content">Test Content</span>
    </ca-labeled-row>
  `
})
class TestHostComponent {
  label = 'test-label';
  showDivider = true;
}

describe('LabeledRowComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisDivider, TranslatePipe],
      declarations: [LabeledRowComponent, TestHostComponent],
      providers: [
        { provide: TranslatePipe, useValue: { transform: (v: string) => v } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(fixture).toBeTruthy();
  });

  it('should render the label', () => {
    const labelEl = fixture.nativeElement.querySelector('.communication-sub-section-title');
    expect(labelEl.textContent).toContain('test-label');
  });

  it('should render projected content', () => {
    const contentEl = fixture.nativeElement.querySelector('.test-content');
    expect(contentEl).toBeTruthy();
    expect(contentEl.textContent).toBe('Test Content');
  });

  it('should show the divider by default', () => {
    const divider = fixture.nativeElement.querySelector('polaris-divider');
    expect(divider).toBeTruthy();
  });

  it('should not show the divider when showDivider is false', () => {
    hostComponent.showDivider = false;
    fixture.detectChanges();
    const divider = fixture.nativeElement.querySelector('polaris-divider');
    expect(divider).toBeNull();
  });
});
