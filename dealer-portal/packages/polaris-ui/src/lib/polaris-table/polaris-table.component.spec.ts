import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisTable } from './polaris-table.component';
import { PolarisTableConfig } from './_classes/polaris-table-config.class';
import { PolarisTableColumnConfig } from './_classes';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

interface MockTableData {
  title: string;
}

describe('PolarisTableComponent', () => {
  let component: PolarisTable<MockTableData>;
  let fixture: ComponentFixture<PolarisTable<MockTableData>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisTable, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisTable<MockTableData>);
    component = fixture.componentInstance;
    component.config = new PolarisTableConfig<MockTableData>({
      columns: [
        new PolarisTableColumnConfig<MockTableData>({
          id: 'column1',
          key: 'title',
          label: 'Title',
        }),
      ],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
