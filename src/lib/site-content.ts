import { TERMS } from "@/lib/content/catalog";

/**
 * The words of the public website. Everything here comes from the 360VUE company profile; nothing claims a client,
 * a result, a registration or a number that does not exist. The pictures are illustrative (generated) and the
 * captions say so wherever a picture could be mistaken for client work.
 */

export const NAV = [
  { href: "/services", label: "Services" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/industries", label: "Industries" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQs" },
] as const;

export interface Industry {
  id: string;
  icon: string;
  name: string;
  hook: string;
  shows: string;
  uses: string[];
  /** illustrative photo: <image>.webp and <image>-sm.webp in /public */
  image: string;
}

/** Who a tour pays off for — the businesses we go after first. Shown on /industries, the home page and the booklets. */
export const INDUSTRIES: Industry[] = [
  {
    id: "stays",
    image: "/media/aerial-resort",
    icon: "TreePalm",
    name: "Homestays, resorts & eco-stays",
    hook: "Guests book the room they have already walked into.",
    shows: "Cottages, room types, pool, dining, the view from the balcony — and where it all sits from the sky.",
    uses: ["Aerial opening with nearby sights", "Location map", "WhatsApp & booking buttons", "More languages"],
  },
  {
    id: "hotels",
    image: "/media/hotel",
    icon: "Hotel",
    name: "Hotels",
    hook: "Every room type, compared before checking in.",
    shows: "Lobby, each room category, banquet and meeting rooms, spa, gym and restaurant.",
    uses: ["Scene menu by area", "Room-type switch", "Book from the room", "Google Maps"],
  },
  {
    id: "food",
    image: "/media/cafe",
    icon: "UtensilsCrossed",
    name: "Restaurants, cafés & bars",
    hook: "People choose a table before they choose a dish.",
    shows: "Seating, ambience, private dining, terrace and the kitchen you are proud of.",
    uses: ["Menu PDF inside the tour", "Day and night", "WhatsApp table booking", "Google Maps"],
  },
  {
    id: "venues",
    image: "/media/capture-banquet",
    icon: "PartyPopper",
    name: "Banquet halls & wedding venues",
    hook: "Families from three cities walk the hall together, on one call.",
    shows: "Hall, stage, lawns, dining, rooms for the families, parking.",
    uses: ["Day and night", "Albums of past events", "Festive effects", "Videos inside the tour"],
  },
  {
    id: "property",
    image: "/media/realestate",
    icon: "Building",
    name: "Real-estate developers & agents",
    hook: "Buyers shortlist from home and visit only to sign.",
    shows: "Show flats, amenities, the clubhouse and the view from the balcony.",
    uses: ["Floor plans with \"you are here\"", "3D dollhouse", "Virtual staging", "Book a site visit"],
  },
  {
    id: "land",
    image: "/media/aerial-hero",
    icon: "LandPlot",
    name: "Plotted layouts, farmland & villa projects",
    hook: "Location sells land — so show the location.",
    shows: "Every plot from above, roads, boundaries and the distance to the highway, schools and hospitals.",
    uses: ["Plot & boundary overlays", "Labels that appear as you zoom", "Construction progress", "Private investor previews"],
  },
  {
    id: "retail",
    image: "/media/showroom",
    icon: "Store",
    name: "Showrooms & retail",
    hook: "Browse the floor at 11 pm, walk in at 11 am to buy.",
    shows: "Furniture, sarees, jewellery, tiles, sanitaryware, vehicles — in context, with prices.",
    uses: ["Tap a product", "Enquire about this", "Share one product", "Multi-location tours"],
  },
  {
    id: "education",
    image: "/media/school",
    icon: "GraduationCap",
    name: "Schools, colleges & preschools",
    hook: "Parents see the classrooms before admission day.",
    shows: "Classrooms, labs, library, playground, hostel and transport — without opening the gates.",
    uses: ["Location map of the campus", "More languages", "Info points per facility", "QR on the prospectus"],
  },
  {
    id: "health",
    image: "/media/clinic",
    icon: "Stethoscope",
    name: "Hospitals, clinics & wellness",
    hook: "A nervous patient walks in already knowing the way.",
    shows: "Reception, waiting areas, rooms and treatment spaces — private areas never captured.",
    uses: ["Info points per department", "Directions button", "Google Maps", "More languages"],
  },
  {
    id: "fitness",
    image: "/media/gym",
    icon: "Dumbbell",
    name: "Gyms, studios & sports clubs",
    hook: "Show the equipment, not just the logo.",
    shows: "Floors, equipment, studios, courts, pool and changing rooms.",
    uses: ["Videos of classes", "WhatsApp trial booking", "Labels on equipment", "Google Maps"],
  },
  {
    id: "work",
    image: "/media/office",
    icon: "Briefcase",
    name: "Coworking, offices & factories",
    hook: "Clients and new hires see the place before the first meeting.",
    shows: "Desks, cabins, meeting rooms, the shop floor and the quality lab.",
    uses: ["Floor plans", "Private tours", "Info points", "Website embed"],
  },
  {
    id: "tourism",
    image: "/media/pano-aerial",
    icon: "Mountain",
    name: "Attractions, estates & tourism",
    hook: "Travellers plan the trip around what they have already seen.",
    shows: "Viewpoints, trails, coffee and spice estates, lakes, heritage walks and adventure parks.",
    uses: ["Aerial opening", "Location map", "Info points with history", "More languages"],
  },
];

