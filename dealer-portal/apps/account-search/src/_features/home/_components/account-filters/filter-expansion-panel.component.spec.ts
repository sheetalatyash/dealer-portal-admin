import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterExpansionPanelComponent } from './filter-expansion-panel.component';
import { PartnerTypeFilterOptions } from '@classes/partner-type-filter-options.class';

describe('FilterExpansionPanelComponent', () => {
  let component: FilterExpansionPanelComponent<PartnerTypeFilterOptions>;
  let fixture: ComponentFixture<FilterExpansionPanelComponent<PartnerTypeFilterOptions>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerTypeFilterOptions],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterExpansionPanelComponent<PartnerTypeFilterOptions>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
