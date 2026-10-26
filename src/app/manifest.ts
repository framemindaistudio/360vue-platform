import type { MetadataRoute } from "next";

/** The public website's manifest. HQ lives at /hq on the same address. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "360VUE — See Every Angle",
    short_name: "360VUE",
    description: "360° virtual tours, photography and immersive experiences for businesses.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E0B08",
    theme_color: "#0E0B08",
    lang: "en-IN",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