export const FEATURES = [
  { icon: "Rotate3d", title: "Interactive 360° tours", text: "Spherical photographs at planned viewpoints, stitched and connected into a walkthrough." },
  { icon: "MapPin", title: "Google Maps publishing", text: "Help publishing eligible panoramas to Google Street View, so your listing shows the inside." },
  { icon: "Navigation", title: "Contact from inside the tour", text: "Every tour has a contact panel with your logo, phone, email and a Call button. Add WhatsApp, booking and directions buttons, info points and videos." },
  { icon: "Globe", title: "On your website", text: "An embeddable tour or a shareable link — WhatsApp it, post it, put it on every page." },
  { icon: "Camera", title: "Photography & video", text: "Interior photography, reels and showcase films, delivered in-house by our parent company, FrameMind AI Studio." },
  { icon: "Plane", title: "SkyVUE aerial 360°", text: "Your property from the sky with landmarks and distances labelled. Tap a building or amenity and its 360° opens, so people explore it inside." },
  { icon: "Box", title: "3D & digital twins", text: "Interactive floor plans, virtual showrooms and 3D walkthroughs for larger spaces." },
] as const;

export const DIVISIONS = [
  {
    id: "tours",
    name: "360VUE Tours",
    tag: "Launch priority",
    title: "360° Virtual Tours",
    image: "/media/capture-cafe",
    points: [
      "Spherical 360° photographs captured at selected viewpoints",
      "Panoramas stitched, corrected and processed",
      "Viewpoints connected into an interactive walkthrough",
      "Navigation hotspots, room labels and a branded starting screen where supported",
      "An embeddable tour or shareable link",
      "Help publishing eligible panoramic content to Google Street View",
    ],
  },
  {
    id: "skyvue",
    name: "SkyVUE",
    tag: "Aerial 360°",
    title: "Aerial 360° with landmarks",
    image: "/media/aerial-hero",
    points: [
      "Drone 360° views from up to 120 m, stitched into full spheres",
      "Landmarks labelled with distances: highways, schools, hospitals, malls, lakes",
      "Floating 3D titles and plot or phase overlays for layouts and townships",
      "Standalone, or combined with your ground tour in one link: tap a hotspot to fly down into the lobby, café or flat, and back up",
      "Construction progress re-flights for projects being built",
      "Flown only where airspace permits, after an airspace check",
    ],
  },
  {
    id: "visuals",
    name: "FrameMind Visuals",
    tag: "With FrameMind AI Studio",
    title: "Photography and video",
    image: "/media/aerial-resort",
    points: [
      "Professional interior and architectural photography",
      "Business promotional reels and short films",
      "Hotel, showroom and property showcase videos",
      "Social media content packages",
      "Aerial visuals where legally permitted",
    ],
  },
  {
    id: "spatial",
    name: "360VUE Spatial",
    tag: "Advanced",
    title: "Immersive experiences",
    image: "/media/showroom-virtual",
    points: ["Interactive 3D walkthroughs", "Virtual showrooms and property tours", "Interactive floor plans", "Digital twins for selected commercial spaces", "Custom immersive web experiences"],
  },
] as const;

