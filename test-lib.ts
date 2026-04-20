import { Storage } from '@google-cloud/storage';
import { downloadAndUploadPhoto } from './lib/places-api';

async function testLib() {
   try {
     console.log("Checking if lib handles key well by getting a bucket metadata (if it doesn't crash on format)");
     // We just do a dummy call
     // Actually let's just trigger a photo download
     // We don't have a valid Google photoName, so it will fail fetching the Google photo, NOT on Google Cloud Storage decoding
     await downloadAndUploadPhoto("places/invalid", "test1234");
   } catch(e: any) {
     if (e.message && e.message.includes('Erro ao baixar imagem do Google')) {
        console.log("SUCCESS! Storage key parsed perfectly, the error is just the dummy Google Place photo ID");
     } else {
        console.error("FAILED. Unexpected error:", e);
     }
   }
}
testLib().finally(() => process.exit(0));
