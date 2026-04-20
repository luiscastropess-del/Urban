async function testApi() {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=Holambra,SP&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Full Geocode API Response:");
  console.log(JSON.stringify(data, null, 2));
}
testApi().finally(() => process.exit(0));
