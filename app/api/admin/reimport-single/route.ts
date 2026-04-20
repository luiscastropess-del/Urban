import { NextResponse } from 'next/server';
import { getPlaceDetails, downloadAndUploadPhoto } from '@/lib/places-api';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { placeId } = await req.json();

    // 1. Buscar o lugar EXISTENTE no banco de dados
    const existingPlace = await db.place.findUnique({
      where: { googlePlaceId: placeId },
      include: { photos: true, openingHours: true, googleReviews: true } // Inclui relações para possível limpeza
    });

    if (!existingPlace) {
      return NextResponse.json({ error: "Lugar não encontrado no banco de dados." }, { status: 404 });
    }

    // 2. Buscar detalhes atualizados do Google Places
    const details = await getPlaceDetails(placeId);

    // 3. (Opcional, mas recomendado) Atualizar fotos
    //    Esta é uma decisão de design: substituir todas as fotos ou apenas adicionar novas?
    //    Aqui, vamos sobrescrever as fotos antigas pelas novas para manter a sincronia.
    const uploadedPhotos = [];
    if (details.photos) {
      // Primeiro, deletar as fotos antigas do storage (GitHub) e do banco, se aplicável
      // await deleteOldPhotos(existingPlace.photos);
      
      const photosToProcess = details.photos.slice(0, 5);
      for (const ph of photosToProcess) {
        try {
          const url = await downloadAndUploadPhoto(ph.name, placeId);
          uploadedPhotos.push({ url, googleRef: ph.name });
        } catch (e) {
          console.error("Erro ao atualizar foto", e);
        }
      }
    }
    const coverImageUrl = uploadedPhotos.length > 0 ? uploadedPhotos[0].url : existingPlace.coverImage;

    // 4. Atualizar o lugar no banco de dados com os dados mais recentes
    const updatedPlace = await db.place.update({
      where: { id: existingPlace.id },
      data: {
        name: details.displayName?.text,
        address: details.formattedAddress,
        phone: details.nationalPhoneNumber,
        internationalPhone: details.internationalPhoneNumber,
        website: details.websiteUri,
        rating: details.rating || 0.0,
        userRatingsTotal: details.userRatingCount || 0,
        priceLevel: details.priceLevel,
        types: details.types || [],
        type: details.primaryTypeDisplayName?.text || existingPlace.type,
        editorialSummary: details.editorialSummary?.text,
        coverImage: coverImageUrl,
        // Atualizar fotos (substituir)
        photos: {
          deleteMany: {}, // Deleta as fotos antigas associadas
          create: uploadedPhotos,
        },
        // Atualizar horários
        openingHours: details.currentOpeningHours
          ? {
              upsert: {
                create: {
                  openNow: details.currentOpeningHours.openNow || false,
                  weekdayText: details.currentOpeningHours.weekdayDescriptions || [],
                },
                update: {
                  openNow: details.currentOpeningHours.openNow || false,
                  weekdayText: details.currentOpeningHours.weekdayDescriptions || [],
                },
              },
            }
          : undefined,
        // Atualizar avaliações (substituir)
        googleReviews: details.reviews
          ? {
              deleteMany: {},
              create: details.reviews.slice(0, 5).map((r: any) => ({
                authorName: r.authorAttribution?.displayName || "Anônimo",
                authorPhotoUrl: r.authorAttribution?.photoUri,
                rating: r.rating,
                text: r.text?.text || "",
                relativePublishTime: r.relativePublishTimeDescription,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, place: updatedPlace });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
