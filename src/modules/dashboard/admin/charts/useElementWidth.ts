"use client";

import { useEffect, useRef, useState } from "react";

//* Tracks an element's content width so SVG charts can draw in real pixels
//* (crisp 2px lines and readable labels at every breakpoint).
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}
