const fs = require('fs');
const path = require('path');

// This is a very simple data URI for a tiny placeholder icon
// In a real application, you would use a proper designed icon
const iconDataUri = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#3B82F6"/>
  <text x="512" y="580" font-family="Arial" font-size="380" fill="white" text-anchor="middle">SP</text>
</svg>
`;

// Write the SVG to a file
fs.writeFileSync(path.join(__dirname, 'icon.svg'), iconDataUri.trim());

console.log('Created a placeholder icon.svg file');
console.log('For production, convert this to PNG format and replace the placeholder'); 