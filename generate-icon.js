const fs = require('fs');
const path = require('path');

// Simple placeholder icon - will be a 1024x1024 PNG with "SP" text
// In a real scenario, you'd use a proper icon file
console.log('This is a placeholder script to remind you to create an icon.');
console.log('For a production app, create a proper 1024×1024 icon.png file.');
console.log('For now, we will continue with packaging, but the app will use default Electron icon.');

// For production:
// 1. Create a 1024×1024 PNG file named icon.png 
// 2. Place it in the root directory of your project
// 3. Use a tool like https://iconverticons.com/ to convert it to .icns for macOS

// Write a README to explain how to properly add an icon
const readmeContent = `# SeatPlan Application

## Icon Setup
To set a custom application icon:

1. Create a 1024×1024 PNG file named \`icon.png\`
2. Place it in the root directory of your project
3. For macOS, you can convert it to .icns format using tools like:
   - iconutil (command line)
   - https://iconverticons.com/ (online)
   - Icon Composer (macOS app)

## Building the Application
Run one of the following commands:

- \`npm run build\` - Build for all platforms
- \`npm run build:mac\` - Build for macOS only
- \`npm run build:win\` - Build for Windows only

The packaged application will be in the \`dist\` folder.
`;

fs.writeFileSync(path.join(__dirname, 'PACKAGING.md'), readmeContent);
console.log('Created PACKAGING.md with instructions for proper icon setup.');

// Create a dummy icon.png file if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'icon.png'))) {
  console.log('Note: You should replace this with a real icon.png file.');
} 