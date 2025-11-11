const { execSync } = require('child_process');
const path = require('path');
const readline = require('readline');
const { generateNxApp } = require('./generate-app-helpers/generate-nx-app');
const { createProjectDirectories } = require('./generate-app-helpers/create-directories');
const { copyTemplateFiles } = require('./generate-app-helpers/copy-files');

const startTime = Date.now();

// Setup Readline Interface for User Input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for application name
rl.question('\nWhat do you want to call your new Polaris Dealer-Portal Application?: ', (projectName) => {
  projectName = projectName.trim();

  if (!projectName) {
    console.error('\n❌ Error: Application name cannot be empty.\n');
    rl.close();
    process.exit(1);
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Application Name: ${projectName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Now let's define an **Application Prefix**.
The app prefix is used for component selectors and helps avoid conflicts.

ℹ️ **Good App Prefix Examples:**
  - "ua" for **User Administration**
  - "inv" for **Inventory Management**
  - "crm" for **Customer Relationship Management**

❌ **Avoid:**
  - Generic prefixes like "app"
  - Overly long or complex prefixes
  - Spaces or special characters

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  // Prompt for app prefix
  rl.question('Enter app prefix (default: same as application name): ', (appPrefix) => {
    appPrefix = appPrefix.trim() || projectName;

    console.log(`\n✅ Using Application Prefix: ${appPrefix}\n`);

    rl.close();

    const projectPath = path.join('apps', projectName);

    // Generate the Nx Angular app
    generateNxApp(projectName, projectPath, appPrefix);

    // Create necessary directories
    createProjectDirectories(projectPath);

    // Copy required files (tsconfig.json, main.ts, etc.)
    copyTemplateFiles(projectName, projectPath, appPrefix);

    const endTime = Date.now();
    const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\x1b[32m✅ Success:\x1b[0m Application -- ${projectName} -- setup complete in ${elapsedTime} seconds!`);
    console.log(`📂 Application created at: \x1b[34m${path.resolve(projectPath)}\x1b[0m`);
    console.log('\n');
    console.log('To start your application manually, run:');
    console.log(`\x1b[33mnpx nx run ${projectName}:serve:prod\x1b[0m\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n');

    // Prompt to run the app now
    const runRl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    runRl.question(`Do you want to run ${projectName} now? (Y/n) `, (answer) => {
      runRl.close();

      // Default to "yes" if the user just presses Enter
      const response = answer.trim().toLowerCase();
      if (response === '' || response === 'y' || response === 'yes') {
        console.log(`\n🚀 Starting the application...\n`);
        try {
          execSync(`npx nx run ${projectName}:serve:prod --open`, { stdio: 'inherit' });
        } catch (error) {
          console.error('\n❌ Error running the application. Please try running it manually:\n');
          console.log(`\x1b[33mnpx nx run ${projectName}:serve:prod --open\x1b[0m\n`);
        }
      } else {
        console.log('\n🚀 You can start the application later using:\n');
        console.log(`\x1b[33mnpx nx run ${projectName}:serve:prod\x1b[0m\n`);
      }
    });
  });
});
