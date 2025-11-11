/**
 * Available breakpoints for the Polaris UI library.
 * These breakpoints correspond to the screen sizes specified in the Bootstrap spec.
 */

export type PolarisBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';


/**
 * Define the breakpoints as an array for easier manipulation and type checking.
 */

// Temporarily disable naming-convention rule
// TODO: Add rule allowing this naming convention for constants in this context
/* eslint-disable @typescript-eslint/naming-convention */
export const POLARIS_BREAKPOINTS: PolarisBreakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

export const POLARIS_MOBILE_BREAKPOINTS: PolarisBreakpoint[] = ['xs', 'sm'];

export const POLARIS_TABLET_BREAKPOINTS: PolarisBreakpoint[] = ['md', 'lg'];

export const POLARIS_DESKTOP_BREAKPOINTS: PolarisBreakpoint[] = ['xl', 'xxl'];
/* eslint-enable @typescript-eslint/naming-convention */
