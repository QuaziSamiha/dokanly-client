"use client";

import { useEffect, useState } from "react";

/**
 * False during the server render and the first client render, true after.
 * The login cookie is only readable in the browser, so UI that depends on who
 * is signed in must wait for this, or the server and client HTML differ
 * (a hydration error).
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  return hasMounted;
}