export const FAQS: { q: string; a: string; group: string }[] = [
  { group: "How it works", q: "What happens from the first call to a live tour?", a: TERMS.process.map((p, i) => `${i + 1}. ${p.title} — ${p.detail}`).join(" ") },
  { group: "How it works", q: "How do I get my space ready for the capture day?", a: "Four things make the difference. Lights on: every light working, and blinds set the same way in every room. Clutter cleared: bags, boxes, cables and paperwork out of sight. People informed: staff and guests know a capture is happening. Private areas listed: tell us what not to capture, and we never do." },
  { group: "How it works", q: "Do I need to be there during the capture?", a: "Someone who can open every room and switch the lights on should be there at the start. After that we work quietly, viewpoint by viewpoint, around your opening hours." },
  { group: "How it works", q: "What do I get at the end?", a: "Delivered: a shareable link and code to put the tour on your website, plus anything else agreed in the quote. Published: eligible panoramas published to Google Maps and Street View, under Google's own rules. Hosted: the tour kept online for 12 months; renewal after that is your choice, never automatic." },
  { group: "How it works", q: "Can I see the tour before it goes live?", a: "Yes. We test it on a phone first — navigation, image clarity, loading and links — then send you a preview link. Your revision rounds are written on the quote." },
  { group: "About 360VUE", q: "Who is behind 360VUE?", a: "360VUE was founded by Hrishikesh Kulkarni (Founder) with Chinmay R M (Co-Founder). 360VUE is a FrameMind AI Studio company: FrameMind AI Studio is our parent company, founded by Chinmay R M." },
  { group: "About 360VUE", q: "Can you also do our photography, video, social media or website?", a: "Yes — through our parent company, FrameMind AI Studio, which delivers photography, videography, social media management, websites, brand identity, custom software, automations and more in-house. See framemindaistudio.com for its full list of services and prices." },
  { group: "Tours", q: "What exactly is a 360° virtual tour?", a: "A set of 360° photographs taken at chosen points in your space, connected so a visitor can look in every direction and move from one point to the next — on a phone, a laptop or a VR headset — as if walking through." },
  { group: "Tours", q: "How many viewpoints will my space need?", a: "It depends on the size and the number of areas. A small café may need a handful; a hotel or banquet venue many more. We plan the viewpoints with you before the capture, and every quote states exactly how many are included." },
  { group: "Tours", q: "How long does a capture take?", a: "We agree a date and time with you during site preparation. Most of a capture day is careful setup at each viewpoint; we plan around your opening hours so we do not disturb customers." },
  { group: "Tours", q: "How long until the tour is delivered?", a: "The delivery timeline is written on your quote. It starts once the advance is received and the capture date is confirmed." },
  { group: "Google Maps", q: "Can the tour appear on Google Maps?", a: "We help publish eligible panoramic content to Google Street View, so it can appear with your business listing. Google decides what it accepts and how it is shown." },
  { group: "Google Maps", q: "Will it improve my ranking or bring more customers?", a: "We do not promise search rankings, visits or sales from Google publication. A tour helps customers understand your space before they visit; what they do next is up to them." },
  { group: "Hosting", q: "How is the tour hosted? Is hosting forever?", a: "Every tour includes 12 months of hosting for its link and website embed. After that, a Hosting & Care plan keeps it online (from a few hundred rupees a month). Your Google Maps listing stays live either way. We remind you before the year ends, and you decide." },
  { group: "Hosting", q: "Can I put the tour on my own website?", a: "Yes. You get an embed code and a shareable link. Website embedding help is available if your developer needs it." },
  { group: "Privacy", q: "What about private areas and people?", a: "Tell us which areas are restricted or private and we will not capture them. Before delivery we remove or blur identifiable people and unintended sensitive information where necessary." },
  { group: "Privacy", q: "Do I need the owner's permission?", a: "If you do not own the space, we need the property owner's permission before the capture. We confirm access and permissions during site preparation." },
  { group: "Pricing", q: "How much does a tour cost?", a: "Tours are priced by scenes — one scene is one 360° viewpoint. Glance (up to 6 scenes) suits a café or clinic, Walkthrough (up to 12) a restaurant or showroom, Showcase (up to 20) a banquet hall or villa, and Grand Tour (up to 35) a hotel or campus. Bigger spaces add scenes individually. Use the price calculator to see your exact price." },
  { group: "Pricing", q: "Can you price by square feet?", a: "Yes. Enter your area in square feet or square metres, the number of floors and the rooms or areas in the price calculator: it works out the scenes your space needs (about one per 350 sq ft of open space, at least one per room, plus a landing for each extra floor) and picks the plan. We confirm the count before the capture." },
  { group: "SkyVUE", q: "What is SkyVUE?", a: "SkyVUE is our aerial 360°: a drone view from up to 120 m with the landmarks around your property labelled and their distances shown — the highway, schools, hospitals, malls, lakes — plus plot numbers and phases for layouts. Buy it on its own, or add an aerial opening scene to your 360° tour." },
  { group: "SkyVUE", q: "Can the aerial view and the inside tour be one link?", a: "Yes. SkyVUE can be on its own, or combined with your 360° ground tour in a single link. Hotspots on the aerial view take visitors down into the lobby, café, rooms or show flat, and a “Back to the sky” hotspot flies them up again. Linking is included at no extra charge when you take both, and we can also add aerial scenes to a 360VUE tour you already have." },
  { group: "SkyVUE", q: "Is it legal to fly a drone over my property?", a: "We check the airspace zone before booking. In green zones flights need no prior permission; near airports and other restricted zones we apply for permission first, or tell you before booking if it is not possible. We fly over your property, not over crowds, and the date depends on safe weather." },
  { group: "Pricing", q: "Do you work outside South India?", a: "Yes. South India — Karnataka, Tamil Nadu, Kerala, Telangana, Andhra Pradesh, Puducherry, and Goa next door — is our home ground, so we are there most often. Anywhere else in India, we come on request when our calendar has room. Travel and stay outside our base area are billed at actual cost and shown on your quote before you book." },
  { group: "Pricing", q: "What comes with every tour, and what can I add?", a: "Every tour includes 360° of every room, arrows to walk between rooms, room names, a contact panel with your logo, phone, email and a Call button, share and full-screen buttons, Google Maps publishing and 12 months of hosting. You can add WhatsApp, booking and directions buttons; info points with text and photos (menus, prices, room details); videos that play from inside the tour; a branded welcome and theme; music or a voice welcome; a location map; and a second language. Each one is priced in the calculator." },
  { group: "Pricing", q: "Is Google Maps publishing extra?", a: "No. Publishing eligible panoramas to Google Maps and Street View is included in every plan, as are 12 months of hosting for your tour link and website embed." },
  { group: "Pricing", q: "How do payments work?", a: "50% advance confirms the booking; the remaining 50% is paid before final handover or activation, as agreed in the quote. Work outside the scope needs your written approval, and hosting or maintenance is billed separately." },
  { group: "Pricing", q: "Are revisions included?", a: "Yes — the number of revision rounds is written on your quote. Extra areas, extra viewpoints or re-capture after changes to the space are quoted separately." },
];
