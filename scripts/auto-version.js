const fs = require('fs');
const packageJson = require('../package.json');

const now = new Date();
const timestamp = `${now.getFullYear()}.${(now.getMonth()+1).toString().padStart(2,'0')}.${now.getDate().toString().padStart(2,'0')}`;

packageJson.version = timestamp;
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));