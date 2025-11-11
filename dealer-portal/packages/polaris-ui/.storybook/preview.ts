// .storybook/preview.ts
import 'zone.js';
import './theme/css/crp-theme.min.css';

import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';

setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    tags: ['autodocs'],
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },

  tags: ['autodocs']
};

export default preview;

// This runs inside the Storybook preview iframe and mounts your Angular BackToTop app globally
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', async () => {
    const [{ bootstrapApplication }] = await Promise.all([
      import('@angular/platform-browser'),
    ]);

    const { PolarisBackToTop } = await import(
      '../src/lib/polaris-back-to-top/polaris-back-to-top.component'
      );

    // Create a host element for the Back To Top component
    const host: HTMLElement = document.createElement('polaris-back-to-top');
    host.style.position = 'fixed';
    host.style.bottom = '2rem';
    host.style.right = '2rem';
    host.style.zIndex = '9999';
    document.body.appendChild(host);

    // Bootstrap as a standalone Angular app (runs independently of Storybook stories)
    bootstrapApplication(PolarisBackToTop);
  });
}
