import { NextResponse } from 'next/server';
import { getPlaceDetails, downloadAndUploadPhoto } from '@/lib/places-api';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { placeId, city, state } = await req.json();

    // 1. Verifica se deu duplicidade de corrida
    const exists = await db.place.findUnique({ where: { googlePlaceId: placeId } });
    if (exists) return NextResponse.json({ message: "Já existe" });

    // 2. Buscar detalhes brutos (Full Detail)
    const details = await getPlaceDetails(placeId);
    
    // 3. Construir transação complexa de Imagens
    const uploadedPhotos = [];
    if (details.photos) {
      // Limita a 5 fotos para otimizar custo de storage/rede
      const photosToProcess = details.photos.slice(0, 5); 
      for (const ph of photosToProcess) {
         try {
           const url = await downloadAndUploadPhoto(ph.name, placeId);
           uploadedPhotos.push({
             url,
             googleRef: ph.name,
             htmlAttributions: ph.authorAttributions?.map((a:any) => a.displayName) || []
           });
         } catch(e) { console.error("Erro na foto", e) }
      }
    }

    const coverImageUrl = uploadedPhotos.length > 0 ? uploadedPhotos[0].url : "";

    // 4. Commit completo via Transação
    const created = await db.place.create({
      data: {
        googlePlaceId: details.id,
        name: details.displayName?.text,
        city: city, // Recebido do input frontend
        state: state, // Opcional, traduzido no frontend
        address: details.formattedAddress,
        phone: details.nationalPhoneNumber,
        internationalPhone: details.internationalPhoneNumber,
        website: details.websiteUri,
        rating: details.rating || 0.0,
        userRatingsTotal: details.userRatingCount || 0,
        priceLevel: details.priceLevel,
        types: details.types || [],
        type: details.primaryTypeDisplayName?.text || "Estabelecimento",
        editorialSummary: details.editorialSummary?.text,
        coverImage: coverImageUrl,
        
        photos: {
           create: uploadedPhotos
        },
        
        openingHours: details.currentOpeningHours ? {
           create: {
             openNow: details.currentOpeningHours.openNow || false,
             weekdayText: details.currentOpeningHours.weekdayDescriptions || []
           }
        } : undefined,

        googleReviews: details.reviews ? {
           create: details.reviews.slice(0, 5).map((r:any) => ({
              authorName: r.authorAttribution?.displayName || "Anônimo",
              authorPhotoUrl: r.authorAttribution?.photoUri,
              rating: r.rating,
              text: r.text?.text || "",
              relativePublishTime: r.relativePublishTimeDescription
           }))
        } : undefined
      }
    });

    return NextResponse.json({ success: true, place: created });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
