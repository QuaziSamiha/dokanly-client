// components/layout/scripts/FacebookPixel.tsx
"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import * as pixel from "@/lib/analytics/fpixel";

/**
 * Script Execution: The next/script component loads pixel.js with the
 * afterInteractive strategy, meaning it waits for the main thread to be free.
 */

const FacebookPixel = () => {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname(); // TO DETECT ROUTE CHANGES 
  // In Next.js App Router: navigation is client-side - pages don't fully reload - So Meta Pixel would NOT automatically track route changes. -You must manually track them.

  //* This fires on every route change
  useEffect(() => {
    if (!loaded) return;
    pixel.pageview();
  }, [pathname, loaded]);

  return (
    <div>
      {/* //*Next.js's built-in next/script component to load the pixel asynchronously without blocking page performance. */}
      <Script
        id="fb-pixel"
        src="/scripts/pixel.js" // *
        strategy="afterInteractive"
        onLoad={() => {
          // console.log("Script loaded successfully"); //* check if the script is being blocked by your browser or a 404 error.
          return setLoaded(true);
        }}
        data-pixel-id={pixel.FB_PIXEL_ID}
      />
    </div>
  );
};

export default FacebookPixel;

/**
 * https://api.naturacarebd.com/n-care/api/v1/feeds/datafeed.csv
 */
