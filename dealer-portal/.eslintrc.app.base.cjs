/* eslint-env node */
module.exports = {
  root: true,
  ignorePatterns: [
    'projects/**/*',
    'mocks/**/*',
    '**/*mock.service.ts',
    '**/*.spec.ts',
    '.eslintrc.cjs',
    '/src/constructors',
    '/src/extensions',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['import', 'jsdoc', '@nx'],
  overrides: [
    {
      files: ['*.spec.ts', '*.spec.tsx', '*.spec.js', '*.spec.jsx'],
      env: {
        jest: true,
      },
    },
    {
      files: ['*.ts'],
      parserOptions: {
        project: ['tsconfig.*?.json']
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/template/process-inline-templates',
        'prettier',
      ],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-extraneous-class': 'off',
        "@typescript-eslint/no-inferrable-types": "off",
        '@typescript-eslint/no-redundant-type-constituents': 'off',
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'classProperty',
            modifiers: ['private'],
            format: ['camelCase'],
            leadingUnderscore: 'require',
          },
          {
            selector: 'variable',
            format: ['camelCase'],
          },
          {
            selector: 'property',
            modifiers: ['private'],
            format: ['camelCase'],
            leadingUnderscore: 'require',
          },
          {
            selector: 'variable',
            modifiers: ['const'],
            format: ['camelCase'],
          },
          {
            selector: 'parameter',
            format: ['camelCase'],
          },
          {
            selector: 'memberLike',
            modifiers: ['private'],
            format: ['camelCase'],
            leadingUnderscore: 'require',
          },
        ],
        '@angular-eslint/no-input-rename': 'off',
        // Do not allow lifecycle hooks that would conflict.
        '@angular-eslint/no-conflicting-lifecycle': ['error'],
        // Error if ViewEncapsulation.None is set.
        '@angular-eslint/use-component-view-encapsulation': ['error'],
        // Classes must explicitly declare members public.
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          {
            accessibility: 'explicit',
            overrides: {
              accessors: 'explicit',
              constructors: 'no-public',
              methods: 'explicit',
              properties: 'off',
              parameterProperties: 'explicit',
            }
          }
        ],
        // Require recommended member ordering (eg. public before private).
        // This overrides the default member ordering to allow getters and setters to be grouped.
        '@typescript-eslint/member-ordering': [
          'error',
          {
            default: [
              'signature',
              'field',
              'constructor',
              'method'
            ]
          },
        ],
        // Prevent duplicate variable declarations in the same scope.
        '@typescript-eslint/no-shadow': ['error'],
        // Turn off ESLint no-shadow so it doesn't conflict with TypeScript version.
        'no-shadow': ['off'],
        // Prevent variables from getting used before they are defined.
        '@typescript-eslint/no-use-before-define': ['error'],
        // Prevent the entire RxJs library from accidentally getting imported.
        'no-restricted-imports': [
          'error',
          {
            name: 'rxjs/Rx',
            message: "Please import directly from 'rxjs' instead",
          },
        ],
        // JSDoc rules for consistent formatting.
        'jsdoc/check-alignment': ['error'],
        'jsdoc/no-types': 'off',
        // Force triple equals unless comparing to null and a couple other exceptions.
        eqeqeq: ['error', 'smart'],
        // Prevent for/in statements without inner if block.
        'guard-for-in': ['error'],
        // Warn if methods or properties marked deprecated are imported.
        'import/no-deprecated': ['warn'],
        // Error if bitwise operators used. Can be disabled as needed.
        'no-bitwise': ['error'],
        // Do not allow references to caller in functions.
        'no-caller': ['error'],
        // Do not allow eval. Can be disabled as needed.
        'no-eval': ['error'],
        // Detect this reference that will be undefined.
        'no-invalid-this': ['error'],
        // Do not allow primitive types to be newed up.
        'no-new-wrappers': ['error'],
        // Require error objects when throwing.
        'no-throw-literal': ['error'],
        // Do not allow variables to explicitly be initialized as undefined.
        'no-undef-init': ['error'],
        // Require object shorthand when applicable (eg. { a } no { a: a }).
        'object-shorthand': ['error'],
        // Require all variable declarations to have their own line.
        'one-var': ['error', 'never'],
        // Require radix when parsing numbers.
        radix: ['error'],
        // Require line break before return statement.
        'padding-line-between-statements': [
          'error',
          {
            blankLine: 'always',
            prev: '*',
            next: 'return',
          },
        ],
        // Promote not using console statements. Use LoggerService instead.
        'no-console': ['error', { allow: ['error'] }],
      },
    },
    {
      files: ['*.html'],
      extends: ['plugin:@angular-eslint/template/recommended'],
      rules: {},
    },
  ],
};
