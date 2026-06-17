const fs = require('fs');
const file = 'components/ResumePreview.tsx';
let content = fs.readFileSync(file, 'utf8');

// Regex to match "print:xxx", "print:bg-xxx", "print:after:xxx", etc.
content = content.replace(/print:[^\s"'\`]+/g, '');

// Clean up any double spaces left behind by the removal
content = content.replace(/  +/g, ' ');

fs.writeFileSync(file, content);
console.log("Stripped all print classes");
