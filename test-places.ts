async function testPlaces() {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  const body = {
    includedTypes: ["restaurant"],
    maxResultCount: 2,
    locationRestriction: {
      circle: { center: { latitude: -22.6339, longitude: -47.0543 }, radius: 1000 }
    }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY!,
      'X-Goog-FieldMask': 'places.id,places.displayName'
    },
    body: JSON.stringify(body)
  });
  console.log("Places API Response:");
  console.log(JSON.stringify(await res.json(), null, 2));
}
testPlaces().finally(() => process.exit(0));
