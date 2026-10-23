const [major, minor, patch] = process.versions.node.split('.').map(Number);
if (major !== 22 || minor < 23 || (minor === 23 && patch < 4)) {
  console.error('This project requires patched Node.js >=22.23.4 <23. Run nvm use before installing, building, or starting.');
  process.exit(1);
}
