async function readEnv() {
  const fs = require('fs');
  const txt = fs.readFileSync('.env', 'utf-8');
  console.log(txt.split('\n').find(l => l.startsWith('GCP_PRIVATE_KEY')));
}
readEnv();
