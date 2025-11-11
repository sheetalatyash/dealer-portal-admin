/**
 * These are the types of columns supported by the PolarisTable component.
 *
 * - text:   Represents a standard text column.
 * - icon:   Represents a column displaying an icon (typically a PolarisStatusIcon).
 * - date:   Represents a column displaying a date.
 * - custom: Represents a column displaying custom content using <ng-content>.
 * - link:   Represents a column displaying a link (typically a PolarisHref).
 *
 */

export type PolarisTableColumnType = 'text' | 'icon' | 'date' | 'custom' | 'link' | 'radio';
