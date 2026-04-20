import * as fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf-8');
const keyLine = envFile.split('\n').find(l => l.startsWith('GCP_PRIVATE_KEY=')) || "";
console.log("Extracted Key:", keyLine.substring(keyLine.length - 80));
