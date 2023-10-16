import Unfonts from "unplugin-fonts/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    Unfonts({
      custom: {
        families: [
          {
            name: "Telma",
            src: "./assets/fonts/telma/*.(woff2|woff)",
            transform: (font) => {
              font.weight = "300 900";
              font.files.sort((a) => (a.ext === ".woff2" ? -1 : 1));
              return font;
            },
          },
        ],
        display: "swap",
      },
    }),
  ],
});
