/**
 * Where 360VUE works: every state and city in South India we serve, with copy written for that place.
 *
 * Each city page (/locations/<slug>) is built from this file. Write what is true about the place and the kinds of
 * spaces there; never claim past projects, an office or a team in a city — 360VUE travels to it (travel and stay
 * outside the base are billed at cost and shown on the quote). Airspace notes name the airports and restricted areas
 * near the city: drones there need permission, and some places cannot be flown at all.
 */

export interface State {
  slug: string;
  name: string;
  /** the state's name in its own script */
  local: string;
  intro: string;
}

export interface City {
  slug: string;
  name: string;
  /** the city's name in the local script */
  local: string;
  state: string;
  /** other names people search with */
  aka?: string[];
  /** two or three sentences about the spaces here that a 360° tour helps sell */
  intro: string;
  /** the kinds of places here that suit a tour or SkyVUE, most important first */
  fits: string[];
  /** the SkyVUE angle for this place */
  sky: string;
  /** airspace near the city (airports, restricted areas) */
  airspace: string;
  nearby: string[];
}

export const STATES: State[] = [
  { slug: "karnataka", name: "Karnataka", local: "ಕರ್ನಾಟಕ", intro: "From Bengaluru's cafés, offices and apartment launches to coastal resorts in Udupi and coffee-estate homestays in Coorg and Chikkamagaluru." },
  { slug: "tamil-nadu", name: "Tamil Nadu", local: "தமிழ்நாடு", intro: "Chennai's showrooms and hospitals, Coimbatore's textile and engineering businesses, Madurai's hotels near the temple, and hill resorts in Ooty." },
  { slug: "kerala", name: "Kerala", local: "കേരളം", intro: "Kochi's hotels and cafés, Thiruvananthapuram's hospitals and colleges, houseboats and lake resorts in Alappuzha, and tea-country stays in Munnar." },
  { slug: "telangana", name: "Telangana", local: "తెలంగాణ", intro: "Hyderabad's restaurants, gated communities, tech-park offices and banquet halls, and growing education and healthcare in Warangal." },
  { slug: "andhra-pradesh", name: "Andhra Pradesh", local: "ఆంధ్రప్రదేశ్", intro: "Beach-side hotels and apartments in Visakhapatnam, wedding halls and showrooms in Vijayawada and Guntur, and pilgrim hotels in Tirupati." },
  { slug: "puducherry", name: "Puducherry", local: "புதுச்சேரி", intro: "Heritage stays and cafés in the French Quarter, beach resorts and boutique hotels along the East Coast Road." },
];

