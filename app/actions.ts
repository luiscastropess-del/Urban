"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPlaces() {
  return await db.place.findMany();
}

export async function getEvents() {
  return await db.event.findMany();
}

export async function getFavorites() {
  return await db.favorite.findMany();
}

export async function getPlace(id: string) {
  return await db.place.findUnique({ 
    where: { id },
    include: {
      photos: true,
      googleReviews: true,
      openingHours: true,
      menuLink: true,
    }
  });
}

export async function createPlace(data: {
  name: string;
  emoji: string;
  rating: number;
  reviews: string;
  distance: string;
  type: string;
  featured: boolean;
  premium: boolean;
  description?: string;
  tags?: string;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
  phone?: string;
  instagram?: string;
  website?: string;
  email?: string;
  plan?: string;
  coverImage?: string;
  images?: string;
}) {
  const result = await db.place.create({ data });
  revalidatePath('/explore');
  revalidatePath('/admin');
  return result;
}

export async function updatePlace(id: string, data: Partial<{
  name: string;
  emoji: string;
  rating: number;
  reviews: string;
  distance: string;
  type: string;
  featured: boolean;
  premium: boolean;
  description?: string;
  tags?: string;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
  phone?: string;
  instagram?: string;
  website?: string;
  email?: string;
  plan?: string;
  coverImage?: string;
  images?: string;
}>) {
  const result = await db.place.update({ where: { id }, data });
  revalidatePath('/explore');
  revalidatePath('/admin');
  return result;
}

export async function deletePlace(id: string) {
  const result = await db.place.delete({ where: { id } });
  revalidatePath('/explore');
  revalidatePath('/admin');
  return result;
}
