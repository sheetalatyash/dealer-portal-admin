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
            prefix: '<APPLICATION-PREFIX>',
            style: 'kebab-case',
          },
        ],
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: '<APPLICATION-PREFIX>',
            style: 'camelCase',
          },
        ],
      },
    },
  ],
};
