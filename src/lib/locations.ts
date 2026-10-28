/**
 * Where 360VUE works. South India (with Goa next door) is the home ground: every state and city here has a page with
 * copy written for that place. The rest of India is served on request, when the calendar has room (INDIA_WIDE).
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
  /** the language of `local`, for the lang attribute */
  lang: string;
  intro: string;
  /** tourist places in the state; `city` links one to the nearest city page */
  places: { name: string; city?: string }[];
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
  {
    slug: "karnataka", name: "Karnataka", local: "ಕರ್ನಾಟಕ", lang: "kn",
    intro: "From Bengaluru's cafés, offices and apartment launches to coastal resorts in Udupi and coffee-estate homestays in Coorg and Chikkamagaluru.",
    places: [
      { name: "Mysuru Palace", city: "mysuru" }, { name: "Srirangapatna", city: "mysuru" }, { name: "Coorg", city: "coorg" }, { name: "Chikkamagaluru", city: "chikkamagaluru" },
      { name: "Hampi", city: "hampi" }, { name: "Badami, Aihole & Pattadakal", city: "hampi" }, { name: "Vijayapura (Gol Gumbaz)" }, { name: "Belur & Halebidu" },
      { name: "Shravanabelagola" }, { name: "Gokarna", city: "gokarna" }, { name: "Murudeshwar", city: "gokarna" }, { name: "Udupi & Malpe", city: "udupi-manipal" },
      { name: "Jog Falls" }, { name: "Dandeli" }, { name: "Kabini", city: "mysuru" }, { name: "Bandipur & Nagarhole", city: "mysuru" },
      { name: "Sakleshpur" }, { name: "Kudremukh", city: "chikkamagaluru" }, { name: "Agumbe" }, { name: "Nandi Hills", city: "bengaluru" }, { name: "Karwar", city: "gokarna" },
    ],
  },
  {
    slug: "tamil-nadu", name: "Tamil Nadu", local: "தமிழ்நாடு", lang: "ta",
    intro: "Chennai's showrooms and hospitals, Coimbatore's textile and engineering businesses, Madurai's hotels near the temple, and hill resorts in Ooty.",
    places: [
      { name: "Mahabalipuram", city: "mahabalipuram" }, { name: "Kanchipuram", city: "chennai" }, { name: "Madurai Meenakshi Temple", city: "madurai" }, { name: "Ooty", city: "ooty" },
      { name: "Coonoor", city: "ooty" }, { name: "Kodaikanal", city: "kodaikanal" }, { name: "Yercaud" }, { name: "Yelagiri" },
      { name: "Valparai", city: "coimbatore" }, { name: "Mudumalai", city: "ooty" }, { name: "Thanjavur", city: "tiruchirappalli" }, { name: "Kumbakonam", city: "tiruchirappalli" },
      { name: "Srirangam", city: "tiruchirappalli" }, { name: "Rameswaram", city: "rameswaram" }, { name: "Kanyakumari", city: "kanyakumari" }, { name: "Chettinad (Karaikudi)", city: "madurai" },
      { name: "Tiruvannamalai" }, { name: "Velankanni" }, { name: "Courtallam" }, { name: "Hogenakkal" },
    ],
  },
  {
    slug: "kerala", name: "Kerala", local: "കേരളം", lang: "ml",
    intro: "Kochi's hotels and cafés, Thiruvananthapuram's hospitals and colleges, houseboats and lake resorts in Alappuzha, and tea-country stays in Munnar.",
    places: [
      { name: "Munnar", city: "munnar" }, { name: "Alappuzha backwaters", city: "alappuzha" }, { name: "Kumarakom", city: "alappuzha" }, { name: "Fort Kochi", city: "kochi" },
      { name: "Thekkady (Periyar)", city: "thekkady" }, { name: "Vagamon", city: "kochi" }, { name: "Wayanad", city: "wayanad" }, { name: "Kovalam", city: "kovalam" },
      { name: "Varkala", city: "varkala" }, { name: "Poovar", city: "kovalam" }, { name: "Ponmudi", city: "thiruvananthapuram" }, { name: "Athirappilly", city: "thrissur" },
      { name: "Guruvayur", city: "thrissur" }, { name: "Marari Beach", city: "alappuzha" }, { name: "Bekal" }, { name: "Kannur" }, { name: "Sabarimala" },
    ],
  },
  {
    slug: "telangana", name: "Telangana", local: "తెలంగాణ", lang: "te",
    intro: "Hyderabad's restaurants, gated communities, tech-park offices and banquet halls, and growing education and healthcare in Warangal.",
    places: [
      { name: "Charminar", city: "hyderabad" }, { name: "Golconda Fort", city: "hyderabad" }, { name: "Ramoji Film City", city: "hyderabad" }, { name: "Hussain Sagar", city: "hyderabad" },
      { name: "Ramappa Temple", city: "warangal" }, { name: "Thousand Pillar Temple", city: "warangal" }, { name: "Laknavaram Lake", city: "warangal" }, { name: "Ananthagiri Hills", city: "hyderabad" },
      { name: "Yadagirigutta", city: "hyderabad" }, { name: "Nagarjuna Sagar" }, { name: "Bhadrachalam" }, { name: "Kuntala Waterfall" }, { name: "Medak Cathedral" },
    ],
  },
  {
    slug: "andhra-pradesh", name: "Andhra Pradesh", local: "ఆంధ్రప్రదేశ్", lang: "te",
    intro: "Beach-side hotels and apartments in Visakhapatnam, wedding halls and showrooms in Vijayawada and Guntur, and pilgrim hotels in Tirupati.",
    places: [
      { name: "Tirupati & Tirumala", city: "tirupati" }, { name: "Srikalahasti", city: "tirupati" }, { name: "Horsley Hills", city: "tirupati" }, { name: "RK Beach, Vizag", city: "visakhapatnam" },
      { name: "Araku Valley", city: "araku-valley" }, { name: "Borra Caves", city: "araku-valley" }, { name: "Lambasingi", city: "araku-valley" }, { name: "Kanaka Durga Temple", city: "vijayawada" },
      { name: "Bhavani Island", city: "vijayawada" }, { name: "Amaravati", city: "guntur" }, { name: "Srisailam" }, { name: "Gandikota" }, { name: "Lepakshi" },
      { name: "Puttaparthi" }, { name: "Konaseema" }, { name: "Papikondalu" }, { name: "Rajahmundry" },
    ],
  },
  {
    slug: "goa", name: "Goa", local: "गोंय", lang: "kok",
    intro: "Beach resorts, villas and holiday homes, boutique hotels, beach shacks and cafés, and Panaji's heritage quarter — almost all booked online by visitors who have never seen the place.",
    places: [
      { name: "Panaji & Fontainhas", city: "panaji" }, { name: "Old Goa churches", city: "panaji" }, { name: "Divar Island", city: "panaji" }, { name: "Miramar", city: "panaji" },
      { name: "Calangute & Baga", city: "north-goa" }, { name: "Candolim", city: "north-goa" }, { name: "Anjuna & Vagator", city: "north-goa" }, { name: "Morjim & Ashwem", city: "north-goa" },
      { name: "Arambol", city: "north-goa" }, { name: "Fort Aguada", city: "north-goa" }, { name: "Chapora Fort", city: "north-goa" }, { name: "Palolem", city: "south-goa" },
      { name: "Agonda", city: "south-goa" }, { name: "Colva & Benaulim", city: "south-goa" }, { name: "Cavelossim & Varca", city: "south-goa" }, { name: "Margao", city: "south-goa" },
      { name: "Dudhsagar Falls", city: "south-goa" },
    ],
  },
  {
    slug: "puducherry", name: "Puducherry", local: "புதுச்சேரி", lang: "ta",
    intro: "Heritage stays and cafés in the French Quarter, beach resorts and boutique hotels along the East Coast Road.",
    places: [
      { name: "White Town (French Quarter)", city: "puducherry" }, { name: "Promenade Beach", city: "puducherry" }, { name: "Auroville", city: "puducherry" },
      { name: "Paradise Beach", city: "puducherry" }, { name: "Serenity Beach", city: "puducherry" }, { name: "Karaikal" },
    ],
  },
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
    nearby: ["belagavi", "hampi", "gokarna", "north-goa"],
  },
  {
    slug: "belagavi", name: "Belagavi", local: "ಬೆಳಗಾವಿ", state: "karnataka", aka: ["Belgaum"],
    intro: "Belagavi sits between Karnataka, Maharashtra and Goa, with a large cantonment, industries, hospitals, colleges and wedding venues serving the whole region. A tour reaches families and clients across all three states.",
    fits: ["Wedding halls and lawns", "Hospitals and colleges", "Industrial units and showrooms", "Residential projects", "Hotels and resorts"],
    sky: "SkyVUE labels the highway, the railway station and the city's landmarks for residential projects and resorts.",
    airspace: "The cantonment and the surroundings of Belagavi airport are restricted zones. We check the zone for your exact pin first.",
    nearby: ["hubballi-dharwad", "north-goa", "panaji", "bengaluru"],
  },

  {
    slug: "hampi", name: "Hampi", local: "ಹಂಪಿ", state: "karnataka", aka: ["Hosapete", "Hospet", "Anegundi", "Kamalapura"],
    intro: "Hampi's ruins draw travellers from across India and the world, and they stay in the resorts, homestays and guest houses around Hosapete, Kamalapura and across the river in Anegundi. Most book from far away — a 360° tour of the room, the courtyard and the view of the boulders helps them choose.",
    fits: ["Heritage resorts and boutique hotels", "Homestays and guest houses", "Cafés and restaurants", "Hotels in Hosapete", "Tour operators and experience stays"],
    sky: "SkyVUE shows a resort among the boulders and paddy fields, with the Virupaksha temple, the river and Hosapete labelled with distances.",
    airspace: "Hampi's monuments are protected by the Archaeological Survey of India, and drones near them need ASI permission. We fly over your property only where it is allowed, and check before booking.",
    nearby: ["hubballi-dharwad", "gokarna", "bengaluru", "belagavi"],
  },
  {
    slug: "gokarna", name: "Gokarna", local: "ಗೋಕರ್ಣ", state: "karnataka", aka: ["Om Beach", "Kudle Beach"],
    intro: "Gokarna is a temple town and a beach escape at once: pilgrims come for the Mahabaleshwar temple, travellers for Om, Kudle and Half Moon beaches. Beach huts, resorts, cafés and homestays all compete online — a tour shows the sea view that photos never quite capture.",
    fits: ["Beach resorts and huts", "Homestays and guest houses", "Cafés and restaurants", "Yoga and wellness retreats", "Pilgrim lodges"],
    sky: "SkyVUE shows a resort on the cliffs with each beach, the temple and the town labelled with distances — and a tap takes guests inside.",
    airspace: "Coastal security areas and the naval base near Karwar are restricted, and temple areas have rules. We check your exact location before booking.",
    nearby: ["udupi-manipal", "north-goa", "hampi", "hubballi-dharwad"],
  },

  /* ── Tamil Nadu ── */
  {
    slug: "chennai", name: "Chennai", local: "சென்னை", state: "tamil-nadu", aka: ["Madras"],
    intro: "Chennai is a city of showrooms, hospitals, wedding halls and apartment projects — and of families who decide together, often across cities and countries. A 360° tour lets everyone look around from their own phone before the visit.",
    fits: ["Wedding halls and convention centres", "Hospitals and clinics", "Jewellery, furniture and car showrooms", "Apartment projects along OMR and ECR", "Restaurants and hotels"],
    sky: "SkyVUE shows a project's distance to the metro, OMR, the beach, IT parks and schools — on one screen.",
    airspace: "Chennai International Airport, the port and defence areas are restricted. We check your exact location and apply for permission where possible.",
    nearby: ["mahabalipuram", "puducherry", "bengaluru", "tirupati"],
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
    nearby: ["kodaikanal", "rameswaram", "tiruchirappalli", "kanyakumari"],
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

  {
    slug: "kodaikanal", name: "Kodaikanal", local: "கொடைக்கானல்", state: "tamil-nadu", aka: ["Kodai"],
    intro: "Kodaikanal's cottages, resorts and heritage bungalows sell cool air, the lake and valley views to families and honeymooners from Chennai, Bengaluru and Madurai. A 360° tour of the room with the view decides the booking.",
    fits: ["Resorts and cottages", "Heritage bungalows and homestays", "Boarding schools", "Restaurants and cafés", "Holiday homes for sale"],
    sky: "SkyVUE shows the resort on the hillside with the lake, the town and the viewpoints labelled with distances.",
    airspace: "Kodaikanal Wildlife Sanctuary and forest areas around the town have strict rules. We check your property's zone and forest status first.",
    nearby: ["madurai", "coimbatore", "munnar", "thekkady"],
  },
  {
    slug: "mahabalipuram", name: "Mahabalipuram", local: "மாமல்லபுரம்", state: "tamil-nadu", aka: ["Mamallapuram", "ECR", "East Coast Road"],
    intro: "Mahabalipuram's Shore Temple and the beach resorts along the East Coast Road make it Chennai's weekend escape and a stop for every visitor to Tamil Nadu. Resorts, villas, event venues and beach homes all win when guests can look around first.",
    fits: ["Beach resorts on ECR", "Villas and holiday homes", "Wedding and event venues", "Restaurants and cafés", "Plot and villa projects on ECR"],
    sky: "SkyVUE shows a resort's beach front with the Shore Temple, the ECR and Chennai labelled with distances.",
    airspace: "The monuments are protected by the Archaeological Survey of India, and the Kalpakkam nuclear plant to the south is a no-fly area. We check your exact location and tell you before booking if a flight is not possible.",
    nearby: ["chennai", "puducherry", "tiruchirappalli", "kanyakumari"],
  },
  {
    slug: "kanyakumari", name: "Kanyakumari", local: "கன்னியாகுமரி", state: "tamil-nadu", aka: ["Cape Comorin"],
    intro: "At India's southern tip, Kanyakumari's hotels sell one thing above all: a sunrise and sunset view over three seas, with the Vivekananda Rock Memorial and the Thiruvalluvar statue in front. A 360° tour from the room and the rooftop shows exactly that.",
    fits: ["Sea-view hotels and lodges", "Resorts", "Restaurants", "Pilgrim stays", "Homestays"],
    sky: "SkyVUE shows the hotel with the Vivekananda Rock, the statue, the beach and the railway station labelled with distances.",
    airspace: "Coastal security areas are restricted, and the memorials have their own rules. We check your exact location first.",
    nearby: ["kovalam", "thiruvananthapuram", "madurai", "rameswaram"],
  },
  {
    slug: "rameswaram", name: "Rameswaram", local: "இராமேஸ்வரம்", state: "tamil-nadu", aka: ["Dhanushkodi", "Pamban"],
    intro: "Rameswaram receives pilgrims all year for the Ramanathaswamy temple, and travellers for Pamban bridge and Dhanushkodi. Most book a hotel or lodge before they arrive — a tour of the room and the dining hall helps them choose yours.",
    fits: ["Hotels and lodges for pilgrims", "Resorts", "Restaurants", "Homestays", "Function halls"],
    sky: "SkyVUE shows the hotel with the temple, the station, Pamban bridge and the road to Dhanushkodi labelled with distances.",
    airspace: "Rameswaram is close to the international maritime border, with navy and coast guard areas nearby: much of the island is restricted. We check your exact location and say clearly before booking if a flight is not possible.",
    nearby: ["madurai", "kanyakumari", "tiruchirappalli", "chennai"],
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
    nearby: ["kovalam", "varkala", "kanyakumari", "kochi"],
  },
  {
    slug: "kozhikode", name: "Kozhikode", local: "കോഴിക്കോട്", state: "kerala", aka: ["Calicut"],
    intro: "Kozhikode's hospitals, wedding venues, restaurants and textile showrooms serve all of north Kerala, and many of its apartment buyers live in the Gulf. A tour brings the space to them.",
    fits: ["Hospitals", "Wedding venues and convention centres", "Restaurants and cafés", "Textile and jewellery showrooms", "Apartments for buyers abroad"],
    sky: "SkyVUE labels the beach, the railway station and the highway for residential and commercial projects.",
    airspace: "Calicut International Airport and nearby restricted areas need permission. We check your exact pin first.",
    nearby: ["wayanad", "thrissur", "kochi", "mangaluru"],
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
    nearby: ["kochi", "thekkady", "kodaikanal", "alappuzha"],
  },

  {
    slug: "wayanad", name: "Wayanad", local: "വയനാട്", state: "kerala", aka: ["Kalpetta", "Vythiri", "Sulthan Bathery"],
    intro: "Wayanad's resorts, tree houses, plantation stays and homestays draw weekend travellers from Bengaluru, Mysuru and Kozhikode. The rooms are only half the story — a 360° tour shows the forest, the infinity pool and the mist.",
    fits: ["Resorts and tree houses", "Plantation and homestays", "Wellness and ayurveda retreats", "Restaurants", "Estate land for sale"],
    sky: "SkyVUE shows the resort in the hills with Banasura Sagar, Chembra peak and Kalpetta labelled with distances.",
    airspace: "Wayanad Wildlife Sanctuary and the forest areas have strict rules. We check your property's zone and forest status before booking.",
    nearby: ["kozhikode", "coorg", "mysuru", "ooty"],
  },
  {
    slug: "thekkady", name: "Thekkady", local: "തേക്കടി", state: "kerala", aka: ["Kumily", "Periyar"],
    intro: "Thekkady's resorts, homestays and spice-plantation stays sit at the edge of the Periyar Tiger Reserve, and guests choose on nature and quiet. A 360° tour of the cottage, the garden and the plantation walk shows them both.",
    fits: ["Resorts and jungle lodges", "Homestays", "Spice-plantation stays", "Ayurveda centres", "Restaurants"],
    sky: "SkyVUE shows a resort on the plantation with Kumily town and the tiger reserve boundary labelled with distances.",
    airspace: "Drones are not allowed over the Periyar Tiger Reserve, and nearby forest areas have rules. We fly only over permitted private land, and check before booking.",
    nearby: ["munnar", "kodaikanal", "kochi", "madurai"],
  },
  {
    slug: "varkala", name: "Varkala", local: "വർക്കല", state: "kerala", aka: ["Varkala Cliff", "Papanasam Beach"],
    intro: "Varkala's cliff-top cafés, guest houses, yoga retreats and ayurveda resorts look straight down to the sea, and most guests are travellers comparing options on their phones. A 360° tour from the cliff edge does the selling.",
    fits: ["Cliff-top guest houses and resorts", "Cafés and restaurants", "Yoga and ayurveda retreats", "Homestays", "Villas and holiday homes"],
    sky: "SkyVUE shows the cliff with the beach, the Janardhana Swamy temple and the railway station labelled with distances.",
    airspace: "Coastal and temple areas have rules. We check your exact location before booking.",
    nearby: ["thiruvananthapuram", "kovalam", "alappuzha", "kochi"],
  },
  {
    slug: "kovalam", name: "Kovalam", local: "കോവളം", state: "kerala", aka: ["Lighthouse Beach", "Poovar"],
    intro: "Kovalam's beach resorts, ayurveda hospitals and boutique hotels serve travellers from India and abroad, many booking treatments weeks ahead. A tour of the treatment rooms, the pool and the beach builds the trust they need to book.",
    fits: ["Beach resorts and hotels", "Ayurveda hospitals and resorts", "Restaurants", "Homestays", "Villas"],
    sky: "SkyVUE shows the resort with the Lighthouse Beach, Thiruvananthapuram and the airport labelled with distances.",
    airspace: "Thiruvananthapuram airport is close, and the Vizhinjam port and coastal security areas are restricted. We check your exact location first.",
    nearby: ["thiruvananthapuram", "varkala", "kanyakumari", "alappuzha"],
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
    nearby: ["araku-valley", "vijayawada", "guntur", "hyderabad"],
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

  {
    slug: "araku-valley", name: "Araku Valley", local: "అరకు లోయ", state: "andhra-pradesh", aka: ["Araku", "Borra Caves", "Lambasingi"],
    intro: "Araku Valley's resorts, cottages and coffee-estate stays draw families from Visakhapatnam and across Andhra Pradesh and Telangana for the valley views, the coffee and Borra Caves. A 360° tour of the cottage and the valley brings them to you.",
    fits: ["Resorts and cottages", "Coffee-estate stays", "Homestays", "Restaurants", "Camping and adventure stays"],
    sky: "SkyVUE shows the resort in the valley with Borra Caves, the coffee museum and the road to Vizag labelled with distances.",
    airspace: "Forest areas and the Eastern Ghats have rules, and some areas need local permission. We check your property's zone before booking.",
    nearby: ["visakhapatnam", "vijayawada", "guntur", "warangal"],
  },

  /* ── Goa ── */
  {
    slug: "north-goa", name: "North Goa", local: "उत्तर गोंय", state: "goa", aka: ["Calangute", "Baga", "Candolim", "Anjuna", "Vagator", "Mapusa"],
    intro: "North Goa's beach resorts, private villas, holiday homes and cafés compete for the same visitors, who book from their phones weeks ahead. A 360° tour of the pool, the rooms and the walk to the beach is what makes them choose yours.",
    fits: ["Private villas and holiday homes", "Beach resorts and boutique hotels", "Cafés, shacks and restaurants", "Wedding and event venues", "Villa and plot projects for second-home buyers"],
    sky: "SkyVUE shows a villa or resort with the beach, the nearest village, the airport road and the sea labelled with distances.",
    airspace: "Manohar International Airport at Mopa and coastal security areas are restricted, and beaches can be crowded — we fly only where and when it is permitted and safe, and check your exact location before booking.",
    nearby: ["panaji", "south-goa", "belagavi", "hubballi-dharwad"],
  },
  {
    slug: "panaji", name: "Panaji", local: "पणजी", state: "goa", aka: ["Panjim", "Old Goa", "Porvorim"],
    intro: "Panaji mixes Goa's government and business with heritage hotels in Fontainhas, restaurants along the river, and offices and apartments in Porvorim and Dona Paula. A tour helps visitors and buyers see inside before they come.",
    fits: ["Heritage hotels and guest houses", "Restaurants and cafés", "Offices and showrooms", "Apartments and villas", "Event and conference venues"],
    sky: "SkyVUE shows a property with the Mandovi river, the old city, Miramar beach and the bridges labelled with distances.",
    airspace: "Government buildings and the airports nearby make parts of Panaji restricted. We check your exact location before booking.",
    nearby: ["north-goa", "south-goa", "belagavi", "mangaluru"],
  },
  {
    slug: "south-goa", name: "South Goa", local: "दक्षिण गोंय", state: "goa", aka: ["Margao", "Palolem", "Colva", "Benaulim", "Cavelossim", "Agonda"],
    intro: "South Goa's quieter beaches draw luxury resorts, beach-hut stays, homestays and heritage Portuguese houses. Guests choose on atmosphere — a 360° tour shows the room, the garden and the beach better than any photo.",
    fits: ["Luxury and beach resorts", "Beach huts and eco stays", "Heritage Portuguese homes", "Wedding venues", "Villas and holiday homes"],
    sky: "SkyVUE shows a resort's beach and its distance to Margao, the railway station and the airport.",
    airspace: "Dabolim airport is a naval air station (INS Hansa) and is restricted, as are coastal security areas. We check your exact location and tell you before booking if a flight is not possible.",
    nearby: ["panaji", "north-goa", "udupi-manipal", "belagavi"],
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
/** how we say that we also work beyond South India */
export const INDIA_WIDE = "Anywhere else in India, we come on request when our calendar has room — travel and stay billed at actual cost and shown on your quote before you book.";

/** the states and union territory we serve, as schema.org places */
export const AREA_SERVED = STATES.map((s) => s.name);
