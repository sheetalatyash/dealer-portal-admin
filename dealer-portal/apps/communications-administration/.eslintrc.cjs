/* eslint-env node */
module.exports = {
  extends: '../../.eslintrc.app.base.cjs',
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: 'ca',
            style: 'kebab-case',
          },
        ],
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'ca',
            style: 'camelCase',
          },
        ],
      },
    },
  ],
};