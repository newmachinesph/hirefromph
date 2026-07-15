import type { MetadataRoute } from "next";

// Installable + offline. Serves the audience directly: repeat visits cost almost
// no mobile data, and the site opens even on a dropped connection.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DevUp — Developing Upwards",
    short_name: "DevUp",
    description:
      "Open learning for Filipino online professionals. Build the online career you actually own.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f6f4",
    theme_color: "#0d9488",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
