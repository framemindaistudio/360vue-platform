/**
 * Everything a 360VUE tour can do, in the customer's words — grouped by what it does for their business,
 * and who it is for. Each feature says how you get it: in every tour, as a priced add-on (see /pricing),
 * as part of a SkyVUE or 3D plan, or quoted on request. Never name the tour software we build on.
 */

export type How = "included" | "addon" | "plan" | "request";

export const HOW_LABEL: Record<How, string> = {
  included: "In every tour",
  addon: "Add-on",
  plan: "SkyVUE / 3D plan",
  request: "On request",
};

export interface Feature {
  title: string;
  text: string;
  how: How;
}

export interface FeatureGroup {
  id: string;
  icon: string;
  eyebrow: string;
  title: string;
  intro: string;
  features: Feature[];
}

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "walk",
    icon: "Footprints",
    eyebrow: "Walk, don't scroll",
    title: "Customers move through your space like they are standing in it.",
    intro: "No app, no instructions. They open a link and start walking.",
    features: [
      { title: "Room-to-room arrows", text: "Tap an arrow on the floor to step into the next room — the way people already use Street View.", how: "included" },
      { title: "Every direction, sharp", text: "Drag or turn the phone to look up, down and all around. Pinch to zoom into the details.", how: "included" },
      { title: "Scene strip & menu", text: "Thumbnails of every room along the bottom, and a menu grouped by area — Rooms, Dining, Pool — to jump straight there.", how: "included" },
      { title: "Little-planet opening", text: "The tour opens with the whole space curled into a tiny planet, then unrolls into the first room. People remember it.", how: "included" },
      { title: "Gyroscope & VR mode", text: "Move the phone to look around, or drop it into a VR headset for the full feeling of being there.", how: "included" },
      { title: "Full screen & share", text: "One tap to go full screen, one tap to send the tour to family or a partner on WhatsApp.", how: "included" },
      { title: "Several floors", text: "A level switcher and stair connections, so a villa, hotel or school reads as one building.", how: "addon" },
      { title: "360° video scenes", text: "Moving water, a busy dining room, a live kitchen — up to 8K 360° video placed inside the tour.", how: "addon" },
    ],
  },
  {
    id: "story",
    icon: "BookOpen",
    eyebrow: "Tell the story inside the space",
    title: "Every corner can explain itself.",
    intro: "The questions your staff answer every day, answered inside the tour.",
    features: [
      { title: "Info points", text: "Tap a dot for text and photos: the menu, room rates, what the package includes, the size of the hall.", how: "addon" },
      { title: "Labels on what matters", text: "Small callouts on the pool, the stage, the free Wi-Fi corner or the new collection — styled in your colours.", how: "addon" },
      { title: "Photo albums", text: "A gallery that opens from a hotspot: dishes, past weddings, finished projects, detailed close-ups.", how: "addon" },
      { title: "Your videos, inside the tour", text: "A play button that opens your YouTube or Instagram film — a reel, a chef's story, a client testimonial.", how: "addon" },
      { title: "Brochures & menus", text: "A PDF menu, price list, site plan or brochure opens right where it is relevant.", how: "addon" },
      { title: "Day and night", text: "Switch the same room between daylight and evening lights — the terrace at sunset, the hall lit for a reception.", how: "addon" },
      { title: "Room-type switch", text: "Show a double and a twin set-up of the same room, or two décor options of the same hall, without a second tour.", how: "addon" },
      { title: "Festive effects", text: "Gentle falling hearts, stars or snow over a scene — for wedding venues, festive offers and seasonal campaigns.", how: "addon" },
    ],
  },
  {
    id: "enquire",
    icon: "MessageCircle",
    eyebrow: "From looking to booking",
    title: "The moment they like it, they can reach you.",
    intro: "A tour that only impresses is half a job. Ours ends in a call, a chat or a booking.",
    features: [
      { title: "Contact panel", text: "Your logo, phone, email and social links beside every scene, with a Call button.", how: "included" },
      { title: "WhatsApp, booking & directions", text: "Buttons that open a WhatsApp chat, your booking page or Google Maps directions — from inside the tour.", how: "addon" },
      { title: "Links to an exact view", text: "Send a link that opens on the room, the table or the product you are talking about, facing the right way.", how: "included" },
      { title: "Book from the room", text: "\"Like this room? Book a visit\" — a message and button placed in the scene that sells it.", how: "addon" },
      { title: "Website button", text: "An \"Open tour\" button beside \"Book now\" on your website, so visitors see before they pay.", how: "included" },
    ],
  },
  {
    id: "site",
    icon: "Map",
    eyebrow: "Show the whole site",
    title: "From the sky to the sofa, in one link.",
    intro: "For resorts, layouts, campuses and anything too big for one photo.",
    features: [
      { title: "SkyVUE aerial opening", text: "A drone 360° from up to 120 m with the highway, school, hospital and lake labelled with distances.", how: "plan" },
      { title: "Fly down into any building", text: "Tap the clubhouse, a cottage or the entrance in the aerial view and its ground 360° opens. Tap back to fly up.", how: "plan" },
      { title: "Plot & boundary overlays", text: "Your boundary outlined, plots numbered and coloured, road names written in — on the aerial view itself.", how: "plan" },
      { title: "Labels that appear as you zoom", text: "Zoom out and see the phases; zoom in and each plot number appears. Big sites stay readable.", how: "plan" },
      { title: "Location map", text: "A small map with every 360° point on it. Tap a point to jump there — ideal for resorts and campuses.", how: "addon" },
      { title: "Floor plans with \"you are here\"", text: "A floor plan with room names and sizes; a dot shows where the visitor is standing and which way they face.", how: "plan" },
      { title: "3D dollhouse", text: "The whole home or office as a 3D model the visitor can spin, then step into any room.", how: "plan" },
      { title: "Construction progress", text: "The same drone positions re-flown as the project rises, for buyers who booked off-plan.", how: "plan" },
    ],
  },
  {
    id: "sell",
    icon: "ShoppingBag",
    eyebrow: "Sell from inside the tour",
    title: "A showroom that never closes.",
    intro: "For furniture, sarees, jewellery, tiles, sanitaryware, vehicles and anything people like to see in place.",
    features: [
      { title: "Tap a product", text: "Outline a sofa, a chair or a display; tapping it opens photos, the spec sheet and the price.", how: "plan" },
      { title: "Enquire about this", text: "Each product carries its own WhatsApp or enquiry button, so you know exactly what they asked about.", how: "plan" },
      { title: "Share one product", text: "Send a customer a link that opens on one product in its place on the shop floor.", how: "included" },
    ],
  },
  {
    id: "brand",
    icon: "Palette",
    eyebrow: "Unmistakably yours",
    title: "Your brand, from the first second to the last.",
    intro: "Your customers see your name — not ours, and not anyone else's.",
    features: [
      { title: "Welcome screen & theme", text: "Your colours, icons and a welcome screen when the tour opens. Your logo where the tripod stood.", how: "addon" },
      { title: "Music or a voice welcome", text: "Soft background music, or a recorded welcome in your own voice. Visitors can mute it.", how: "addon" },
      { title: "More languages", text: "The whole tour in Kannada, Tamil, Telugu, Malayalam, Hindi or English — up to five languages, chosen by the visitor.", how: "addon" },
      { title: "QR posters & standees", text: "Print-ready QR artwork for the reception desk, menus, brochures and visiting cards.", how: "addon" },
      { title: "Private tours", text: "Password protection for unreleased projects, investor previews or members-only spaces.", how: "addon" },
    ],
  },
  {
    id: "found",
    icon: "Search",
    eyebrow: "Found where they look",
    title: "One capture. Every place customers find you.",
    intro: "The same tour works on Google, your website, Instagram, WhatsApp and print.",
    features: [
      { title: "Google Maps & Street View", text: "Published so people can walk in from your Maps listing (eligible places; Google approves in 1–7 days).", how: "included" },
      { title: "Website embed", text: "Code to put the tour on any page of your website. We can place it with your developer.", how: "included" },
      { title: "One link for everything", text: "WhatsApp status, Instagram bio, Facebook, ads and email — the same link, always up to date.", how: "included" },
      { title: "Any phone, no app", text: "Works in the browser on any phone, tablet or computer. Nothing to install.", how: "included" },
      { title: "Visitor stats", text: "How many people opened the tour and where they came from, every month.", how: "addon" },
    ],
  },
  {
    id: "polish",
    icon: "Sparkles",
    eyebrow: "Finished by us",
    title: "Clean, bright and ready before you see it.",
    intro: "You approve a finished tour, not a folder of raw files.",
    features: [
      { title: "Tripod and camera removed", text: "The floor under the camera is cleaned up, so every scene looks natural.", how: "included" },
      { title: "Faces and number plates blurred", text: "Guests, staff and parked cars stay private.", how: "included" },
      { title: "Colour and light corrected", text: "Windows that are not blown out, rooms that are not dark, colours that match real life.", how: "included" },
      { title: "AI clean-up", text: "Remove a stray bin, a cable or passers-by from a scene.", how: "addon" },
      { title: "Virtual staging", text: "Furnish an empty flat or dress a hall for an occasion — always marked as staged, never passed off as real.", how: "addon" },
    ],
  },
];

/** The vision, in four beats — used on the features page and the home page. */
export const VISION = {
  line: "Every business in South India should be walkable from a phone.",
  beats: [
    { title: "Today", text: "A customer sees five photos, guesses the rest and often guesses wrong. Many never call. Some drive two hours and walk away." },
    { title: "With a tour", text: "They walk in from Google Maps, look in every corner, tap for prices and WhatsApp you from the room they liked." },
    { title: "For you", text: "Fewer wasted visits, more enquiries that are ready to book, and a shop window that is open at midnight." },
    { title: "Where we are going", text: "Thousands of South Indian spaces — from Hampi homestays to Hyderabad showrooms — open to anyone, anywhere, before they travel." },
  ],
};
