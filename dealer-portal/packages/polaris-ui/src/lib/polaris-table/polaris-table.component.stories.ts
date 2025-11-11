// polaris-table.component.stories.ts
import { MatTableDataSource } from '@angular/material/table';
import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { PolarisTable } from './polaris-table.component';
import { PolarisTableColumnConfig, PolarisTableConfig, PolarisTablePagination } from './_classes';

const meta: Meta<PolarisTable<any>> = {
  title: 'Polaris/Table',
  component: PolarisTable,
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  args: {
    config: new PolarisTableConfig({
      columns: [
        new PolarisTableColumnConfig<any>({ label: 'Name', key: 'name' }),
        new PolarisTableColumnConfig<any>({ label: 'Email', key: 'email' }),
        new PolarisTableColumnConfig<any>({ label: 'Role', key: 'role' }),
      ],
      pagination: new PolarisTablePagination({
        totalItems: 3,
      }),
    }),
    dataSource: new MatTableDataSource<any>([
      { name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
      { name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
      { name: 'Charlie Rose', email: 'charlie@example.com', role: 'Viewer' },
    ]),
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PolarisTable<any>>;

export const Default: Story = {};
