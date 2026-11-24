import localFont from "next/font/local";

// * Self-hosted Plus Jakarta Sans (latin subset, variable weight 200–800).
// * Files live in public/fonts and are committed to the repo, so production
// * builds never touch fonts.googleapis.com — no network = no build failure.
export const plusJakarta = localFont({
  src: [
    {
      path: "../../public/fonts/PlusJakartaSans-VariableFont_wght.woff2",
      weight: "200 800",
      style: "normal",
    },
    {
      path: "../../public/fonts/PlusJakartaSans-Italic-VariableFont_wght.woff2",
      weight: "200 800",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});
