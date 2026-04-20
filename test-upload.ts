import { Storage } from '@google-cloud/storage';

async function testUpload() {
  const pk = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const storage = new Storage({
    projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID,
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: pk,
    },
  });
  
  try {
     const bucket = storage.bucket(process.env.GCP_STORAGE_BUCKET || 'urbano-places-photos');
     console.log("Bucket selected:", bucket.name);
     
     // Note: trying to getMetadata requires viewer access, generating signed url requires no API call 
     // but let's just do a dummy upload check which requires upload permission.
     const file = bucket.file(`places/test_connectivity_${Date.now()}.txt`);
     await file.save('Hello world', { metadata: { contentType: 'text/plain' }, public: true });
     console.log("Upload Success! ->", file.publicUrl());
  } catch(e) {
     console.error("Storage connection still failed?", e);
  }
}
testUpload().finally(() => process.exit(0));
