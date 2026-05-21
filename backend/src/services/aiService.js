const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fetch = require('node-fetch');

// Function to convert Multer file to Gemini FileData object
function fileToGenerativePart(file) {
  return {
    inlineData: {
      data: file.buffer.toString('base64'),
      mimeType: file.mimetype
    },
  };
}

// Function to extract text from files (PDF/Images)
async function extractTextFromFiles(files) {
  let combinedText = '';
  if (!files || files.length === 0) return '';
  for (const file of files) {
    try {
      if (file.mimetype === 'application/pdf') {
        const data = await pdfParse(file.buffer);
        combinedText += `\n--- File: ${file.originalname} ---\n${data.text}\n`;
      } else if (file.mimetype.startsWith('image/')) {
        const result = await Tesseract.recognize(file.buffer, 'eng');
        combinedText += `\n--- File: ${file.originalname} ---\n${result.data.text}\n`;
      }
    } catch (err) {
      console.error(`Error extracting text from file ${file.originalname}:`, err);
    }
  }
  return combinedText;
}

// Geocode destination using Nominatim
async function geocodeDestination(destinationName) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationName)}&limit=1&accept-language=en`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'TripPilotTravelPlanner/1.0 (contact@trippilot.com)' }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon, display_name, boundingbox } = data[0];
      return {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        displayName: display_name,
        boundingbox
      };
    }
  } catch (error) {
    console.error('Error geocoding destination:', error);
  }
  return null;
}

// Fetch live weather data from Open-Meteo
async function fetchWeatherData(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.current_weather) {
      const temp = data.current_weather.temperature;
      const weathercode = data.current_weather.weathercode;
      
      let condition = 'Clear';
      let suitComment = 'Pleasant weather for travel.';
      
      const wmoCodes = {
        0: { desc: 'Clear sky', suit: 'Excellent weather for travel! Pleasant and sunny.' },
        1: { desc: 'Mainly clear', suit: 'Great weather for travel. Mild and comfortable.' },
        2: { desc: 'Partly cloudy', suit: 'Great weather for travel. Comfortable skies.' },
        3: { desc: 'Overcast', suit: 'Overcast skies. Good weather for travel.' },
        45: { desc: 'Foggy', suit: 'Foggy conditions. Travel with caution, visibility may be low.' },
        48: { desc: 'Depositing rime fog', suit: 'Foggy conditions. Travel with caution.' },
        51: { desc: 'Light drizzle', suit: 'Light drizzle. Pack a light umbrella or rain jacket.' },
        53: { desc: 'Moderate drizzle', suit: 'Drizzle active. Indoor visits recommended.' },
        55: { desc: 'Dense drizzle', suit: 'Heavy drizzle. Consider indoor activities.' },
        61: { desc: 'Slight rain', suit: 'Slight rain. Keep an umbrella handy.' },
        63: { desc: 'Moderate rain', suit: 'Moderate rain. Outdoor activities might be limited.' },
        65: { desc: 'Heavy rain', suit: 'Heavy rain. Outdoor exploration not recommended.' },
        71: { desc: 'Slight snow', suit: 'Light snow. Beautiful winter landscapes, wrap up warm!' },
        73: { desc: 'Moderate snow', suit: 'Moderate snow. Cold winter weather, dress in layers.' },
        75: { desc: 'Heavy snow', suit: 'Heavy snow. Travel delays possible, wrap up warm.' },
        77: { desc: 'Snow grains', suit: 'Chilly winter weather with snow grains.' },
        80: { desc: 'Slight rain showers', suit: 'Passing light showers. Good for exploring between showers.' },
        81: { desc: 'Moderate rain showers', suit: 'Passing showers. Carry an umbrella.' },
        82: { desc: 'Violent rain showers', suit: 'Heavy rain showers. Stay indoors until it passes.' },
        85: { desc: 'Slight snow showers', suit: 'Cold snow showers. Cozy up indoors!' },
        86: { desc: 'Heavy snow showers', suit: 'Heavy snow showers. Cold and wintry.' },
        95: { desc: 'Thunderstorm', suit: 'Thunderstorms active. Avoid outdoor activities; stay safe!' },
        96: { desc: 'Thunderstorm with slight hail', suit: 'Stormy weather. Stay indoors and remain safe!' },
        99: { desc: 'Thunderstorm with heavy hail', suit: 'Severe storms. Stay indoors, travel not recommended.' }
      };
      
      if (wmoCodes[weathercode]) {
        condition = wmoCodes[weathercode].desc;
        suitComment = wmoCodes[weathercode].suit;
      }
      
      let tempComment = '';
      if (temp < 0) {
        tempComment = ' Extremely cold temperature. Wrap up in heavy winter wear.';
      } else if (temp < 10) {
        tempComment = ' Cold weather. A warm jacket or coat is recommended.';
      } else if (temp >= 10 && temp <= 25) {
        tempComment = ' Very pleasant temperature. Perfect for outdoor sightseeing!';
      } else if (temp > 25 && temp <= 35) {
        tempComment = ' Warm summer temperature. Keep hydrated and wear sun protection.';
      } else {
        tempComment = ' Extremely hot temperature. Plan indoor activities during midday peak.';
      }
      
      return {
        temp,
        condition,
        suitability: `${suitComment}${tempComment}`
      };
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
  }
  return {
    temp: 20,
    condition: 'Pleasant',
    suitability: 'Weather data unavailable. Generally suitable for travel.'
  };
}

// Fetch suggested hotels from Nominatim
async function fetchHotelSuggestions(cityName, boundingbox = null) {
  try {
    let url;
    if (boundingbox && boundingbox.length === 4) {
      const min_lat = boundingbox[0];
      const max_lat = boundingbox[1];
      const min_lon = boundingbox[2];
      const max_lon = boundingbox[3];
      const viewbox = `${min_lon},${max_lat},${max_lon},${min_lat}`;
      url = `https://nominatim.openstreetmap.org/search?format=json&q=hotel&viewbox=${viewbox}&bounded=1&limit=5`;
    } else {
      url = `https://nominatim.openstreetmap.org/search?format=json&q=hotels+in+${encodeURIComponent(cityName)}&limit=5`;
    }
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'TripPilotTravelPlanner/1.0 (contact@trippilot.com)' }
    });
    let data = await response.json();
    
    if ((!data || data.length === 0) && boundingbox) {
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=hotels+in+${encodeURIComponent(cityName)}&limit=5`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'TripPilotTravelPlanner/1.0 (contact@trippilot.com)' }
      });
      data = await fallbackRes.json();
    }
    
    if (data && data.length > 0) {
      return data.slice(0, 3).map(hotel => {
        const displayName = hotel.display_name;
        const parts = displayName.split(',');
        const name = parts[0].trim();
        const address = parts.slice(1).join(',').trim();
        return { name, address };
      });
    }
  } catch (error) {
    console.error('Error fetching hotel suggestions:', error);
  }
  return [];
}

// Parse departing source and destination locations from text
function parseSourceAndDestination(text, title, files) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  let source = '';
  let destination = '';
  
  const sourcePatterns = [
    /(?:from|source|origin|departure\s+from|boarding\s+at|departing\s+from)[:\s]+([A-Za-z\s,.-]+)/i,
    /departs?[:\s]+([A-Za-z\s,.-]+)/i,
    /origin[:\s]+([A-Za-z\s,.-]+)/i,
    /flight\s+from\s+([A-Za-z\s,.-]+)/i
  ];
  
  const destPatterns = [
    /(?:destination|arrival\s+at|arriving\s+at)[:\s]+([A-Za-z\s,.-]+)/i,
    /arrives?[:\s]+([A-Za-z\s,.-]+)/i,
    /dest[:\s]+([A-Za-z\s,.-]+)/i,
    /flight\s+to\s+([A-Za-z\s,.-]+)/i,
    /traveling\s+to\s+([A-Za-z\s,.-]+)/i
  ];
  
  for (const line of lines) {
    const flightMatch = /([A-Za-z\s]+)\s+to\s+([A-Za-z\s]+)/i.exec(line);
    if (flightMatch) {
      const srcCand = flightMatch[1].replace(/flight|ticket|booking/gi, '').trim();
      const destCand = flightMatch[2].replace(/flight|ticket|booking/gi, '').trim();
      if (srcCand && destCand && srcCand.length > 2 && destCand.length > 2) {
        source = srcCand;
        destination = destCand;
        break;
      }
    }
    
    if (!source) {
      for (const p of sourcePatterns) {
        const m = p.exec(line);
        if (m) {
          source = m[1].trim();
          break;
        }
      }
    }
    
    if (!destination) {
      for (const p of destPatterns) {
        const m = p.exec(line);
        if (m) {
          destination = m[1].trim();
          break;
        }
      }
    }
  }
  
  const knownCities = [
    'bali', 'paris', 'tokyo', 'london', 'new york', 'rome', 'dubai', 'goa',
    'delhi', 'mumbai', 'bengaluru', 'singapore', 'bangkok', 'sydney',
    'amsterdam', 'barcelona', 'berlin', 'cairo', 'istanbul', 'venice'
  ];
  
  if (!destination) {
    const textLower = text.toLowerCase();
    for (const city of knownCities) {
      if (textLower.includes(city)) {
        destination = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }
  }
  
  if (!destination && title && title.trim()) {
    const cleanTitle = title.toLowerCase()
      .replace(/trip|to|holiday|visit|plan|itinerary|for|my|amazing|vacation|tour|travel/gi, '')
      .trim();
    if (cleanTitle.length > 0) {
      destination = cleanTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  
  if (!destination && files && files.length > 0) {
    const firstFileName = files[0].originalname;
    const nameWithoutExt = firstFileName.substring(0, firstFileName.lastIndexOf('.')) || firstFileName;
    const clean = nameWithoutExt.toLowerCase()
      .replace(/ticket|flight|hotel|booking|voucher|reservation|doc|pdf|jpg|png|trip|travel/gi, '')
      .trim();
    if (clean.length > 0) {
      destination = clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  
  if (!destination) {
    destination = 'London, United Kingdom';
  }
  
  if (source && destination && source.toLowerCase().trim() === destination.toLowerCase().trim()) {
    const textLower = text.toLowerCase();
    for (const city of knownCities) {
      if (city !== destination.toLowerCase() && textLower.includes(city)) {
        source = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }
  }
  
  const cityMappings = {
    'bali': 'Bali, Indonesia',
    'paris': 'Paris, France',
    'tokyo': 'Tokyo, Japan',
    'london': 'London, United Kingdom',
    'new york': 'New York, USA',
    'rome': 'Rome, Italy',
    'dubai': 'Dubai, UAE',
    'goa': 'Goa, India'
  };
  
  const destLower = destination.toLowerCase().trim();
  for (const [key, val] of Object.entries(cityMappings)) {
    if (destLower.includes(key) || key.includes(destLower)) {
      destination = val;
      break;
    }
  }
  
  return {
    source: source || 'Delhi, India',
    destination
  };
}

// Parse dates from text
function parseDatesFromText(text) {
  const dateRegex = /\b(\d{1,2}(?:st|nd|rd|th)?[\s\-/]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-/]+\d{4})|\b(\d{4}[-/]\d{2}[-/]\d{2})|(\d{2}[-/]\d{2}[-/]\d{4})\b/gi;
  const matches = text.match(dateRegex);
  
  let checkIn = null;
  let checkOut = null;
  
  if (matches && matches.length > 0) {
    const dates = matches.map(m => {
      // If the match contains letters (e.g. 23 May 2024)
      if (/[A-Za-z]/.test(m)) {
        const d = new Date(m);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split('T')[0];
        }
      }
      const norm = m.replace(/\//g, '-');
      const parts = norm.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 2 && parts[2].length === 4) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      return norm;
    }).filter(d => d).sort((a, b) => new Date(a) - new Date(b));
    
    if (dates.length > 0) {
      checkIn = dates[0];
      if (dates.length > 1) {
        checkOut = dates[dates.length - 1];
      }
    }
  }
  
  if (!checkIn) {
    const checkInDate = new Date();
    checkIn = checkInDate.toISOString().split('T')[0];
  }
  if (!checkOut) {
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 5);
    checkOut = checkOutDate.toISOString().split('T')[0];
  }
  
  return { checkIn, checkOut };
}

// Parse flight details from text
function parseFlightDetails(text) {
  const flightRegex = /\b(?:flight|flt|airline)[:\s]*([A-Z0-9]{2,3}\s*[-]?\s*\d{2,4})\b/i;
  const m = flightRegex.exec(text);
  if (m) {
    return { flightNumber: m[1].toUpperCase().trim() };
  }
  
  const generalFlightRegex = /\b([A-Z]{2,3}\s*\d{2,4})\b/g;
  const matches = text.match(generalFlightRegex);
  if (matches && matches.length > 0) {
    const validFlights = matches.filter(f => !/^\d+$/.test(f) && !f.includes('AM') && !f.includes('PM'));
    if (validFlights.length > 0) {
      return { flightNumber: validFlights[0].toUpperCase().trim() };
    }
  }
  
  return { flightNumber: 'AI-101 (Mock Flight)' };
}

// Parse hotel details from text
function parseHotelDetails(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim());
  for (const line of lines) {
    if (/hotel|resort|inn|suites|villas|stay/i.test(line) && !/booking|ticket|voucher|flight/i.test(line)) {
      let hotelName = line.replace(/(?:hotel|resort|booking|confirmation|name)[:\s]*/i, '').trim();
      if (hotelName.length > 3 && hotelName.length < 50) {
        return {
          hotelName,
          address: `${hotelName}, Near City Center`
        };
      }
    }
  }
  return null;
}


const staticItineraries = {
  'bali': [
    {
      day: 1,
      title: "Welcome to Bali & Ubud Stroll",
      activities: [
        "Arrive at Ngurah Rai International Airport (DPS) and meet your private transfer.",
        "Check-in at your resort in Ubud and enjoy a complimentary welcome drink.",
        "Visit the famous Sacred Monkey Forest Sanctuary for a leisurely afternoon walk.",
        "Indulge in a delicious traditional Indonesian dinner at a local warung."
      ]
    },
    {
      day: 2,
      title: "Volcano Sunrise & Rice Terraces",
      activities: [
        "Early morning excursion to Mount Batur for a breathtaking sunrise hike.",
        "Relax your muscles in the natural hot springs of Toya Devasya.",
        "Explore the stunning Tegallalang Rice Terraces and take a ride on the iconic jungle swing.",
        "Stop by a local coffee plantation to taste the authentic Kopi Luwak."
      ]
    },
    {
      day: 3,
      title: "Uluwatu Clifftops & Jimbaran Seafood",
      activities: [
        "Travel south to the scenic Bukit Peninsula.",
        "Visit the majestic Uluwatu Temple perched on a towering cliff face.",
        "Watch the spectacular traditional Kecak Fire Dance performance at sunset.",
        "Enjoy a candlelit beachside seafood dinner on the white sands of Jimbaran Bay."
      ]
    },
    {
      day: 4,
      title: "Nusa Penida Island Adventure",
      activities: [
        "Take a fast boat from Sanur to the beautiful island of Nusa Penida.",
        "Photograph the jaw-dropping T-Rex shaped cliff at Kelingking Beach.",
        "Swim and snorkel in the crystal-clear waters of Angel's Billabong and Broken Beach.",
        "Return to main island Bali in the evening and relax at your hotel."
      ]
    },
    {
      day: 5,
      title: "Seminyak Shopping, Spa & Departure",
      activities: [
        "Morning yoga session followed by a healthy smoothie bowl breakfast.",
        "Enjoy a luxurious 1-hour Balinese massage and spa treatment.",
        "Do some last-minute boutique shopping along Seminyak's main streets.",
        "Depart to the airport for your return flight home."
      ]
    }
  ],
  'paris': [
    {
      day: 1,
      title: "Welcome to the City of Light",
      activities: [
        "Arrive at Charles de Gaulle Airport and transfer to your elegant hotel in the Latin Quarter.",
        "Spend the afternoon strolling along the banks of the beautiful Seine River.",
        "Climb to the top of the Eiffel Tower at sunset for a breathtaking view of Paris.",
        "Enjoy fresh croissants and French cuisine at a classic Parisian bistro."
      ]
    },
    {
      day: 2,
      title: "Artistic Masterpieces & Grand Boulevards",
      activities: [
        "Skip-the-line morning entry to the Louvre Museum to see the Mona Lisa and Venus de Milo.",
        "Walk down the famous Avenue des Champs-Élysées.",
        "Admire the grand Arc de Triomphe and climb to its panoramic viewing deck.",
        "Spend a relaxing evening in the lovely Jardin des Tuileries."
      ]
    },
    {
      day: 3,
      title: "Montmartre Charm & Seine Cruise",
      activities: [
        "Explore the winding cobblestone streets of the bohemian Montmartre district.",
        "Visit the beautiful Sacré-Cœur Basilica and take in the panoramic hilltop views.",
        "Watch local street painters work in Place du Tertre.",
        "Take a romantic sunset cruise down the Seine River with live commentary."
      ]
    },
    {
      day: 4,
      title: "Royal Palace of Versailles",
      activities: [
        "Take a short train ride to the magnificent Palace of Versailles.",
        "Tour the breathtaking Hall of Mirrors and the luxurious King's State Apartments.",
        "Explore the vast, beautifully manicured royal gardens and fountains.",
        "Return to Paris for a gourmet dinner in Saint-Germain-des-Prés."
      ]
    },
    {
      day: 5,
      title: "Charming Cafes & Departure",
      activities: [
        "Have a leisurely breakfast at the historic Café de Flore.",
        "Visit the stunning stained-glass windows of Sainte-Chapelle.",
        "Do some luxury shopping at Galeries Lafayette.",
        "Transfer to the airport for your journey home."
      ]
    }
  ],
  'tokyo': [
    {
      day: 1,
      title: "Arrive in Tokyo & Neon Lights",
      activities: [
        "Arrive at Narita or Haneda Airport and board the comfortable airport express train.",
        "Check-in at your hotel in Shinjuku.",
        "Explore the dazzling neon-lit streets of Kabukicho and Omoide Yokocho.",
        "Enjoy a steaming hot bowl of authentic Japanese ramen."
      ]
    },
    {
      day: 2,
      title: "Historic Temples & Quirky Culture",
      activities: [
        "Visit Tokyo's oldest and most iconic temple, Senso-ji, in historic Asakusa.",
        "Stroll down Nakamise Shopping Street to sample traditional street snacks.",
        "Head over to Harajuku's Takeshita Street to see colorful youth fashion and try giant crepes.",
        "Walk through the serene Meiji Jingu Shrine and its lush forested grounds."
      ]
    },
    {
      day: 3,
      title: "Futuristic Shibuya & Panoramic Views",
      activities: [
        "Walk across the world-famous Shibuya Crossing, the busiest intersection in the world.",
        "Go up to Shibuya Sky observation deck for spectacular 360-degree views of Tokyo (and Mt. Fuji on a clear day).",
        "Explore the high-tech, anime, and gaming paradise of Akihabara.",
        "Savor a delicious sushi dinner at a conveyor belt sushi restaurant."
      ]
    },
    {
      day: 4,
      title: "Day Trip to Mt. Fuji & Hakone",
      activities: [
        "Take the romancecar express train to the scenic hot spring town of Hakone.",
        "Cruise across Lake Ashi on a fun pirate ship with views of Mount Fuji.",
        "Ride the Hakone Ropeway over steaming volcanic valleys in Owakudani.",
        "Soak in a traditional Japanese hot spring (onsen) bath before returning to Tokyo."
      ]
    },
    {
      day: 5,
      title: "Gourmet Fish Market & Departure",
      activities: [
        "Visit Tsukiji Outer Market for a fresh seafood breakfast (Uni, Wagyu, and Tamagoyaki).",
        "Walk through the peaceful Hamarikyu Gardens, an oasis in the middle of skyscrapers.",
        "Pick up premium souvenirs like Matcha green tea and Tokyo Banana sweets.",
        "Depart to the airport for your flight home."
      ]
    }
  ],
  'london': [
    {
      day: 1,
      title: "Welcome to London & Iconic West End stroll",
      activities: [
        "Arrive at London Heathrow Airport (LHR) and transfer to your hotel in central London.",
        "Check-in and freshen up before exploring the lively Covent Garden.",
        "Walk around Leicester Square and Piccadilly Circus to see the famous neon displays.",
        "Enjoy a classic pub dinner with fish and chips in Soho."
      ]
    },
    {
      day: 2,
      title: "Royal Landmarks & Tower Bridge Cruise",
      activities: [
        "Visit Buckingham Palace to witness the Changing of the Guard ceremony.",
        "Walk through St. James's Park to see Westminster Abbey and the majestic Big Ben.",
        "Board a scenic River Thames cruise down to Tower Bridge.",
        "Explore the historic Tower of London and view the magnificent Crown Jewels."
      ]
    },
    {
      day: 3,
      title: "World-Class Museums & London Eye View",
      activities: [
        "Spend the morning exploring the historic British Museum.",
        "Stroll down Regent Street and Oxford Street for shopping.",
        "Experience a traditional English afternoon tea at a charming tea house.",
        "Take a flight on the London Eye at sunset for panoramic views of the city skyline."
      ]
    },
    {
      day: 4,
      title: "Windsor Castle & Stonehenge excursion",
      activities: [
        "Take a day trip excursion to Windsor Castle, the oldest occupied castle in the world.",
        "Continue to the prehistoric stone circle monument of Stonehenge.",
        "Learn about ancient history at the Stonehenge Visitor Centre.",
        "Return to London for a gourmet dinner in the vibrant Kensington area."
      ]
    },
    {
      day: 5,
      title: "Hyde Park Stroll & Departure",
      activities: [
        "Enjoy a peaceful morning walk through Hyde Park and visit Kensington Palace.",
        "Do some luxury souvenir shopping at Harrods in Knightsbridge.",
        "Check out from your hotel.",
        "Transfer to the airport for your flight back home."
      ]
    }
  ],
  'new york': [
    {
      day: 1,
      title: "Welcome to New York City & Times Square",
      activities: [
        "Arrive at John F. Kennedy International Airport (JFK) and transfer to your hotel in Manhattan.",
        "Settle into your room and head out to see the glowing billboard lights of Times Square.",
        "Dine at a classic New York steakhouse or try a slice of famous NY-style pizza.",
        "Head up to the Empire State Building Observatory deck for a stunning night view of the skyline."
      ]
    },
    {
      day: 2,
      title: "Central Park & Cultural Treasures",
      activities: [
        "Enjoy a morning stroll or bike ride through the beautiful Central Park.",
        "Visit the Metropolitan Museum of Art (The Met) to explore world-class exhibits.",
        "Walk down Fifth Avenue and admire the historic St. Patrick's Cathedral.",
        "Enjoy an evening Broadway musical show followed by dessert in Theater District."
      ]
    },
    {
      day: 3,
      title: "Statue of Liberty & Lower Manhattan",
      activities: [
        "Take an early morning ferry to Liberty Island to visit the iconic Statue of Liberty and Ellis Island.",
        "Walk through Wall Street, visit the Charging Bull, and pay respects at the 9/11 Memorial.",
        "Walk across the historic Brooklyn Bridge at sunset for gorgeous photos of Manhattan.",
        "Have a trendy dinner in DUMBO, Brooklyn before returning to your hotel."
      ]
    },
    {
      day: 4,
      title: "High Line Park & Hudson Yards",
      activities: [
        "Stroll along the High Line, an elevated linear park built on a historic freight rail line.",
        "Stop at Chelsea Market for a gourmet lunch with diverse food options.",
        "Explore the futuristic Hudson Yards and take photos of the unique Vessel structure.",
        "Spend a relaxing evening exploring Greenwich Village's jazz bars."
      ]
    },
    {
      day: 5,
      title: "SoHo Shopping & Departure",
      activities: [
        "Enjoy a classic bagel breakfast with lox and cream cheese.",
        "Spend the morning shopping in the trendy boutiques of SoHo and NoHo.",
        "Check out from your hotel.",
        "Transfer to the airport for your departure flight."
      ]
    }
  ],
  'rome': [
    {
      day: 1,
      title: "Welcome to Rome & Historic Center walk",
      activities: [
        "Arrive at Rome Fiumicino Airport (FCO) and transfer to your hotel in the historic center.",
        "Check-in and take a walking tour of the Trevi Fountain, Pantheon, and Piazza Navona.",
        "Remember to toss a coin into the Trevi Fountain to ensure your return to Rome.",
        "Enjoy a delicious dinner of Cacio e Pepe at a traditional Roman trattoria."
      ]
    },
    {
      day: 2,
      title: "Ancient Rome: Colosseum & Roman Forum",
      activities: [
        "Take a guided morning tour of the ancient Colosseum, hearing tales of gladiators.",
        "Explore the ruins of the Roman Forum, the hub of ancient Roman public life.",
        "Walk up Palatine Hill for fantastic views of the archaeological park.",
        "Indulge in a gelato tasting session at a historic gelateria."
      ]
    },
    {
      day: 3,
      title: "Vatican City: St. Peter's & Sistine Chapel",
      activities: [
        "Cross the border into Vatican City, the world's smallest independent state.",
        "Tour the Vatican Museums, highlighting the breathtaking Sistine Chapel ceiling by Michelangelo.",
        "Enter St. Peter's Basilica to admire Pieta and climb the dome for panoramic views.",
        "Have dinner in the lively Trastevere neighborhood, known for its bohemian vibe."
      ]
    },
    {
      day: 4,
      title: "Borghese Gallery & Spanish Steps",
      activities: [
        "Visit the elegant Borghese Gallery to view masterpieces by Bernini and Caravaggio.",
        "Relax in the luxury Villa Borghese gardens.",
        "Walk down to the famous Spanish Steps and explore the high-end shops of Via Condotti.",
        "Enjoy a scenic dinner overlooking the city skyline."
      ]
    },
    {
      day: 5,
      title: "Souvenir Shopping & Departure",
      activities: [
        "Savor your last Italian espresso and cornetto at a local cafe.",
        "Purchase local specialties like olive oil, limoncello, and dry pasta.",
        "Check out from your hotel.",
        "Transfer to the airport for your flight home."
      ]
    }
  ],
  'dubai': [
    {
      day: 1,
      title: "Welcome to Dubai & Burj Khalifa Heights",
      activities: [
        "Arrive at Dubai International Airport (DXB) and transfer to your hotel via luxury car.",
        "Check-in and refresh with views of the modern skyline.",
        "Visit the Dubai Mall and climb to the top of the Burj Khalifa (124th & 125th floors).",
        "Watch the spectacular Dubai Fountain Show at the base of the tower."
      ]
    },
    {
      day: 2,
      title: "Desert Safari & Cultural Evening",
      activities: [
        "Spend a relaxing morning at Jumeirah Beach overlooking Burj Al Arab.",
        "Depart in the afternoon for an exciting 4x4 desert safari adventure.",
        "Experience dune bashing, sandboarding, and camel riding.",
        "Enjoy a traditional BBQ dinner under the stars at a Bedouin camp with belly dancing performances."
      ]
    },
    {
      day: 3,
      title: "Modern Dubai & Palm Jumeirah Cruise",
      activities: [
        "Take a monorail ride across the artificial island of Palm Jumeirah.",
        "Visit the Lost Chambers Aquarium at Atlantis The Palm resort.",
        "Walk around Dubai Marina and enjoy a luxury yacht cruise.",
        "Dine at a premium marina-side restaurant."
      ]
    },
    {
      day: 4,
      title: "Old Dubai & Gold/Spice Souks",
      activities: [
        "Travel to Old Dubai to visit the Dubai Museum in Al Fahidi Fort.",
        "Ride a traditional Abra water taxi across Dubai Creek.",
        "Shop for jewelry and spices at the world-famous Gold and Spice Souks.",
        "Try authentic Emirati cuisine at the Sheikh Mohammed Centre for Cultural Understanding."
      ]
    },
    {
      day: 5,
      title: "Souvenir Shopping & Departure",
      activities: [
        "Visit the beautiful Dubai Miracle Garden (seasonal) or enjoy pool time at your hotel.",
        "Shop for dates, camel milk chocolates, and perfumes.",
        "Check out from your hotel.",
        "Transfer to the airport for your flight back home."
      ]
    }
  ],
  'goa': [
    {
      day: 1,
      title: "Arrive in Sunny Goa & Sunset Vibe",
      activities: [
        "Arrive at Goa International Airport / Train Station and transfer to your beachside resort.",
        "Check-in and freshen up with view of the Arabian Sea.",
        "Walk down to Baga Beach to catch a gorgeous golden sunset.",
        "Enjoy a beachside dinner with live music, fresh seafood, and tropical mocktails/cocktails."
      ]
    },
    {
      day: 2,
      title: "Thrilling Water Sports & Fort Aguada",
      activities: [
        "Have a buffet breakfast at the resort.",
        "Participate in exciting water sports like jet skiing, parasailing, and banana boat rides at Calangute Beach.",
        "Visit the historic 17th-century Fort Aguada and its beautiful lighthouse.",
        "Relax in the evening at a cozy lounge in Candolim."
      ]
    },
    {
      day: 3,
      title: "South Goa Culture & Spice Plantation Tour",
      activities: [
        "Take a day trip to explore the charming heritage of South Goa.",
        "Visit the famous UNESCO World Heritage site, Basilica of Bom Jesus, in Old Goa.",
        "Take a guided tour of a tropical Spice Plantation followed by a traditional buffet lunch served on banana leaves.",
        "Take a romantic sunset boat cruise on the Mandovi River with traditional Goan folk dances."
      ]
    },
    {
      day: 4,
      title: "Bohemian Beaches & Flea Markets",
      activities: [
        "Explore the scenic cliffs and red sands of Vagator Beach.",
        "Visit the famous Anjuna Beach, known for its bohemian flea markets and laidback shacks.",
        "Have lunch at a cliffside restaurant overlooking the beach.",
        "Spend a relaxing evening watching the waves at Arambol Beach."
      ]
    },
    {
      day: 5,
      title: "Souvenir Shopping & Departure",
      activities: [
        "Enjoy a final morning walk along the beach and collect sea shells.",
        "Shop for local Cashews, Feni, and beautiful handmade crafts in Panaji market.",
        "Check out from your resort.",
        "Transfer to the airport or railway station for your departure home with amazing memories."
      ]
    }
  ]
};

// Generate a premium template itinerary dynamically inserting destination name
const generateDynamicItinerary = (destinationName) => {
  const shortName = destinationName.split(',')[0].trim();
  return [
    {
      day: 1,
      title: `Welcome to ${shortName} & Initial Exploring`,
      activities: [
        `Arrive at the main airport/station of ${shortName} and transfer to your hotel.`,
        `Check-in, settle down, and refresh yourself after the journey to ${shortName}.`,
        `Take a leisurely stroll in the neighborhood or downtown area of ${shortName}.`,
        `Enjoy a delicious welcome dinner at a highly-rated local restaurant specializing in ${shortName} cuisine.`
      ]
    },
    {
      day: 2,
      title: "Historic Landmarks & Cultural Tour",
      activities: [
        `Embark on a guided city tour of ${shortName}'s most famous historical landmarks and attractions.`,
        "Visit local museums or galleries to understand the heritage of the region.",
        "Stop at a charming cafe for a traditional local lunch/coffee.",
        "Stroll through a famous city park or pedestrian street in the evening."
      ]
    },
    {
      day: 3,
      title: "Scenic Views & Local Experiences",
      activities: [
        `Head to a popular observation deck or scenic spot for panoramic views of ${shortName}.`,
        "Participate in a local cooking class, artisan workshop, or cultural activity.",
        `Explore the vibrant markets or shopping district of ${shortName} for unique finds.`,
        "Indulge in a premium dinner experience featuring local signature dishes."
      ]
    },
    {
      day: 4,
      title: "Day Trip or Off-the-Beaten-Path Adventure",
      activities: [
        `Take a short trip outside the main area of ${shortName} to explore surrounding nature or a nearby town.`,
        "Visit a historic castle, temple, sanctuary, or scenic countryside.",
        "Have a picnic or a cozy lunch at a scenic spot.",
        `Return to ${shortName} for a relaxing evening and check out the local nightlife or night markets.`
      ]
    },
    {
      day: 5,
      title: "Souvenir Shopping & Departure",
      activities: [
        "Enjoy a final morning walk and capture last-minute photos.",
        `Shop for authentic souvenirs, local treats, and crafts unique to ${shortName}.`,
        "Return to the hotel to pack and complete the checkout process.",
        `Transfer to the airport or station for your journey back home.`
      ]
    }
  ];
};

