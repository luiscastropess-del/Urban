import { Storage } from '@google-cloud/storage';

function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  
  // Remove possible surrounding quotes
  let formatted = key.replace(/^"|"$/g, '');
  formatted = formatted.replace(/\\n/g, '\n');
  
  // Se o parser do ambiente (.env do Node ou Vercel) achatou as quebras de linha para espaços
  if (!formatted.includes('\n') && formatted.includes('BEGIN PRIVATE KEY')) {
     const core = formatted
         .replace(/-----BEGIN PRIVATE KEY-----/gi, '')
         .replace(/-----END PRIVATE KEY-----/gi, '')
         .replace(/\s+/g, '');
     
     const chunks = core.match(/.{1,64}/g) || [];
     formatted = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
  }
  
  return formatted;
}

// Inicia o cliente do GCS apenas se as credenciais existirem
const storageOptions: any = {
  projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID,
};

if (process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY) {
  storageOptions.credentials = {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: formatPrivateKey(process.env.GCP_PRIVATE_KEY),
  };
}

const storage = new Storage(storageOptions);

const BUCKET_NAME = process.env.GCP_STORAGE_BUCKET || 'urbano-places-photos';

export async function geocodeCity(cityInfo: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityInfo)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error_message) {
    throw new Error(data.error_message);
  }
  if (data.results && data.results.length > 0) {
    return data.results[0].geometry.location; // { lat, lng }
  }
  throw new Error("Cidade não encontrada");
}

export async function searchNearbyPlaces(lat: number, lng: number, type: string, radius: number = 10000) {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  
  const body = {
    includedTypes: [type],
    maxResultCount: 20, // Limite para exibir preview sem custo excessivo
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radius // em metros
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY!,
      // Otimização financeira: Pedir só os dados vitais para a listagem (preview)
      'X-Goog-FieldMask': 'places.id,places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours.openNow'
    },
    body: JSON.stringify(body)
  });

  return await res.json();
}

export async function getPlaceDetails(placeId: string) {
  const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=pt-BR`;
  
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY!,
      // Field Mask completa mas isolando atributos caros desnecessários
      'X-Goog-FieldMask': '*' 
    }
  });

  return await res.json();
}

// Faz download da foto da API do Google, sobe pro Storage e retorna a URL pública!
export async function downloadAndUploadPhoto(photoName: string, placeId: string): Promise<string> {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Erro ao baixar imagem do Google");
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Nome único (Prevenção de cache do CDN)
  const destFileName = `places/${placeId}/${new Date().getTime()}.jpg`;
  
  // Se não temos credenciais do GCS configuradas, retorna a URL nativa do Google.
  if (!process.env.GCP_CLIENT_EMAIL || !process.env.GCP_PRIVATE_KEY) {
    return url;
  }
  
  const file = storage.bucket(BUCKET_NAME).file(destFileName);

  try {
    await file.save(buffer, {
      metadata: { contentType: 'image/jpeg' },
      public: true, // Importante para renderizar no site
    });
    return `https://storage.googleapis.com/${BUCKET_NAME}/${destFileName}`;
  } catch (error) {
    console.warn(`[GCS Warning] Falha ao fazer upload da imagem para ${placeId}. Usando URL nativa do Google. Erro:`, error);
    return url;
  }
}
