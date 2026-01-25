const fs = require('fs');
const path = require('path');

// Read the logo and convert to base64
const logoPath = path.join(__dirname, '../assets/pccoe-logo.png');
let logoBase64 = '';

try {
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
} catch (error) {
    console.error('Error loading logo:', error);
}

module.exports = { logoBase64 };
