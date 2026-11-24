"use client";

import Error from "@/components/feedback/errors/GeneralError";
import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<LoadingPage />}>
      {/* //? Show the loading screen first. When the Error component finishes loading, replace it with the actual error content. */}
      <Error />
    </Suspense>
  );
}

//? Suspense Waits for something (like a lazy component or data)
//? fallback={<LoadingPage />} -- What to show while waiting
//? <Error /> The main component that will load after suspense is resolved
