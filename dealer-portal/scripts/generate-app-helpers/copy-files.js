const fs = require('fs');
const path = require('path');

function copyTemplateFiles(projectName, projectPath, appPrefix) {
  copyTsConfig(projectName, projectPath);
  copyTsConfigApp(projectPath);
  copyMainTs(projectPath);
  copyEnvironments(projectName, projectPath);
  copyProjectJson(projectName, projectPath, appPrefix);
  copyEslintConfig(projectPath, appPrefix);
  copyAppConfig(projectPath);
}

// ✅ Copy tsconfig.json and replace placeholders
function copyTsConfig(projectName, projectPath) {
  console.info('\nCopying and modifying tsconfig.json...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const sourceTsConfigPath = path.resolve('docs/new-application/tsconfig.json');
  const destinationTsConfigPath = path.join(projectPath, 'tsconfig.json');

  if (fs.existsSync(sourceTsConfigPath)) {
    let tsConfigContent = fs.readFileSync(sourceTsConfigPath, 'utf8');

    // Replace <APPLICATION-NAME> placeholders
    tsConfigContent = tsConfigContent.replace(/<APPLICATION-NAME>/g, projectName);

    fs.writeFileSync(destinationTsConfigPath, tsConfigContent, 'utf8');
    console.log(`\x1b[32m✅ Success:\x1b[0m Successfully created tsconfig.json: ${destinationTsConfigPath}\n`);

  } else {
    console.log(`\x1b[31m❌ Error:\x1b[0m Source tsconfig.json file not found: ${sourceTsConfigPath}\n`);

  }
}

// ✅ Copy tsconfig.app.json to the project's root directory
function copyTsConfigApp(projectPath) {
  console.info('\nCopying tsconfig.app.json...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const sourceTsConfigAppPath = path.resolve('docs/new-application/tsconfig.app.json');
  const destinationTsConfigAppPath = path.join(projectPath, 'tsconfig.app.json');

  if (fs.existsSync(sourceTsConfigAppPath)) {
    fs.copyFileSync(sourceTsConfigAppPath, destinationTsConfigAppPath);
    console.log(`\x1b[32m✅ Success:\x1b[0m Successfully copied tsconfig.app.json: ${destinationTsConfigAppPath}\n`);

  } else {
    console.log(`\x1b[31m❌ Error:\x1b[0m Source tsconfig.app.json file not found: ${sourceTsConfigAppPath}\n`);

  }
}

// ✅ Copy and modify main.ts
function copyMainTs(projectPath) {
  console.info('\nCopying main.ts...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const sourceMainTsPath = path.resolve('docs/new-application/main.ts');
  const destinationMainTsPath = path.join(projectPath, 'src/main.ts');

  if (fs.existsSync(sourceMainTsPath)) {
    let fileContent = fs.readFileSync(sourceMainTsPath, 'utf8');

    // Remove "@ts-nocheck" from the first line if it exists
    fileContent = fileContent.replace(/^\/\/\s*@ts-nocheck\s*\n?/, '');

    fs.writeFileSync(destinationMainTsPath, fileContent, 'utf8');

    console.log(`\x1b[32m✅ Success:\x1b[0m Successfully copied and modified main.ts to: ${destinationMainTsPath}\n`);
  } else {
    console.log(`\x1b[31m❌ Error:\x1b[0m Source main.ts file not found: ${sourceMainTsPath}\n`);
  }
}


// ✅ Copy environment files (_environments directory)
function copyEnvironments(projectName, projectPath) {
  console.info('\nCopying and modifying environment files...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const sourceEnvironmentsPath = path.resolve('docs/new-application/_environments');
  const destinationEnvironmentsPath = path.join(projectPath, 'src/_environments');

  if (fs.existsSync(sourceEnvironmentsPath)) {
    fs.readdirSync(sourceEnvironmentsPath).forEach(file => {
      const sourceFile = path.join(sourceEnvironmentsPath, file);
      const destinationFile = path.join(destinationEnvironmentsPath, file);

      let fileContent = fs.readFileSync(sourceFile, 'utf8');

      // Remove "@ts-nocheck" from the first line if it exists
      fileContent = fileContent.replace(/^\/\/\s*@ts-nocheck\s*\n?/, '');

      // Replace <APPLICATION-NAME> with actual project name
      fileContent = fileContent.replace(/<APPLICATION-NAME>/g, projectName);

      fs.mkdirSync(destinationEnvironmentsPath, { recursive: true });
      fs.writeFileSync(destinationFile, fileContent, 'utf8');

      console.log(`Copied and modified ${file} to ${destinationEnvironmentsPath}`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\x1b[32m✅ Success:\x1b[0m Successfully copied and modified environment files.\n`);
  } else {
    console.log(`\x1b[31m❌ Error:\x1b[0m Source environments directory not found: ${sourceEnvironmentsPath}\n`);
  }
}


// ✅ Copy and modify project.template.json to project.json
function copyProjectJson(projectName, projectPath, appPrefix) {
  console.info('\nCopying and modifying project.json...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const sourceProjectJsonPath = path.resolve('docs/new-application/project.template.json');
  const destinationProjectJsonPath = path.join(projectPath, 'project.json');

  if (fs.existsSync(sourceProjectJsonPath)) {
    let projectJsonContent = fs.readFileSync(sourceProjectJsonPath, 'utf8');

    // Replace placeholders with actual values
    projectJsonContent = projectJsonContent
      .replace(/<APPLICATION-NAME>/g, projectName)
      .replace(/<APPLICATION-PREFIX>/g, appPrefix);

    fs.writeFileSync(destinationProjectJsonPath, projectJsonContent, 'utf8');
    console.log(`\x1b[32m✅ Success:\x1b[0m Successfully created project.json: ${destinationProjectJsonPath}\n`);

  } else {
    console.log(`\x1b[31m❌ Error:\x1b[0m Source project.json file not found: ${sourceProjectJsonPath}\n`);

  }
}

// ✅ Copy and modify .eslintrc.cjs, and remove .eslintrc.json
function copyEslintConfig(projectPath, appPrefix) {
  console.info('\nCopying and modifying .eslintrc.cjs...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const sourceEslintPath = path.resolve('docs/new-application/.eslintrc.cjs');
  const destinationEslintPath = path.join(projectPath, '.eslintrc.cjs');

  if (fs.existsSync(sourceEslintPath)) {
    let eslintContent = fs.readFileSync(sourceEslintPath, 'utf8');

    // Replace <APPLICATION-PREFIX> placeholder
    eslintContent = eslintContent.replace(/<APPLICATION-PREFIX>/g, appPrefix);

    fs.writeFileSync(destinationEslintPath, eslintContent, 'utf8');
    console.log(`\x1b[32m✅ Success:\x1b[0m Successfully created .eslintrc.cjs: ${destinationEslintPath}`);
  } else {
    console.log(`\x1b[31m❌ Error:\x1b[0m Source .eslintrc.cjs file not found: ${sourceEslintPath}\n`);

  }

  // Remove the generated .eslintrc.json if it exists
  const generatedEslintPath = path.join(projectPath, '.eslintrc.json');
  if (fs.existsSync(generatedEslintPath)) {
    fs.unlinkSync(generatedEslintPath);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\x1b[32m✅ Success:\x1b[0m Successfully Removed generated .eslintrc.json: ${generatedEslintPath}\n`);
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\x1b[33m⚠️ Warning:\x1b[0m .eslintrc.json not found, skipping removal.`);

  }
}

// ✅ Copy and modify app.config.ts
function copyAppConfig(projectPath) {
  console.info('\nCopying app.config.ts...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const sourceAppConfigPath = path.resolve('docs/new-application/app.config.ts');
  const destinationAppDir = path.join(projectPath, 'src/app');
  const destinationAppConfigPath = path.join(destinationAppDir, 'app.config.ts');

  if (fs.existsSync(sourceAppConfigPath)) {
    // Ensure the destination directory exists
    if (!fs.existsSync(destinationAppDir)) {
      fs.mkdirSync(destinationAppDir, { recursive: true });
    }

    let fileContent = fs.readFileSync(sourceAppConfigPath, 'utf8');

    // Remove "@ts-nocheck" from the first line if it exists
    fileContent = fileContent.replace(/^\/\/\s*@ts-nocheck\s*\n?/, '');

    fs.writeFileSync(destinationAppConfigPath, fileContent, 'utf8');

    console.log(`\x1b[32m✅ Success:\x1b[0m Successfully copied and modified app.config.ts to: ${destinationAppConfigPath}\n`);
  } else {
    console.log(`\x1b[31m❌ Error:\x1b[0m Source app.config.ts file not found: ${sourceAppConfigPath}\n`);
  }
}

module.exports = { copyTemplateFiles };
