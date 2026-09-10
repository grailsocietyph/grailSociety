import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Grail Society",
    short_name: "Grail Society",
    description: "Grail items you don't have to hunt for",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/GS_logo.jpg",
        sizes: "1512x1512",
        type: "image/jpeg",
      },
    ],
  };
}