export const CITIES: City[] = [
  /* ── Karnataka ── */
  {
    slug: "bengaluru", name: "Bengaluru", local: "ಬೆಂಗಳೂರು", state: "karnataka", aka: ["Bangalore"],
    intro: "Bengaluru buys online first. Diners pick cafés and breweries on Google Maps, companies short-list co-working spaces and offices from a link, and apartment buyers — many of them relocating or abroad — want to see a flat before they fly in. A 360° tour answers all three.",
    fits: ["Cafés, breweries and restaurants", "Co-working spaces and offices", "Apartment launches and show-flats", "Wedding and event venues", "Clinics, gyms and studios"],
    sky: "SkyVUE shows a project's distance to the metro, the Outer Ring Road, tech parks, schools and hospitals — the questions every Bengaluru buyer asks first.",
    airspace: "Areas around Kempegowda International Airport, HAL and the city's defence establishments are restricted. We check the airspace map for your exact location and apply for permission where needed before we book.",
    nearby: ["mysuru", "chennai", "hyderabad", "coorg"],
  },
  {
    slug: "mysuru", name: "Mysuru", local: "ಮೈಸೂರು", state: "karnataka", aka: ["Mysore"],
    intro: "Mysuru lives on tourism and heritage: hotels, homestays and heritage properties near the palace, wedding halls, and a growing number of villa and plotted-layout projects on the city's edges. A tour lets guests and buyers from Bengaluru and abroad see the place before they travel.",
    fits: ["Hotels, homestays and heritage stays", "Wedding halls and convention centres", "Plotted layouts and villa projects", "Yoga shalas and wellness retreats", "Schools and colleges"],
    sky: "For layouts and villa projects, SkyVUE labels the ring road, the expressway to Bengaluru, Chamundi Hills and the nearest schools — with distances.",
    airspace: "The palace area and the surroundings of Mysuru airport have airspace rules. We check the zone for your exact pin first; heritage sites may need extra permission.",
    nearby: ["bengaluru", "coorg", "chikkamagaluru", "mangaluru"],
  },
  {
    slug: "mangaluru", name: "Mangaluru", local: "ಮಂಗಳೂರು", state: "karnataka", aka: ["Mangalore"],
    intro: "Mangaluru mixes a port city's business with coastal hospitality: hotels, seafood restaurants, hospitals and medical colleges that draw patients and students from across the region, and apartments sold to families working in the Gulf. A tour lets them look around from anywhere.",
    fits: ["Hospitals and medical colleges", "Hotels and coastal restaurants", "Apartments sold to buyers abroad", "Colleges and hostels", "Banquet halls"],
    sky: "SkyVUE shows coastal and riverside properties with the beach, the highway and the airport labelled with distances.",
    airspace: "Mangaluru International Airport and the port area are restricted zones. We confirm what is possible for your location before booking.",
    nearby: ["udupi-manipal", "coorg", "chikkamagaluru", "kozhikode"],
  },
  {
    slug: "udupi-manipal", name: "Udupi & Manipal", local: "ಉಡುಪಿ", state: "karnataka", aka: ["Udupi", "Manipal"],
    intro: "Udupi and Manipal draw students, parents and pilgrims from across India. Universities, hostels and PG accommodation, beach resorts near Malpe and Kaup, and hotels and restaurants all win when people can look inside before they travel.",
    fits: ["Hostels, PGs and student housing", "Colleges and campuses", "Beach resorts and homestays", "Hotels and restaurants", "Hospitals and clinics"],
    sky: "A campus or a beach resort is best understood from above: SkyVUE labels the blocks, the beach and the highway, and tapping a building opens its 360°.",
    airspace: "Coastal and nearby airport zones (Mangaluru) apply. We check your exact location before booking.",
    nearby: ["mangaluru", "chikkamagaluru", "coorg", "hubballi-dharwad"],
  },
  {
    slug: "coorg", name: "Coorg (Kodagu)", local: "ಕೊಡಗು", state: "karnataka", aka: ["Kodagu", "Madikeri"],
    intro: "Coorg's homestays, coffee-estate bungalows and resorts compete for the same weekend travellers from Bengaluru and Mysuru. Guests book the one they trust — and a 360° tour of the rooms, the pool and the estate builds that trust.",
    fits: ["Homestays and estate bungalows", "Resorts and wellness retreats", "Coffee estates for sale", "Restaurants and cafés", "Event and wedding venues"],
    sky: "SkyVUE is made for estates: the bungalow, the plantation, the stream and the view, from above — then tap the bungalow to walk inside.",
    airspace: "Most of Coorg is open airspace, but forest and protected areas have rules. We check the zone and the forest status of your property before booking.",
    nearby: ["mysuru", "chikkamagaluru", "mangaluru", "bengaluru"],
  },
  {
    slug: "chikkamagaluru", name: "Chikkamagaluru", local: "ಚಿಕ್ಕಮಗಳೂರು", state: "karnataka", aka: ["Chikmagalur"],
    intro: "Chikkamagaluru's coffee estates, homestays and hill resorts sell an experience — mist, hills and quiet. Photos rarely do it justice; a 360° tour of the rooms and the view does.",
    fits: ["Homestays and resorts", "Coffee estates", "Restaurants and cafés", "Camping and adventure stays", "Estate and farmland sales"],
    sky: "SkyVUE puts guests above the estate with the nearest peaks, the town and the access road labelled with distances.",
    airspace: "Mostly open airspace; forest and protected areas need checks. We confirm before booking.",
    nearby: ["coorg", "mangaluru", "udupi-manipal", "mysuru"],
  },
  {
    slug: "hubballi-dharwad", name: "Hubballi–Dharwad", local: "ಹುಬ್ಬಳ್ಳಿ–ಧಾರವಾಡ", state: "karnataka", aka: ["Hubli", "Dharwad", "Hubballi"],
    intro: "Hubballi–Dharwad is North Karnataka's commercial and education centre: showrooms, hospitals, colleges, coaching centres and new residential projects. Few local businesses show their space online yet — a tour makes you the one people remember.",
    fits: ["Showrooms and retail", "Hospitals and diagnostic centres", "Colleges and coaching centres", "Residential and plotted projects", "Banquet halls"],
    sky: "For plotted layouts, SkyVUE labels the BRTS corridor, the highway, schools and hospitals with distances.",
    airspace: "The surroundings of Hubballi airport are restricted. We check your exact location before booking.",
    nearby: ["belagavi", "bengaluru", "udupi-manipal", "mysuru"],
  },
  {
    slug: "belagavi", name: "Belagavi", local: "ಬೆಳಗಾವಿ", state: "karnataka", aka: ["Belgaum"],
    intro: "Belagavi sits between Karnataka, Maharashtra and Goa, with a large cantonment, industries, hospitals, colleges and wedding venues serving the whole region. A tour reaches families and clients across all three states.",
    fits: ["Wedding halls and lawns", "Hospitals and colleges", "Industrial units and showrooms", "Residential projects", "Hotels and resorts"],
    sky: "SkyVUE labels the highway, the railway station and the city's landmarks for residential projects and resorts.",
    airspace: "The cantonment and the surroundings of Belagavi airport are restricted zones. We check the zone for your exact pin first.",
    nearby: ["hubballi-dharwad", "bengaluru", "udupi-manipal", "mangaluru"],
  },

  /* ── Tamil Nadu ── */
  {
    slug: "chennai", name: "Chennai", local: "சென்னை", state: "tamil-nadu", aka: ["Madras"],
    intro: "Chennai is a city of showrooms, hospitals, wedding halls and apartment projects — and of families who decide together, often across cities and countries. A 360° tour lets everyone look around from their own phone before the visit.",
    fits: ["Wedding halls and convention centres", "Hospitals and clinics", "Jewellery, furniture and car showrooms", "Apartment projects along OMR and ECR", "Restaurants and hotels"],
    sky: "SkyVUE shows a project's distance to the metro, OMR, the beach, IT parks and schools — on one screen.",
    airspace: "Chennai International Airport, the port and defence areas are restricted. We check your exact location and apply for permission where possible.",
    nearby: ["puducherry", "bengaluru", "tiruchirappalli", "vijayawada"],
  },
  {
    slug: "coimbatore", name: "Coimbatore", local: "கோயம்புத்தூர்", state: "tamil-nadu", aka: ["Kovai"],
    intro: "Coimbatore's textile mills, engineering units and education institutions do business with buyers far away, and its hospitals, showrooms and wedding halls serve the whole western region. A tour of a factory floor or a hospital wing wins trust before the first visit.",
    fits: ["Factories and industrial units", "Hospitals and clinics", "Colleges and schools", "Wedding halls", "Showrooms and residential projects"],
    sky: "SkyVUE shows a factory or a campus with its access roads, the highway and the airport labelled with distances — useful for buyers and partners.",
    airspace: "The surroundings of Coimbatore International Airport and the air force station are restricted. We check the zone first.",
    nearby: ["ooty", "madurai", "kochi", "thrissur"],
  },
  {
    slug: "madurai", name: "Madurai", local: "மதுரை", state: "tamil-nadu",
    intro: "Madurai welcomes pilgrims and tourists all year: hotels and lodges near the Meenakshi Amman temple, restaurants, wedding halls and hospitals that serve all of south Tamil Nadu. A tour helps visitors choose before they arrive.",
    fits: ["Hotels and lodges", "Wedding halls", "Hospitals", "Textile and jewellery showrooms", "Colleges"],
    sky: "SkyVUE labels the temple, the railway station and the bus stand with distances for hotels and residential projects.",
    airspace: "Madurai airport and the temple area have airspace rules, and drones are not allowed over the temple. We confirm what is possible before booking.",
    nearby: ["tiruchirappalli", "coimbatore", "chennai", "thiruvananthapuram"],
  },
  {
    slug: "tiruchirappalli", name: "Tiruchirappalli", local: "திருச்சிராப்பள்ளி", state: "tamil-nadu", aka: ["Trichy", "Tiruchi"],
    intro: "Trichy is an education and pilgrimage hub: engineering and medical colleges, hostels, hospitals, temples and the hotels around them. Students, parents and pilgrims decide from far away — a 360° tour shows them the rooms, labs and wards.",
    fits: ["Colleges and hostels", "Hospitals", "Hotels and lodges", "Wedding halls", "Showrooms"],
    sky: "SkyVUE presents a campus from above with every block labelled — tap a block to walk inside.",
    airspace: "Tiruchirappalli International Airport and nearby defence facilities are restricted. We check your exact location first.",
    nearby: ["madurai", "chennai", "puducherry", "coimbatore"],
  },
  {
    slug: "ooty", name: "Ooty (Nilgiris)", local: "உதகமண்டலம்", state: "tamil-nadu", aka: ["Ooty", "Udhagamandalam", "Coonoor", "Nilgiris"],
    intro: "Ooty and Coonoor's resorts, cottages, heritage bungalows and tea estates sell views and cool weather. Guests compare many places online — a 360° tour of the cottage and the view decides the booking.",
    fits: ["Resorts and cottages", "Heritage bungalows and homestays", "Tea estates", "Boarding schools", "Restaurants and cafés"],
    sky: "SkyVUE shows the hills, the lake and the town with distances — and the resort itself from above.",
    airspace: "Forest and protected areas in the Nilgiris have rules, and flights near defence establishments need permission. We check before booking.",
    nearby: ["coimbatore", "mysuru", "coorg", "kozhikode"],
  },

  /* ── Kerala ── */
  {
    slug: "kochi", name: "Kochi", local: "കൊച്ചി", state: "kerala", aka: ["Cochin", "Ernakulam"],
    intro: "Kochi is Kerala's business capital and a tourism gateway: hotels, heritage stays in Fort Kochi, cafés, hospitals, and apartments bought by Keralites working abroad. A tour lets a buyer in Dubai or a tourist in Delhi walk through before they book.",
    fits: ["Hotels and heritage stays", "Apartments for buyers abroad", "Hospitals", "Cafés and restaurants", "Convention centres and wedding venues"],
    sky: "SkyVUE labels the metro, the backwaters, the airport and the IT parks with distances — the location story for any Kochi project.",
    airspace: "Cochin International Airport, the naval base and the port are restricted zones. We check your exact location before booking.",
    nearby: ["thrissur", "alappuzha", "munnar", "kozhikode"],
  },
  {
    slug: "thiruvananthapuram", name: "Thiruvananthapuram", local: "തിരുവനന്തപുരം", state: "kerala", aka: ["Trivandrum"],
    intro: "Thiruvananthapuram's hospitals and medical colleges, IT parks, beach resorts at Kovalam and Varkala, and residential projects all serve people deciding from a distance — patients, professionals and tourists.",
    fits: ["Hospitals and wellness centres", "Beach resorts and hotels", "Residential projects", "Colleges", "Offices in IT parks"],
    sky: "SkyVUE shows a resort's beach and a project's distance to the IT park, the airport and hospitals.",
    airspace: "Thiruvananthapuram International Airport, government and defence areas are restricted. We check your location before booking.",
    nearby: ["kochi", "alappuzha", "madurai", "munnar"],
  },
  {
    slug: "kozhikode", name: "Kozhikode", local: "കോഴിക്കോട്", state: "kerala", aka: ["Calicut"],
    intro: "Kozhikode's hospitals, wedding venues, restaurants and textile showrooms serve all of north Kerala, and many of its apartment buyers live in the Gulf. A tour brings the space to them.",
    fits: ["Hospitals", "Wedding venues and convention centres", "Restaurants and cafés", "Textile and jewellery showrooms", "Apartments for buyers abroad"],
    sky: "SkyVUE labels the beach, the railway station and the highway for residential and commercial projects.",
    airspace: "Calicut International Airport and nearby restricted areas need permission. We check your exact pin first.",
    nearby: ["thrissur", "kochi", "mangaluru", "ooty"],
  },
  {
    slug: "thrissur", name: "Thrissur", local: "തൃശ്ശൂർ", state: "kerala", aka: ["Trichur"],
    intro: "Thrissur is known for its jewellery and textile showrooms, wedding venues, hospitals and temples. Families shopping for a wedding — often from abroad — can walk through a showroom or a hall in 360° before they come.",
    fits: ["Jewellery and textile showrooms", "Wedding and convention halls", "Hospitals", "Hotels", "Residential projects"],
    sky: "SkyVUE labels the town, the highway and the railway station with distances for projects and venues.",
    airspace: "Temple areas and protected sites have rules. We check what is possible for your location before booking.",
    nearby: ["kochi", "kozhikode", "coimbatore", "munnar"],
  },
  {
    slug: "alappuzha", name: "Alappuzha", local: "ആലപ്പുഴ", state: "kerala", aka: ["Alleppey"],
    intro: "Alappuzha's houseboats, lake resorts and homestays sell an experience guests can't picture from a photo. A 360° tour of the bedroom, the deck and the view from the water makes the booking.",
    fits: ["Houseboats", "Lake and backwater resorts", "Homestays", "Ayurveda centres", "Restaurants"],
    sky: "SkyVUE shows the backwaters, the resort and its surroundings from above — then tap the houseboat to step aboard.",
    airspace: "Most of the backwaters are open airspace; protected bird areas have rules. We check before booking.",
    nearby: ["kochi", "thiruvananthapuram", "munnar", "thrissur"],
  },
  {
    slug: "munnar", name: "Munnar", local: "മൂന്നാർ", state: "kerala",
    intro: "Munnar's resorts, cottages and plantation stays compete for honeymooners and families. A 360° tour of the room with the valley view, the pool and the tea gardens turns browsers into guests.",
    fits: ["Resorts and cottages", "Plantation and tree-house stays", "Restaurants", "Adventure and camping stays", "Spice and tea estates"],
    sky: "SkyVUE shows the resort in the valley with the town, the viewpoints and the tea gardens labelled.",
    airspace: "Forest, wildlife and protected areas around Munnar have strict rules. We check your property's zone and status first.",
    nearby: ["kochi", "alappuzha", "thrissur", "madurai"],
  },

  /* ── Telangana ── */
  {
    slug: "hyderabad", name: "Hyderabad", local: "హైదరాబాద్", state: "telangana", aka: ["Secunderabad", "Cyberabad"],
    intro: "Hyderabad's gated communities, villa projects, restaurants, banquet halls and offices in HITEC City and the financial district are bought and booked online first. A 360° tour lets buyers, diners and companies look around before they visit.",
    fits: ["Gated communities and villa projects", "Restaurants and cafés", "Banquet and function halls", "Offices and co-working spaces", "Hospitals"],
    sky: "SkyVUE shows a project's distance to the Outer Ring Road, the metro, HITEC City, schools and the airport — on one screen.",
    airspace: "Rajiv Gandhi International Airport, Begumpet and the city's defence areas are restricted. We check your exact location and apply for permission where needed.",
    nearby: ["warangal", "vijayawada", "bengaluru", "guntur"],
  },
  {
    slug: "warangal", name: "Warangal", local: "వరంగల్", state: "telangana",
    intro: "Warangal is growing fast as an education, healthcare and heritage city: colleges, hospitals, function halls and new residential layouts. Showing them online sets a business apart.",
    fits: ["Colleges and schools", "Hospitals", "Function halls", "Residential layouts", "Hotels"],
    sky: "SkyVUE labels the highway, the railway station and the city's landmarks for layouts and campuses.",
    airspace: "Heritage sites and the airport area have rules. We check before booking.",
    nearby: ["hyderabad", "vijayawada", "guntur", "visakhapatnam"],
  },

  /* ── Andhra Pradesh ── */
  {
    slug: "visakhapatnam", name: "Visakhapatnam", local: "విశాఖపట్నం", state: "andhra-pradesh", aka: ["Vizag", "Vishakapatnam"],
    intro: "Vizag's beach-front hotels, apartments with sea views, hospitals, colleges and restaurants along the coast all sell the view and the location. A 360° tour shows both.",
    fits: ["Hotels and beach resorts", "Sea-view apartments", "Hospitals", "Colleges", "Restaurants and cafés"],
    sky: "SkyVUE shows the sea, the beach road and the city's landmarks from above, with distances.",
    airspace: "Visakhapatnam has a naval base, a port and an airport: much of the city is restricted. We check your exact location and say clearly before booking if a flight is not possible.",
    nearby: ["vijayawada", "guntur", "warangal", "hyderabad"],
  },
  {
    slug: "vijayawada", name: "Vijayawada", local: "విజయవాడ", state: "andhra-pradesh", aka: ["Bezawada"],
    intro: "Vijayawada is a trading and wedding city: function halls, jewellery and textile showrooms, hospitals and new residential projects around the capital region. A tour lets families and buyers see the space first.",
    fits: ["Function and wedding halls", "Jewellery and textile showrooms", "Hospitals", "Residential projects", "Hotels"],
    sky: "SkyVUE labels the Krishna river, the highway and the capital region with distances for layouts and projects.",
    airspace: "Vijayawada airport at Gannavaram and government areas are restricted. We check your location first.",
    nearby: ["guntur", "visakhapatnam", "hyderabad", "tirupati"],
  },
  {
    slug: "guntur", name: "Guntur", local: "గుంటూరు", state: "andhra-pradesh",
    intro: "Guntur's hospitals, colleges, coaching centres, function halls and residential layouts serve a wide region next to the state capital. Few show their space online — a tour stands out.",
    fits: ["Hospitals", "Colleges and coaching centres", "Function halls", "Residential layouts", "Showrooms"],
    sky: "For layouts, SkyVUE labels the highway, the capital region and the nearest schools and hospitals.",
    airspace: "Areas near Vijayawada airport and the capital's government buildings are restricted. We check your exact pin first.",
    nearby: ["vijayawada", "visakhapatnam", "hyderabad", "tirupati"],
  },
  {
    slug: "tirupati", name: "Tirupati", local: "తిరుపతి", state: "andhra-pradesh",
    intro: "Millions of pilgrims come to Tirupati every year, and most book a hotel or a lodge before they leave home. A 360° tour of the rooms, the lobby and the dining hall helps them choose yours.",
    fits: ["Hotels and lodges for pilgrims", "Hospitals", "Colleges and universities", "Function halls", "Residential projects"],
    sky: "SkyVUE shows a hotel's distance to the railway station, the bus stand and the route to Tirumala.",
    airspace: "Drones are not allowed over Tirumala, and Tirupati airport at Renigunta is restricted. We fly only where it is permitted, and tell you before booking.",
    nearby: ["chennai", "vijayawada", "bengaluru", "guntur"],
  },

  /* ── Puducherry ── */
  {
    slug: "puducherry", name: "Puducherry", local: "புதுச்சேரி", state: "puducherry", aka: ["Pondicherry", "Pondy", "Auroville"],
    intro: "Puducherry's heritage stays, boutique hotels, cafés and beach resorts — and Auroville's guest houses — sell character. A 360° tour of the courtyard, the room and the café shows it better than photos.",
    fits: ["Heritage stays and boutique hotels", "Cafés and restaurants", "Beach resorts", "Guest houses in Auroville", "Yoga and wellness centres"],
    sky: "SkyVUE shows a resort's beach and the French Quarter, the promenade and Auroville with distances.",
    airspace: "Puducherry airport and government areas are restricted. We check your exact location before booking.",
    nearby: ["chennai", "tiruchirappalli", "bengaluru", "madurai"],
  },
];

export const stateOf = (c: City) => STATES.find((s) => s.slug === c.state)!;
export const cityBySlug = (slug: string) => CITIES.find((c) => c.slug === slug);
export const citiesIn = (state: string) => CITIES.filter((c) => c.state === state);
/** the six states and union territory we serve, as schema.org places */
export const AREA_SERVED = STATES.map((s) => s.name);
