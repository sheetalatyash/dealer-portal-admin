const { execSync } = require('child_process');

function generateNxApp(projectName, projectPath, appPrefix) {
  const commandParts = [
    'npx nx g @nx/angular:app',
    `--name=${projectName}`,
    `--directory=${projectPath}`,
    `--prefix=${appPrefix}`,
    '--bundler=webpack',
    '--ssr=false',
  ];

  const command = commandParts.join(' ');

  console.log(`\nRunning: ${command}\n`);
  execSync(command, { stdio: 'inherit' });

  console.info(`\nApplication Prefix Set: ${appPrefix}\n`);
}

module.exports = { generateNxApp };
