import { Storage } from '@google-cloud/storage';

const rawKey = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDHTtIbW8uvVcec\nm53FGRqTxP1HeTmXZV3LDcXi+dmCRpPZ+bgHlDjNQPGlHrm3vY1YBZsAEyshpQee\nVg0AxtbwvT8Mc1NPQogbtssAxCA89Qf/ttTdoAMk+uL+9rxwJESNtLStjlEY2C+n\nnccAuz8SEiiKsV490UUOB4/hGXCV1H/7NSDWQ4x7qqbNyBAdfXiWWSYHZGgwWp/u\nGmGz5Ifd4KNjnmNpHM2qN3Fmy/Lv8PNUAPOcSmFm9hFCvNGB22I2BeUo1vrSPlSX\nlCFuB+Rrf+wKXMqgXlCAP2L404oO8IKs6lv4MI0y0Vtzfkrn5dHW2/8bbP8glV4n\n9oe4/8S7AgMBAAECggEABpzsZsD8eKRZe65EJVqIYbfLCZiRmx7fZlHeK4JLv8FU\nvYpGG2ZFHjZV7jsfQWP2MSH6ex2ntDWUE6JaSxjN3+3/jguzi3EzL+w4Px3CzhL5\nQXhRBst83zi92GTaasQhTCxfRFTxBuiBaEfZZwJPfOuCUdvBuz5a0rTYhsj/zdDQ\nnXzkIRKXOTafbCE0/6DteDbN+wxKSFFWV831zcEaRU+fnNU/a8l+wf1RJycZJE5F\nlHPdGfJagiZOHbQt1Hjs2lKeFRl/9S7IcT2DYbNk9M1KoTtPxMZzxS0IA+kNCRV6\n9VedeeeVkLSOGFlpf+0VdUJyUnpGRgP/8vEc12arLQKBgQD7DY0llTAdrzul5rC2\nbzw7fEwYqqHVLokFnbEPq+WcBu7fyXV6u8iwRENHOeiKu9cg6a1JjnEquCF7tcUb\nFY0oXz7QJ8WOm3eqCR84DV9/VA5PMkBceUvcZkpZqAr7fQZgJbxzv7NoGWgJ6aEG\nQZuo0eyNCksIy7RiMEggAQVBJQKBgQDLPD0wLWOwR00U8hVkh/FoSpTjO6WD7Nla\nm0A4dX56EMLqz5DkUShBe9eoYjCLD/ft/wYxWJx4nEBVRR5h4FsFIFx9hXGZk6Kg\nbdnoeCvC1sgmpG9tuvi5fLIV3EiXvKXoCbszzMKqvt0+1L0WV7I+4FVFVtD+mOTB\ndqTV+DK4XwKBgFkXOQSiSb3vBpLcJ8/F77EIbhS+0MlPR07X5BK0pLnW+AQwgOE6\nLIDo6JspIK3C9Rf39QfKZbyMNU2qdrUi08IE8sx5oLD32OJddFe23zHXSXCvW4m1\nfcdMAYyJhsQyXQXXvmWxHOCPS41g/ES1GaEyRejTQ0duyqehjKbW1d+FAoGAbf0v\n8D7gUKqF4OwS/9FCqPqUEVZagUdRamPTIbsUs+MWWhXziF0TuDzZvdtGAjymJTt7\nkoEuTWfiuUMq6jWNjPyykYwCqubngINzBwjiRhQPRjp/w5cIvPnrN0F8WAJUl3uM\nwL/0KowZGMPxgYH8iWLHQzt06BS+2KTpGJO2f2kCgYB0Y/JrUqK+SE1hVFtkkrqM\nj2D6QBE4YoKCbU3KWrTrUDqELbKYS1t45RvZRZ08rLlWBgGyCh/hij25Jb/GEYMZ\nkG/aR5nSjOSf0OWn0/FqXDPibfpZta1UQvEMmiYXGn9QCKf6i+OOn0Etknt0fnyM\nV8genjC7sEHD51kmtkmO1Q==\n-----END PRIVATE KEY-----\n";

async function testKey() {
  try {
     const storage = new Storage({
       projectId: 'gen-lang-client-0795336683',
       credentials: {
         client_email: 'importador-fotos-guiaurbano@gen-lang-client-0795336683.iam.gserviceaccount.com',
         private_key: rawKey,
       },
     });
     
     const [buckets] = await storage.getBuckets();
     console.log("Buckets:", buckets.map(b => b.name));
     console.log("SUCCESS");
  } catch (e) {
     console.error("Storage Error:", e);
  }
}
testKey().finally(() => process.exit(0));
