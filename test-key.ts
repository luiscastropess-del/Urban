import { Storage } from '@google-cloud/storage';

async function testKey() {
  let pk = process.env.GCP_PRIVATE_KEY || "";
  
  // ROBUST KEY FORMATTER:
  let formattedKey = pk.replace(/\\n/g, '\n');
  if (formattedKey && !formattedKey.includes('\n')) {
     // Flattened key - rebuild it
     const core = formattedKey
         .replace(/-----BEGIN PRIVATE KEY-----/g, '')
         .replace(/-----END PRIVATE KEY-----/g, '')
         .replace(/\s+/g, ''); // remove all empty spaces
     
     // Base64 chunking (64 chars per line)
     const chunks = core.match(/.{1,64}/g) || [];
     formattedKey = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
  }

  console.log("Rebuilt Key start:", formattedKey.substring(0, 40));
  console.log("Rebuilt Key end:", formattedKey.substring(formattedKey.length - 40));

  try {
     const storage = new Storage({
       projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID,
       credentials: {
         client_email: process.env.GCP_CLIENT_EMAIL,
         private_key: formattedKey,
       },
     });
     
     const [buckets] = await storage.getBuckets();
     console.log("Buckets:", buckets.map(b => b.name));
     console.log("SUCCESS!");
  } catch (e) {
     console.error("Storage Error:", e);
  }
}
testKey().finally(() => process.exit(0));
