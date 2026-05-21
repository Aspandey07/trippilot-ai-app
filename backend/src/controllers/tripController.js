// backend/src/controllers/tripController.js
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { createWorker } = require('tesseract.js');
const fetch = require('node-fetch');

// Helper: get geographic coordinates from Nominatim
async function getCoordinates(location) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'TripPlanner/1.0' } });
  const data = await response.json();
  if (data && data.length > 0) {
    const { lat, lon, display_name } = data[0];
    return { lat: parseFloat(lat), lon: parseFloat(lon), name: display_name };
  }
  return null;
}

// Helper: haversine distance in km
function haversine(coord1, coord2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lon - coord1.lon);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Extract ordered list of locations from raw OCR text.
// Supports patterns like:
//   "From: Delhi"
//   "To: Mumbai"
//   "Stop 1: Jaipur"
//   "Stop 2: Ahmedabad"
// Falls back to any capitalized word sequence separated by commas or newlines.
function extractOrderedLocations(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length);
  const locations = [];
  const regexMap = [
    /(?:from|source)[:\s]+([A-Za-z ,.-]+)/i,
    /(?:to|destination)[:\s]+([A-Za-z ,.-]+)/i,
    /(?:stop\s*\d*)[:\s]+([A-Za-z ,.-]+)/i,
    /location[:\s]+([A-Za-z ,.-]+)/i,
  ];
  for (const line of lines) {
    for (const rgx of regexMap) {
      const m = rgx.exec(line);
      if (m) {
        locations.push(m[1].trim());
        break;
      }
    }
  }
  // If we still have <2 locations, fallback to extracting capitalized phrases separated by commas.
  if (locations.length < 2) {
    const fallback = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
    if (fallback) {
      // Remove duplicates while preserving order
      const uniq = [];
      for (const loc of fallback) {
        if (!uniq.includes(loc)) uniq.push(loc);
      }
      return uniq;
    }
  }
  return locations;
}

exports.parseTripDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }
    const filePath = req.file.path;
    const ext = path.extname(filePath).toLowerCase();
    let rawText = '';

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      rawText = data.text;
    } else {
      // Image handling via Tesseract OCR
      const worker = await createWorker({ logger: () => {} });
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(filePath);
      rawText = text;
      await worker.terminate();
    }

    const locations = extractOrderedLocations(rawText);
    if (locations.length < 2) {
      return res.status(422).json({ error: 'Could not detect enough locations for a trip' });
    }

    // Resolve coordinates for each location
    const coordPromises = locations.map(loc => getCoordinates(loc));
    const coords = await Promise.all(coordPromises);
    if (coords.some(c => c === null)) {
      return res.status(404).json({ error: 'One or more locations could not be geocoded' });
    }

    // Build legs of the itinerary
    const legs = [];
    for (let i = 0; i < coords.length - 1; i++) {
      const from = coords[i];
      const to = coords[i + 1];
      const distanceKm = haversine(from, to).toFixed(2);
      legs.push({
        from: from.name,
        to: to.name,
        distanceKm: Number(distanceKm),
        fromCoordinates: { lat: from.lat, lon: from.lon },
        toCoordinates: { lat: to.lat, lon: to.lon }
      });
    }

    const itinerary = {
      stops: locations,
      legs,
      totalDistanceKm: legs.reduce((sum, l) => sum + l.distanceKm, 0)
    };

    return res.json({ itinerary, rawExtractedText: rawText });
  } catch (err) {
    console.error('Trip parsing error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