const extractAndGenerateItinerary = async (files, customTitle = '') => {
  // 1. Extract text from uploaded files (PDF/Images)
  const extractedText = await extractTextFromFiles(files);
  const imageParts = files.map(fileToGenerativePart);
  
  const hasValidKey = process.env.GEMINI_API_KEY && 
                        process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' && 
                        !process.env.GEMINI_API_KEY.includes('your_gemini');

  let destination = '';
  let travelDates = { checkIn: null, checkOut: null };
  let flightDetails = { flightNumber: null };
  let hotelDetails = null;

  // 2. Determine base details (AI or local fallback)
  if (hasValidKey) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const extractPrompt = `
        Analyze the following travel document text and the user title hint.
        Extract the true arrival destination city, travel dates, flight number, and hotel name.
        Be extremely careful NOT to extract generic words like "Your" or "To" as the destination.
        
        Document text: """${extractedText}"""
        User Title Hint: "${customTitle}"
        
        Respond ONLY with a valid JSON object. Do not include markdown formatting like \`\`\`json.
        {
          "destination": "City Name, Country",
          "checkIn": "YYYY-MM-DD",
          "checkOut": "YYYY-MM-DD",
          "flightNumber": "Flight number if found",
          "hotelName": "Hotel name if found"
        }
      `;
      const extResult = await model.generateContent([extractPrompt, ...imageParts]);
      const extJsonStr = extResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const extData = JSON.parse(extJsonStr);
      
      destination = extData.destination;
      if (extData.checkIn) travelDates.checkIn = extData.checkIn;
      if (extData.checkOut) travelDates.checkOut = extData.checkOut;
      if (extData.flightNumber) flightDetails.flightNumber = extData.flightNumber;
      if (extData.hotelName) hotelDetails = { hotelName: extData.hotelName, address: extData.destination };
    } catch (e) {
      console.error("Initial AI extraction failed, using fallback parsing.", e);
      const parsed = parseSourceAndDestination(extractedText, customTitle, files);
      destination = parsed.destination;
      travelDates = parseDatesFromText(extractedText);
      flightDetails = parseFlightDetails(extractedText);
      hotelDetails = parseHotelDetails(extractedText);
    }
  } else {
    const parsed = parseSourceAndDestination(extractedText, customTitle, files);
    destination = parsed.destination;
    travelDates = parseDatesFromText(extractedText);
    flightDetails = parseFlightDetails(extractedText);
    hotelDetails = parseHotelDetails(extractedText);
  }
  
  if (!destination || destination.trim().length < 3 || ['your', 'to', 'from', 'dest', 'destination'].includes(destination.trim().toLowerCase())) {
    destination = customTitle && customTitle.trim().length > 2 ? customTitle : 'London, United Kingdom';
  }
  
  // 3. Geocode destination
  const geoResult = await geocodeDestination(destination);
  const finalDestinationName = geoResult ? geoResult.displayName : destination;
  
  // 4. Fetch Weather and Hotel Suggestions
  let lat = 51.5074, lon = -0.1278; // London defaults
  let boundingbox = null;
  if (geoResult) {
    lat = geoResult.lat;
    lon = geoResult.lon;
    boundingbox = geoResult.boundingbox;
  }
  
  const liveWeather = await fetchWeatherData(lat, lon);
  const suggestedHotels = await fetchHotelSuggestions(finalDestinationName, boundingbox);
  
  // If no hotel details parsed, choose first suggested hotel
  let finalHotelDetails = hotelDetails;
  if (!finalHotelDetails && suggestedHotels && suggestedHotels.length > 0) {
    finalHotelDetails = {
      hotelName: suggestedHotels[0].name,
      address: suggestedHotels[0].address
    };
  } else if (!finalHotelDetails) {
    finalHotelDetails = {
      hotelName: `${finalDestinationName.split(',')[0]} Hotel & Suites`,
      address: `Main Road, ${finalDestinationName}`
    };
  }

  if (!hasValidKey) {
    console.log("GEMINI_API_KEY is not configured. Automatically generating premium mock itinerary using live data.");
    
    // Choose itinerary summary (static or dynamic)
    const cityKey = finalDestinationName.split(',')[0].toLowerCase().trim();
    let itinerary = [];
    if (staticItineraries[cityKey]) {
      itinerary = staticItineraries[cityKey];
    } else {
      let matchedKey = null;
      for (const key of Object.keys(staticItineraries)) {
        if (cityKey.includes(key) || key.includes(cityKey)) {
          matchedKey = key;
          break;
        }
      }
      if (matchedKey) {
        itinerary = staticItineraries[matchedKey];
      } else {
        itinerary = generateDynamicItinerary(finalDestinationName);
      }
    }
    
    return {
      extractedDetails: {
        destination: finalDestinationName,
        travelDates,
        flightDetails,
        hotelDetails: finalHotelDetails
      },
      itinerary,
      liveWeather,
      suggestedHotels
    };
  }

  // 5. Generate Final Itinerary
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an elite, expert AI Travel Planner.
      
      CRITICAL INSTRUCTIONS:
      1. You MUST generate the entire response, including the itinerary, strictly in ENGLISH. Do not use any other language (e.g., no Chinese, Japanese, etc.), even if the extracted text contains gibberish or foreign characters.
      2. Construct an absolutely perfect, highly-detailed travel itinerary for the destination: "${finalDestinationName}". 
      3. Do not do a half-assed job. Make the itinerary premium, immersive, and thorough. 
      4. You MUST include top historical places, deeply traditional cultural sites, and famous landmarks where tourists love to visit in this location. 
      5. The travel dates are from ${travelDates.checkIn || 'start'} to ${travelDates.checkOut || 'end'}. Plan the days exactly matching these dates.
      6. Incorporate the live weather dynamically into your advice. The current weather is ${liveWeather.temp}°C, ${liveWeather.condition}. Suitability: ${liveWeather.suitability}.
      7. If the documents did not mention a hotel, the user will be staying at: ${finalHotelDetails.hotelName}. Include this in the arrival day.
      8. CRITICAL: START TOURING IMMEDIATELY ON DAY 1 (the arrival date). Do not waste Day 1 just resting or checking in. Include major sightseeing activities on the very first day.
      9. Format the 'title' field of each day to include the actual calendar date, for example: "May 23, 2024 - Historic City Tour".
      
      Output strictly in the following JSON format:
      {
        "extractedDetails": {
          "destination": "${finalDestinationName}",
          "travelDates": {
            "checkIn": "${travelDates.checkIn || ''}",
            "checkOut": "${travelDates.checkOut || ''}"
          },
          "flightDetails": {
            "flightNumber": "${flightDetails.flightNumber || ''}",
            "departureTime": "",
            "arrivalTime": ""
          },
          "hotelDetails": {
            "hotelName": "${finalHotelDetails.hotelName}",
            "address": "${finalHotelDetails.address}"
          }
        },
        "itinerary": [
          {
            "day": 1,
            "title": "Date (e.g. May 23, 2024) - Day Title",
            "activities": ["Highly detailed activity 1", "Highly detailed activity 2"]
          }
        ],
        "liveWeather": {
          "temp": ${liveWeather.temp},
          "condition": "${liveWeather.condition}",
          "suitability": "${liveWeather.suitability}"
        },
        "suggestedHotels": ${JSON.stringify(suggestedHotels)}
      }
      Make sure to only output valid JSON. Do not include markdown code block wrappings like \`\`\`json.
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    
    try {
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonStr);
      
      if (!data.liveWeather) data.liveWeather = liveWeather;
      if (!data.suggestedHotels) data.suggestedHotels = suggestedHotels;
      
      return data;
    } catch (parseError) {
      console.error("AI Response Parsing Error, falling back to mock:", responseText);
      return {
        extractedDetails: {
          destination: finalDestinationName,
          travelDates,
          flightDetails,
          hotelDetails: finalHotelDetails
        },
        itinerary: generateDynamicItinerary(finalDestinationName),
        liveWeather,
        suggestedHotels
      };
    }
  } catch (apiError) {
    console.error("Gemini API Error, falling back to mock:", apiError);
    return {
      extractedDetails: {
        destination: finalDestinationName,
        travelDates,
        flightDetails,
        hotelDetails: finalHotelDetails
      },
      itinerary: generateDynamicItinerary(finalDestinationName),
      liveWeather,
      suggestedHotels
    };
  }
};

module.exports = { extractAndGenerateItinerary };
