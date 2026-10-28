/**
 * The words of the public website. Everything here comes from the 360VUE company profile; nothing claims a client,
 * a result, a registration or a number that does not exist. The pictures are illustrative (generated) and the
 * captions say so wherever a picture could be mistaken for client work.
 */

export const NAV = [
  { href: "/services", label: "Services" },
  { href: "/skyvue", label: "SkyVUE" },
  { href: "/pricing", label: "Pricing" },
  { href: "/industries", label: "Industries" },
  { href: "/portfolio", label: "Demo tours" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQs" },
] as const;

export interface Industry {
  id: string;
  name: string;
  short: string;
  image: string;
  icon: string;
  priority: string;
  points: string[];
}

export const INDUSTRIES: Industry[] = [
  {
    id: "restaurants",
    name: "Restaurants & cafés",
    short: "Seating, ambience, interiors and private rooms.",
    image: "/media/cafe",
    icon: "UtensilsCrossed",
    priority: "Very high",
    points: ["Let diners see the seating and ambience before they book", "Show private dining, terraces and party areas", "A tour on your website and your Maps listing"],
  },
  {
    id: "hotels",
    name: "Hotels & resorts",
    short: "Rooms, lobbies, banquet halls and amenities.",
    image: "/media/hotel",
    icon: "Hotel",
    priority: "High",
    points: ["Every room type, walked through", "Lobbies, pools, spas and amenities", "SkyVUE aerial opening scene showing the property and what is nearby"],
  },
  {
    id: "banquets",
    name: "Banquet halls & venues",
    short: "Halls, lawns and stages, walked before the event.",
    image: "/media/capture-banquet",
    icon: "PartyPopper",
    priority: "High",
    points: ["Families and planners walk the hall remotely", "Show stage, seating and décor positions", "Fewer site visits that go nowhere"],
  },
  {
    id: "showrooms",
    name: "Showrooms & retail",
    short: "Layouts, display areas and the shopping experience.",
    image: "/media/showroom",
    icon: "Store",
    priority: "High",
    points: ["Customers explore the floor from home", "Display areas and collections, in context", "Virtual showroom with product hotspots"],
  },
  {
    id: "realestate",
    name: "Real estate",
    short: "Virtual property previews for developers and agents.",
    image: "/media/realestate",
    icon: "Building",
    priority: "High",
    points: ["Show-flats and furnished rentals online", "Commercial spaces for remote buyers", "SkyVUE aerial 360° with plot numbers and distances to landmarks"],
  },
  {
    id: "others",
    name: "Gyms, clinics & offices",
    short: "Facilities and layouts, with care for private areas.",
    image: "/media/gym",
    icon: "Dumbbell",
    priority: "Secondary",
    points: ["Facilities and equipment, explored before joining", "Clinics and offices that put visitors at ease", "Private and sensitive areas never captured"],
  },
];

export const FEATURES = [
  { icon: "Rotate3d", title: "Interactive 360° tours", text: "Spherical photographs at planned viewpoints, stitched and connected into a walkthrough." },
  { icon: "MapPin", title: "Google Maps publishing", text: "Help publishing eligible panoramas to Google Street View, so your listing shows the inside." },
  { icon: "Navigation", title: "Navigation & hotspots", text: "Arrows between viewpoints, room labels, information points and a branded start screen." },
  { icon: "Globe", title: "On your website", text: "An embeddable tour or a shareable link — WhatsApp it, post it, put it on every page." },
  { icon: "Camera", title: "Photography & video", text: "Interior photography, reels and showcase films, delivered in-house by our parent company, FrameMind AI Studio." },
  { icon: "Plane", title: "SkyVUE aerial 360°", text: "A drone 360° with the landmarks around you labelled and their distances — highway, schools, hospital, lake." },
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
      "Standalone, or the opening scene of your ground tour",
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
  { group: "SkyVUE", q: "Is it legal to fly a drone over my property?", a: "We check the airspace zone before booking. In green zones flights need no prior permission; near airports and other restricted zones we apply for permission first, or tell you before booking if it is not possible. We fly over your property, not over crowds, and the date depends on safe weather." },
  { group: "Pricing", q: "Is Google Maps publishing extra?", a: "No. Publishing eligible panoramas to Google Maps and Street View is included in every plan, as are 12 months of hosting for your tour link and website embed." },
  { group: "Pricing", q: "How do payments work?", a: "50% advance confirms the booking; the remaining 50% is paid before final handover or activation, as agreed in the quote. Work outside the scope needs your written approval, and hosting or maintenance is billed separately." },
  { group: "Pricing", q: "Are revisions included?", a: "Yes — the number of revision rounds is written on your quote. Extra areas, extra viewpoints or re-capture after changes to the space are quoted separately." },
];
