import type { MetadataRoute } from "next";

// Installable + offline. Serves the audience directly: repeat visits cost almost
// no mobile data, and the site opens even on a dropped connection.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hire From PH — the standard, not the discount",
    short_name: "Hire From PH",
    description:
      "Open learning for Filipino online professionals. Build the online career you keep.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#043882",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
