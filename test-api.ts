import { searchNearbyPlaces, geocodeCity } from './lib/places-api';

async function testApi() {
  try {
     console.log("Geocoding Holambra...");
     const coords = await geocodeCity("Holambra, SP");
     console.log("Coords:", coords);

     console.log("Searching restaurants...");
     const result = await searchNearbyPlaces(coords.lat, coords.lng, "restaurant", 1000);
     console.log("Found:", result.places?.length || 0);
  } catch(e) {
     console.error("Test failed:", e);
  }
}
testApi().finally(() => process.exit(0));
