const fs = require('fs');
const path = require('path');

const directoriesToCreate = [
  'src/_classes',
  'src/_components',
  'src/_directives',
  'src/_enums',
  'src/_guards',
  'src/_pipes',
  'src/_resolvers',
  'src/_services',
  'src/_types',
];

const specialDirectories = [
  'src/_environments',
  'src/assets/translations',
];

function createProjectDirectories(projectPath) {
  console.info('\nCreating additional directories...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  [...directoriesToCreate, ...specialDirectories].forEach(dir => {
    const fullPath = path.join(projectPath, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.info(`Additional directories created successfully.\n`);

  console.info('\nAdding index.ts (Barrel) files...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Add `index.ts` only in directoriesToCreate (skip special directories)
  directoriesToCreate.forEach(dir => {
    const indexPath = path.join(projectPath, dir, 'index.ts');
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, '// Barrel file for exports\n', 'utf8');
      console.log(`Created index.ts in: ${indexPath}`);
    }
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.info('Index.ts files added successfully.\n');

  console.info('\nCreating initial translation file...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const translationFilePath = path.join(projectPath, 'src/assets/translations/en-us.json');
  const defaultTranslationContent = JSON.stringify({
    welcome: "Welcome to the app!",
    language: "English",
    version: "1.0.0"
  }, null, 2);

  if (!fs.existsSync(translationFilePath)) {
    fs.writeFileSync(translationFilePath, defaultTranslationContent, 'utf8');
    console.info(`Successfully created translation file: ${translationFilePath}\n`);
  } else {
    console.warn(`Translation file already exists: ${translationFilePath}, skipping...\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

module.exports = { createProjectDirectories };
