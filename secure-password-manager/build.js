// build.js
const { execSync } = require('child_process');

const target = process.env.BUILD_TARGET || '';

let command = 'electron-builder build';

if (target) {
  command += ` --${target}`;
}

console.log(`Running: ${command}`);

execSync(command, { stdio: 'inherit' });
